import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(
        @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    ) {}

    async onModuleInit() {
        // Ensure at least one settings document exists
        const count = await this.settingsModel.countDocuments().exec();
        if (count === 0) {
            const defaultSettings = new this.settingsModel({
                storeName: 'FramezLabs ERP',
                invoicePrefix: 'INV-',
                currency: '₹'
            });
            await defaultSettings.save();
        }
    }

    async getSettings(): Promise<SettingsDocument> {
        return this.settingsModel.findOne().exec() as Promise<SettingsDocument>;
    }

    async updateSettings(updateDto: any): Promise<SettingsDocument> {
        return this.settingsModel.findOneAndUpdate({}, updateDto, { new: true, upsert: true }).exec() as Promise<SettingsDocument>;
    }
}
