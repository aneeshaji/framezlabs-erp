import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        private productsService: ProductsService,
        private customersService: CustomersService,
        private notificationsService: NotificationsService,
    ) {}

    async create(createOrderDto: any): Promise<OrderDocument> {
        const createdOrder = new this.orderModel(createOrderDto);
        
        // Update stock levels for each item
        for (const item of createOrderDto.items) {
            await this.productsService.updateStock(item.product, -item.quantity);
        }

        // Track Customer Activity
        if (createOrderDto.customerPhone) {
            await this.customersService.findOrCreate(createOrderDto.customerName, createOrderDto.customerPhone);
            await this.customersService.updateActivity(createOrderDto.customerPhone, createOrderDto.totalAmount);
        }

        const savedOrder = await createdOrder.save();

        await this.notificationsService.create(
            'New Order Received',
            `Order #${savedOrder._id.toString().slice(-6).toUpperCase()} from ${savedOrder.customerName} for ₹${savedOrder.totalAmount}`,
            'INFO',
        );

        return savedOrder;
    }

    async findAll(): Promise<OrderDocument[]> {
        return this.orderModel.find().populate('items.product').sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<OrderDocument> {
        const order = await this.orderModel.findById(id).populate('items.product').exec();
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<OrderDocument> {
        const order = await this.orderModel.findByIdAndUpdate(
            id,
            { status },
            { new: true },
        ).exec();

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return order;
    }

    async update(id: string, updateOrderDto: any): Promise<OrderDocument> {
        const order = await this.orderModel.findByIdAndUpdate(
            id,
            updateOrderDto,
            { new: true },
        ).exec();

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return order;
    }

    async remove(id: string): Promise<void> {
        const order = await this.findOne(id);
        
        // If order is cancelled/removed, we might want to restock?
        // For now, just delete.
        await this.orderModel.findByIdAndDelete(id).exec();
    }
}
