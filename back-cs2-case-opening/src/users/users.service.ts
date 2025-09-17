import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  Inventory,
  InventoryDocument,
} from '../cases/schemas/inventory.schema';
import { Skin, SkinDocument } from '../cases/schemas/skin.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Inventory.name)
    private inventoryModel: Model<InventoryDocument>,
    @InjectModel(Skin.name) private skinModel: Model<SkinDocument>,
  ) {}

  async getUserInventory(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    try {
      const inventory = await this.inventoryModel
        .find({ user_id: new Types.ObjectId(userId) })
        .populate('skin_id')
        .exec();

      // Ici on dit à TS : "ok skin_id est bien un Skin"
      const skins = inventory.map((inv) => {
        const skin = inv.skin_id as unknown as Skin;
        return {
          skinId: skin._id,
          name: skin.name,
          rarity: skin.rarity,
          imageUrl: skin.imageUrl,
          cost: skin.cost,
        };
      });

      return {
        _id: userId,
        totalSkins: skins.length,
        totalValue: skins.reduce((sum, s) => sum + (s.cost || 0), 0),
        skins,
      };
    } catch {
      throw new InternalServerErrorException('Erreur serveur.');
    }
  }
  async findAll(): Promise<any[]> {
    const users = await this.userModel.find({}, { password: 0 }).lean().exec();
    const results = [];

    for (const u of users) {
      const inventories = await this.inventoryModel
        .find({ user_id: u._id })
        .lean()
        .exec();

      const skins = await this.skinModel
        .find({ _id: { $in: inventories.map((i) => i.skin_id) } })
        .lean()
        .exec();

      const totalValue = skins.reduce((sum, s) => sum + (s.cost ?? 0), 0);

      results.push({
        _id: u._id,
        pseudo: u.pseudo,
        skinsCount: inventories.length,
        inventoryValue: totalValue,
      });
    }

    return results;
  }
  async findByPseudo(pseudo: string) {
    return this.userModel.findOne({ pseudo }).exec();
  }
}
