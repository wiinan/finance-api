import { MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FinanceStatus, PaymentMethod, User } from './';

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

  @OneToMany(() => User, (user) => user.id)
  user: User;

  @OneToMany(() => FinanceStatus, (status) => status.id)
  status: FinanceStatus;

  @OneToMany(() => PaymentMethod, (method) => method.id)
  paymentMethod: PaymentMethod;
}
