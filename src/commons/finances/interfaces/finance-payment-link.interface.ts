import { PaymentLinkInfoDto } from '../dtos/finance.dto';

export abstract class IFinancePaymentLinkService {
  abstract createPaymentLink(data: PaymentLinkInfoDto): Promise<void>;
}
