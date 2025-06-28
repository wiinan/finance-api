import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { IMetaService } from './meta.interface';
import { MetaService } from './meta.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from 'src/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [MetaController],
  providers: [{ provide: IMetaService, useClass: MetaService }],
  exports: [],
})
export class MetaModule {}
