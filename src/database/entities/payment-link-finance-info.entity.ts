import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Finance } from '.';

@Entity('payment_link_finance_info')
export class PaymentLinkFinanceInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  link: string;

  @Column({ type: 'decimal', default: 0, scale: 4 })
  taxes: number;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: false })
  financeId: number;

  @ManyToOne(() => Finance)
  @JoinColumn({ name: 'financeId', referencedColumnName: 'id' })
  finance: Finance;
}
