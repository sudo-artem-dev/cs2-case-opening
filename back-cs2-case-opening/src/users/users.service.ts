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

  async getUserInventory(userId: string, since?: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    try {
      const filter: any = { user_id: new Types.ObjectId(userId) };

      // Si "since" est fourni → on ne récupère que les inventaires modifiés après cette date
      if (since) {
        const sinceDate = new Date(since);
        if (!isNaN(sinceDate.getTime())) {
          filter.updated_at = { $gte: sinceDate };
        }
      }
      const inventory = await this.inventoryModel
        .find(filter)
        .populate('skin_id')
        .exec();

      const baseUrl = process.env.BASE_URL;
      const skins = inventory.map((inv) => {
        const skin = inv.skin_id as unknown as Skin;
        return {
          skinId: skin._id,
          name: skin.name,
          rarity: skin.rarity,
          imageUrl: `${baseUrl}/uploads/${skin.imageUrl}`,
          cost: skin.cost,
          updatedAt: inv.updated_at,
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
      const inv = await this.getUserInventory(u._id.toString());

      results.push({
        _id: u._id,
        pseudo: u.pseudo,
        skinsCount: inv.totalSkins,
        inventoryValue: inv.totalValue,
      });
    }

    return results;
  }
  async findByPseudo(pseudo: string) {
    return this.userModel.findOne({ pseudo }).exec();
  }
}
