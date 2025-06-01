import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  CreateFinanceChain,
  PayFinanceChain,
  DeleteFinanceChain,
} from './chain';
import { AuthGuard, ZodValidationPipe } from 'src/middleware';
import {
  CreateFinanceSchema,
  FilterFinanceSchema,
  ListFinanceSchema,
  PayFinanceBodySchema,
} from './schema/finance.schema';
import {
  FinancePayBodyDto,
  FinancePayParamsDto,
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
    private readonly payFinanceChain: PayFinanceChain,
    private readonly deleteFinanceChain: DeleteFinanceChain,
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

  @Put('pay/:id')
  @UseGuards(AuthGuard)
  pay(
    @Param(new ZodValidationPipe(FilterFinanceSchema))
    filter: FinancePayParamsDto,
    @Body(new ZodValidationPipe(PayFinanceBodySchema))
    data: FinancePayBodyDto,
  ): Promise<boolean> {
    return this.payFinanceChain.run({ data, filter });
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  delete(
    @Param(new ZodValidationPipe(FilterFinanceSchema))
    filter: FinancePayParamsDto,
  ) {
    return this.deleteFinanceChain.run(filter);
  }
}
