import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Expense.name, schema: ExpenseSchema },
            { name: Transaction.name, schema: TransactionSchema },
            { name: Order.name, schema: OrderSchema },
        ]),
    ],
    controllers: [FinanceController],
    providers: [FinanceService],
    exports: [FinanceService],
})
export class FinanceModule {}
