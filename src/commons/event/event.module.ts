import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitterService } from 'src/gateways/service/event-emitter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot({})],
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class CustomEventModule {}
