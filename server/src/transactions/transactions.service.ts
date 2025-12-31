import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
  ) {}

  async create(createTransactionDto: any): Promise<TransactionDocument> {
    // 1. Process items, update stock, and calculate profit
    let totalProfit = 0;

    for (const item of createTransactionDto.items) {
      const product = await this.productsService.findOne(item.productId);
      if (product.stockLevel < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
      }
      
      // Calculate profit for this item
      const costPrice = product.costPrice || 0;
      const itemProfit = (item.price - costPrice) * item.quantity;
      totalProfit += itemProfit;

      // Decrement stock
      await this.productsService.updateStock(item.productId, -item.quantity);
    }

    // Add profit to the DTO
    createTransactionDto.profit = totalProfit;

    // 2. Track Customer Activity
    if (createTransactionDto.customerPhone) {
      await this.customersService.findOrCreate(createTransactionDto.customerName, createTransactionDto.customerPhone);
      await this.customersService.updateActivity(createTransactionDto.customerPhone, createTransactionDto.totalAmount);
    }

    // 3. Create the transaction
    const createdTransaction = new this.transactionModel(createTransactionDto);
    return createdTransaction.save();
  }

  async findAll(): Promise<TransactionDocument[]> {
    return this.transactionModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<TransactionDocument | null> {
    return this.transactionModel.findById(id).exec();
  }
}
