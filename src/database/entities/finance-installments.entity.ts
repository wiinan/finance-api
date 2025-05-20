import { MaxLength } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Finance, FinanceStatus, PaymentMethod, User } from './';

@Entity('finance_installments')
export class FinanceInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', default: 0, scale: 4 })
  price: number;

  @Column({ type: 'decimal', default: 0, scale: 4 })
  liquidPrice: number;

  @Column({ type: 'decimal', default: 0, scale: 4 })
  receivedValue: number;

  @Column()
  @MaxLength(255)
  description: string;

  @Column({ default: new Date() })
  competence: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  installments: number;

  @Column({ nullable: true })
  installment: number;

  @Column({ nullable: true })
  @MaxLength(255)
  payerInfo: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  statusId: number;

  @Column({ nullable: true })
  paymentMethodId: number;

  @Column({ nullable: true })
  financeId: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => FinanceStatus, (status) => status.id)
  @JoinColumn({ name: 'statusId' })
  financeStatus: FinanceStatus;

  @ManyToOne(() => PaymentMethod, (method) => method.id)
  paymentMethod: PaymentMethod;

  @ManyToOne(() => Finance)
  @JoinColumn({ name: 'financeId', referencedColumnName: 'id' })
  finance: Finance;
}
