import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Skin } from './skin.schema';

export type InventoryDocument = Inventory & Document;

@Schema()
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Skin', required: true })
  skin_id: Types.ObjectId | Skin;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
