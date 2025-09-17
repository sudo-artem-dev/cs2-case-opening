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

@Injectable()
export class CasesService {
  constructor(
    @InjectModel(Case.name) private caseModel: Model<CaseDocument>,
    @InjectModel(Skin.name) private skinModel: Model<SkinDocument>,
    @InjectModel(Inventory.name)
    private inventoryModel: Model<InventoryDocument>,
  ) {}

  async findAll(): Promise<Case[]> {
    return this.caseModel.find({}, { _id: 1, name: 1, imageUrl: 1 }).exec();
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
      .exec();

    return { ...caseObj, skins };
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

    if (!skins || skins.length === 0) {
      throw new InternalServerErrorException(
        'Aucun skin trouvé pour cette rareté.',
      );
    }

    const chosenSkin = skins[Math.floor(Math.random() * skins.length)];

    // Enregistrer dans la collection inventories
    await this.inventoryModel.create({
      user_id: new Types.ObjectId(userId),
      skin_id: chosenSkin._id,
    });

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
}
