import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    type: [
      {
        productId: { type: MongooseSchema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number,
        subtotal: Number,
      },
    ],
    required: true,
  })
  items: any[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true, default: 0 })
  profit: number;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop()
  customerName?: string;

  @Prop()
  customerPhone?: string;

  @Prop()
  notes?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: any;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
