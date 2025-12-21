import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Case, CaseDocument } from './schemas/case.schema';
import { Skin, SkinDocument } from './schemas/skin.schema';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { InventoryGateway } from '../websocket/inventory.gateway';

@Injectable()
export class CasesService {
  constructor(
    @InjectModel(Case.name) private caseModel: Model<CaseDocument>,
    @InjectModel(Skin.name) private skinModel: Model<SkinDocument>,
    @InjectModel(Inventory.name)
    private inventoryModel: Model<InventoryDocument>,
    private inventoryGateway: InventoryGateway,
  ) {}

  private buildImageUrl(path: string): string {
    if (!path) return null;
    // 👉 ici on génère un chemin absolu
    const baseUrl = process.env.BASE_URL;
    return `${baseUrl}/uploads/${path}`;
  }

  async findAll(): Promise<any[]> {
    const cases = await this.caseModel
      .find({}, { _id: 1, name: 1, imageUrl: 1 })
      .lean()
      .exec();

    return cases.map((c) => ({
      ...c,
      imageUrl: this.buildImageUrl(c.imageUrl), // ex: "galerie.png" → "http://localhost:3000/uploads/galerie.png"
    }));
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        'Caisse introuvable (supprimée ou inexistante).',
      );
    }

    const caseObj = await this.caseModel.findById(id).lean().exec();
    if (!caseObj) {
      throw new NotFoundException(
        'Caisse introuvable (supprimée ou inexistante).',
      );
    }

    const skins = await this.skinModel
      .find(
        { case_id: new Types.ObjectId(id) },
        { _id: 1, name: 1, rarity: 1, imageUrl: 1 },
      )
      .lean()
      .exec();

    return {
      ...caseObj,
      imageUrl: this.buildImageUrl(caseObj.imageUrl),
      skins: skins.map((s) => ({
        ...s,
        imageUrl: this.buildImageUrl(s.imageUrl),
      })),
    };
  }

  async openCase(caseId: string, userId: string, testRandom?: number) {
    if (!Types.ObjectId.isValid(caseId)) {
      throw new NotFoundException('Caisse introuvable.');
    }

    const caseObj = await this.caseModel.findById(caseId).lean().exec();
    if (!caseObj) throw new NotFoundException('Caisse introuvable.');

    const totalProbability = caseObj.rarityProbabilities.reduce(
      (sum, r) => sum + r.probability,
      0,
    );

    // Vérifier qu'aucune probabilité n'est négative
    if (caseObj.rarityProbabilities.some((r) => r.probability < 0)) {
      throw new UnprocessableEntityException(
        'Probabilités invalides : une probabilité ne peut pas être négative.',
      );
    }

    // Vérifier que la somme est positive
    if (totalProbability <= 0) {
      throw new UnprocessableEntityException('Somme des probabilités nulle.');
    }

    // Tirage aléatoire (toujours un float entre 0 et 1)
    const random =
      testRandom !== undefined
        ? testRandom
        : parseFloat(Math.random().toFixed(8)); // précision 8 décimales

    let cumulative = 0;
    let chosenRarity = null;

    for (const rarity of caseObj.rarityProbabilities) {
      cumulative += rarity.probability / totalProbability;
      if (random <= cumulative) {
        chosenRarity = rarity.rarity;
        break;
      }
    }

    if (!chosenRarity) {
      throw new InternalServerErrorException('Erreur lors du tirage.');
    }

    const skins = await this.skinModel
      .find({ case_id: new Types.ObjectId(caseId), rarity: chosenRarity })
      .select('_id name rarity cost imageUrl')
      .lean()
      .exec();

    if (!skins.length) {
      throw new InternalServerErrorException(
        'Aucun skin trouvé pour cette rareté.',
      );
    }

    const chosenSkin = skins[Math.floor(Math.random() * skins.length)];

    // Enregistrer dans la collection inventories
    await this.inventoryModel.create({
      user_id: new Types.ObjectId(userId),
      skin_id: chosenSkin._id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const inventoryDocs = await this.inventoryModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate('skin_id')
      .lean()
      .exec();

    const inventory = {
      _id: userId,
      totalSkins: inventoryDocs.length,
      totalValue: inventoryDocs.reduce(
        (sum, i: any) => sum + (i.skin_id?.cost || 0),
        0,
      ),
      skins: inventoryDocs.map((i: any) => ({
        skinId: i.skin_id._id,
        name: i.skin_id.name,
        rarity: i.skin_id.rarity,
        cost: i.skin_id.cost,
        imageUrl: this.buildImageUrl(i.skin_id.imageUrl),
        case_id: caseId,
      })),
    };

    // 🚀 PUSH WEB SOCKET (TEMPS RÉEL)
    this.inventoryGateway.emitInventoryUpdate(userId, inventory);

    // 🔁 RÉPONSE HTTP (pour l’animation roulette)
    return {
      _id: caseId,
      userId,
      randomNumber: random,
      rarityChosen: chosenRarity,
      skin: {
        skinId: chosenSkin._id,
        name: chosenSkin.name,
        rarity: chosenSkin.rarity,
        cost: chosenSkin.cost,
        imageUrl: chosenSkin.imageUrl,
      },
    };
  }
  async updateProbabilities(
    caseId: string,
    rarityProbabilities: { rarity: string; probability: number }[],
  ) {
    if (!Types.ObjectId.isValid(caseId)) {
      throw new NotFoundException('Caisse introuvable.');
    }

    const caseObj = await this.caseModel.findById(caseId).exec();
    if (!caseObj) {
      throw new NotFoundException('Caisse introuvable.');
    }

    caseObj.rarityProbabilities = rarityProbabilities;
    await caseObj.save();

    return {
      _id: caseId,
      message: 'Probabilités mises à jour avec succès',
    };
  }
  async syncOfflineSkin(
    caseId: string,
    body: {
      userId: string;
      skinId: string;
      name: string;
      rarity: string;
      imageUrl: string;
      cost?: number;
    },
  ) {
    const { userId, skinId, name, rarity, imageUrl, cost } = body;

    if (!Types.ObjectId.isValid(caseId)) {
      throw new NotFoundException('Caisse introuvable.');
    }

    // Vérifie si la caisse existe
    const caseObj = await this.caseModel.findById(caseId).lean().exec();
    if (!caseObj) throw new NotFoundException('Caisse introuvable.');

    // Vérifie si le skin existe déjà (ex: synchronisation après offline)
    let skin = await this.skinModel.findById(skinId).lean().exec();
    if (!skin) {
      // si skin inexistant → on le crée
      skin = await this.skinModel.create({
        _id: new Types.ObjectId(skinId), // garde l'id offline si valide
        case_id: new Types.ObjectId(caseId),
        name,
        rarity,
        imageUrl,
        cost: cost ?? 0,
      });
      skin = skin.toObject();
    }

    // Ajoute le skin dans l’inventaire de l’utilisateur
    await this.inventoryModel.create({
      user_id: new Types.ObjectId(userId),
      skin_id: skin._id,
      case_id: new Types.ObjectId(caseId),
    });
    return {
      success: true,
      message: 'Skin synchronisé avec succès',
      skin: {
        skinId: skin._id,
        name: skin.name,
        rarity: skin.rarity,
        cost: skin.cost,
        imageUrl: this.buildImageUrl(skin.imageUrl),
      },
    };
  }
}
