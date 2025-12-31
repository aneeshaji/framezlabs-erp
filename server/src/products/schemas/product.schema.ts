import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string; // Unique Identifier for POS/Inventory

  @Prop()
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  supplier: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0, min: 0 })
  costPrice: number;

  @Prop({ default: 0, min: 0 })
  stockLevel: number;

  @Prop({ default: 5, min: 0 })
  minStockLevel: number;

  @Prop({ default: 'Active' })
  status: 'Active' | 'Out of Stock' | 'Discontinued';

  @Prop([String])
  images: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
