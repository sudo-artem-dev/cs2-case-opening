import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SkinDocument = Skin & Document;

@Schema()
export class Skin {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  rarity: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  cost: number;

  @Prop({ type: Types.ObjectId, ref: 'Case', required: true })
  case_id: Types.ObjectId;
}

export const SkinSchema = SchemaFactory.createForClass(Skin);
