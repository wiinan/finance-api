import { Observable } from 'rxjs';
import { FinanceStatus, PaymentMethod, Types } from 'src/database/entities';

export abstract class IMetaService {
  abstract getPaymentMethods(): Promise<PaymentMethod[]>;
  abstract getTypes(): Promise<Types[]>;
  abstract getFinanceStatus(): Promise<FinanceStatus[]>;
  abstract financeWorker(): Observable<MessageEvent>;
}
