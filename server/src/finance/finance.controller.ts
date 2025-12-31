import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
    constructor(private readonly financeService: FinanceService) {}

    @Get('summary')
    getSummary() {
        return this.financeService.getFinancialSummary();
    }

    @Get('expenses')
    findAllExpenses() {
        return this.financeService.findAllExpenses();
    }

    @Post('expenses')
    createExpense(@Body() createDto: any) {
        return this.financeService.createExpense(createDto);
    }

    @Patch('expenses/:id')
    updateExpense(@Param('id') id: string, @Body() updateDto: any) {
        return this.financeService.updateExpense(id, updateDto);
    }

    @Delete('expenses/:id')
    removeExpense(@Param('id') id: string) {
        return this.financeService.removeExpense(id);
    }
}
