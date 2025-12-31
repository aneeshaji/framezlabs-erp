import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: any, @Request() req: any) {
    // Inject the user ID who performed the transaction
    const transactionData = {
      ...createTransactionDto,
      createdBy: req.user.id || req.user.userId,
    };
    return this.transactionsService.create(transactionData);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }
}
