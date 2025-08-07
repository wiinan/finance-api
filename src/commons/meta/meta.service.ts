import { Injectable } from '@nestjs/common';
import { IMetaService } from './meta.interface';
import { FinanceStatus, PaymentMethod, Types } from 'src/database/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FINANCE_EVENTS } from 'src/constants/finance.constants';
import { FinanceHelper } from '../finances/helpers/finance.helpers';
import { FinanceWorkerDto } from '../finances/dtos/finance.dto';
import { EventEmitterService } from 'src/gateways/service/event-emitter';

@Injectable()
export class MetaService implements IMetaService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodModel: Repository<PaymentMethod>,
    @InjectRepository(Types)
    private readonly typeModel: Repository<Types>,
    @InjectRepository(FinanceStatus)
    private readonly financeStatusModel: Repository<FinanceStatus>,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethodModel.find({ where: { isDeleted: false } });
  }

  async getTypes(): Promise<Types[]> {
    return this.typeModel.find();
  }

  async getFinanceStatus(): Promise<FinanceStatus[]> {
    return this.financeStatusModel.find();
  }

  financeWorker(): Observable<MessageEvent> {
    return fromEvent(
      this.eventEmitter.emitterInstance,
      FINANCE_EVENTS.FINANCE_LIST,
    ).pipe(
      map((data: FinanceWorkerDto) => {
        return new MessageEvent(FINANCE_EVENTS.FINANCE_LIST, {
          data: FinanceHelper.mountFinancesWorkerUpdate(data),
        });
      }),
    );
  }
}
