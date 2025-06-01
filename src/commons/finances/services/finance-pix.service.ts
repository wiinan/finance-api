import { Injectable } from '@nestjs/common';
import { IFinancePixService } from '../interfaces/finance-pix.interface';
import { PixInfoDto } from '../dtos/finance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PixFinanceInfo } from 'src/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class FinancePixService implements IFinancePixService {
  constructor(
    @InjectRepository(PixFinanceInfo)
    private readonly pixFinanceModel: Repository<PixFinanceInfo>,
  ) {}

  public async createPix(data: PixInfoDto): Promise<void> {
    const pix = this.pixFinanceModel.create(data);

    await this.pixFinanceModel.save(pix);
  }

  async remove(financeId: number): Promise<boolean> {
    await this.pixFinanceModel.update({ financeId }, { isDeleted: true });

    return true;
  }
}
