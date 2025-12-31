import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

export type OrderDocument = Order & Document;

export enum OrderStatus {
    PENDING = 'PENDING',
    IN_PRODUCTION = 'IN_PRODUCTION',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export enum OrderType {
    RETAIL = 'RETAIL',
    CUSTOM = 'CUSTOM',
}

@Schema({ timestamps: true })
export class OrderItem {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
    product: Product;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    price: number;

    @Prop()
    customNotes?: string;

    @Prop({ required: true })
    subtotal: number;
}

@Schema({ timestamps: true })
export class Order {
    @Prop({ required: true })
    customerName: string;

    @Prop({ required: true })
    customerPhone: string;

    @Prop({ type: [OrderItem], required: true })
    items: OrderItem[];

    @Prop({ required: true })
    totalAmount: number;

    @Prop({
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Prop({
        type: String,
        enum: OrderType,
        default: OrderType.RETAIL,
    })
    orderType: OrderType;

    @Prop()
    dueDate?: Date;

    @Prop()
    notes?: string;

    @Prop()
    paymentMethod: string;

    @Prop({ default: false })
    isPaid: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
