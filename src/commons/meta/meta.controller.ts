import { Controller, Get, Sse, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware';
import { IMetaService } from './meta.interface';
import { FinanceStatus, PaymentMethod, Types } from 'src/database/entities';
import { Observable } from 'rxjs';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: IMetaService) {}

  @Get('payment-method')
  @UseGuards(AuthGuard)
  getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.metaService.getPaymentMethods();
  }

  @Get('type')
  @UseGuards(AuthGuard)
  getTypes(): Promise<Types[]> {
    return this.metaService.getTypes();
  }

  @Get('status')
  @UseGuards(AuthGuard)
  getFinanceStatus(): Promise<FinanceStatus[]> {
    return this.metaService.getFinanceStatus();
  }

  @Sse('finance-event')
  @UseGuards(AuthGuard)
  updatedFinances(): Observable<MessageEvent> {
    return this.metaService.financeWorker();
  }
}
