import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateFinanceChain } from './chain/create-finance.chain';
import { AuthGuard, ZodValidationPipe } from 'src/middleware';
import {
  CreateFinanceSchema,
  ListFinanceSchema,
} from './schema/finance.schema';
import {
  listFinanceDto,
  ListFinanceFilterDto,
  RequestCreateFinanceDto,
} from './dtos/finance.dto';
import { Finance } from 'src/database/entities';
import { IFinanceService } from './interfaces';

@Controller('finance')
export class FinanceController {
  constructor(
    private readonly createFinanceChain: CreateFinanceChain,
    private readonly financeService: IFinanceService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(CreateFinanceSchema))
  createFinance(@Body() data: RequestCreateFinanceDto): Promise<Finance> {
    return this.createFinanceChain.run(data);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(ListFinanceSchema))
  list(@Query() filter: ListFinanceFilterDto): Promise<listFinanceDto[]> {
    return this.financeService.list(filter);
  }
}
