import { PixInfoDto } from '../dtos/finance.dto';

export abstract class IFinancePixService {
  abstract createPix(data: PixInfoDto): Promise<void>;
}
