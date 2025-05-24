import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TANSACTION_QUEUE } from 'src/constants/finance.constants';

@Injectable()
export class QueueProducerService {
  constructor(
    @InjectQueue(TANSACTION_QUEUE.PAY) private readonly queue: Queue,
  ) {}

  async addJob(data: any) {
    await this.queue.add(TANSACTION_QUEUE.PAY, data, {
      attempts: 3,
      backoff: 5000,
      delay: 5000,
      removeOnComplete: true,
    });
  }
}
