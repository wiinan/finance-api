import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { CreateFinanceChain } from './chain/create-finance.chain';
import { AuthGuard, ZodValidationPipe } from 'src/middleware';
import { CreateFinanceSchema } from './schema/finance.schema';
import { RequestCreateFinanceDto } from './dtos/finance.dto';
import { Finance } from 'src/database/entities';

@Controller('finance')
export class FinanceController {
  constructor(private readonly createFinanceChain: CreateFinanceChain) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(CreateFinanceSchema))
  createFinance(@Body() data: RequestCreateFinanceDto): Promise<Finance> {
    return this.createFinanceChain.run(data);
  }
}
