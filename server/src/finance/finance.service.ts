import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class FinanceService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) {}

    // Expense Management
    async createExpense(createDto: any): Promise<ExpenseDocument> {
        const createdExpense = new this.expenseModel(createDto);
        return createdExpense.save();
    }

    async findAllExpenses(): Promise<ExpenseDocument[]> {
        return this.expenseModel.find().sort({ date: -1 }).exec();
    }

    async updateExpense(id: string, updateDto: any): Promise<ExpenseDocument | null> {
        return this.expenseModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    }

    async removeExpense(id: string): Promise<any> {
        return this.expenseModel.findByIdAndDelete(id).exec();
    }

    // Financial Analysis
    async getFinancialSummary(): Promise<any> {
        const expenses = await this.expenseModel.find().exec();
        const transactions = await this.transactionModel.find().exec();
        const orders = await this.orderModel.find({ isPaid: true }).exec(); // Only paid orders contribute to revenue

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const posRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const orderRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        const totalRevenue = posRevenue + orderRevenue;
        const netProfit = totalRevenue - totalExpenses;

        // Categorized expenses aggregation
        const expenseBreakdown = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        return {
            totalRevenue,
            posRevenue,
            orderRevenue,
            totalExpenses,
            netProfit,
            expenseBreakdown
        };
    }
}
