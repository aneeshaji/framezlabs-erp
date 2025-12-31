import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

export enum ExpenseCategory {
    RAW_MATERIALS = 'Raw Materials',
    RENT = 'Rent',
    UTILITIES = 'Utilities',
    SALARY = 'Salary',
    MARKETING = 'Marketing',
    MAINTENANCE = 'Maintenance',
    OTHER = 'Other'
}

@Schema({ timestamps: true })
export class Expense {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ required: true, enum: ExpenseCategory, default: ExpenseCategory.OTHER })
    category: ExpenseCategory;

    @Prop({ required: true, default: Date.now })
    date: Date;

    @Prop()
    notes: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
