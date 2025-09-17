import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Skin, SkinDocument } from './schemas/skin.schema';

@Injectable()
export class SkinsService {
  constructor(@InjectModel(Skin.name) private skinModel: Model<SkinDocument>) {}

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Skin introuvable (supprimé ou inexistant).');
    }

    const skin = await this.skinModel
      .findById(id, {
        _id: 1,
        name: 1,
        rarity: 1,
        imageUrl: 1,
        cost: 1,
        case_id: 1,
      })
      .lean()
      .exec();

    // Si pas trouvé → 404
    if (!skin) {
      throw new NotFoundException('Skin introuvable (supprimé ou inexistant).');
    }

    return skin;
  }
}
