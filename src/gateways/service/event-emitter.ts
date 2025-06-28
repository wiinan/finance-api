import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventEmitterService {
  constructor(public readonly emitterInstance: EventEmitter2) {}

  public emit(event: string, data: object): void {
    this.emitterInstance.emit(event, data);
  }
}
