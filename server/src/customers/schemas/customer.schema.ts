import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, index: true })
    phone: string;

    @Prop()
    email?: string;

    @Prop()
    address?: string;

    @Prop({ default: 0 })
    totalSpent: number;

    @Prop({ default: 0 })
    orderCount: number;

    @Prop()
    notes?: string;

    @Prop()
    lastPurchaseDate?: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
