import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Skin } from './skin.schema';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Skin', required: true })
  skin_id: Types.ObjectId | Skin;

  @Prop()
  created_at?: Date;

  @Prop()
  updated_at?: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
