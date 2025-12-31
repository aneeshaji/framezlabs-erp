import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
    @Prop({ required: true, default: 'FramezLabs ERP' })
    storeName: string;

    @Prop({ default: '/logo.png' })
    logoUrl: string;

    @Prop({ default: '' })
    address: string;

    @Prop({ default: '' })
    phone: string;

    @Prop({ default: '' })
    email: string;

    @Prop({ default: '' })
    website: string;

    @Prop({ default: '' })
    gstNumber: string;

    @Prop({ default: 'INV-' })
    invoicePrefix: string;

    @Prop({ default: '₹' })
    currency: string;

    @Prop({ default: '' })
    tagline: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
