import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';

@Injectable()
export class CustomersService {
    constructor(
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    ) {}

    async findOrCreate(name: string, phone: string): Promise<CustomerDocument | null> {
        if (!phone) return null;
        
        let customer = await this.customerModel.findOne({ phone }).exec();
        
        if (!customer) {
            customer = new this.customerModel({ name, phone });
            await customer.save();
        } else if (name && customer.name !== name) {
            // Update name if it changed
            customer.name = name;
            await customer.save();
        }
        
        return customer;
    }

    async updateActivity(phone: string, amount: number): Promise<void> {
        if (!phone) return;
        
        await this.customerModel.findOneAndUpdate(
            { phone },
            { 
                $inc: { totalSpent: Number(amount) || 0, orderCount: 1 },
                $set: { lastPurchaseDate: new Date() }
            }
        ).exec();
    }

    async findAll(): Promise<CustomerDocument[]> {
        return this.customerModel.find().sort({ totalSpent: -1 }).exec();
    }

    async findOne(id: string): Promise<CustomerDocument> {
        const customer = await this.customerModel.findById(id).exec();
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }

    async update(id: string, updateDto: any): Promise<CustomerDocument> {
        const customer = await this.customerModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }

    async remove(id: string): Promise<void> {
        await this.customerModel.findByIdAndDelete(id).exec();
    }
}
