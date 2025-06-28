import { Observable } from 'rxjs';
import { PaymentMethod } from 'src/database/entities';

export abstract class IMetaService {
  abstract getPaymentMethods(): Promise<PaymentMethod[]>;
  abstract financeWorker(): Observable<MessageEvent>;
}
