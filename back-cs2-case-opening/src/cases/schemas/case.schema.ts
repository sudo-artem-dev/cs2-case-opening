import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CaseDocument = Case & Document;

@Schema()
export class Case {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({
    type: [
      {
        _id: false,
        rarity: { type: String, required: true },
        probability: { type: Number, required: true },
      },
    ],
    required: true,
  })
  rarityProbabilities: { rarity: string; probability: number }[];
}

export const CaseSchema = SchemaFactory.createForClass(Case);
