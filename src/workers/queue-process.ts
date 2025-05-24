import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PayFinanceChain } from 'src/commons/finances/chain';
import { TANSACTION_QUEUE } from 'src/constants/finance.constants';

@Processor(TANSACTION_QUEUE.PAY)
export class FinanceProcessQueue extends WorkerHost {
  constructor(private readonly payFinanceChain: PayFinanceChain) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.payFinanceChain.executePayTransactions(job.data);
  }
}
