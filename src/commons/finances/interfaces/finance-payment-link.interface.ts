import { PixInfoDto } from '../dtos/finance.dto';

export abstract class IFinancePaymentLinkService {
  abstract createPaymentLink(data: PixInfoDto): Promise<void>;
}
