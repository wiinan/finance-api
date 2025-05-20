import { MaxLength } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  CreditCardFinanceInfo,
  FinanceInstallment,
  FinanceStatus,
  PaymentLinkFinanceInfo,
  PaymentMethod,
  PixFinanceInfo,
  Types,
  User,
} from './';

@Entity('finances')
export class Finance {
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
  @MaxLength(255)
  payerInfo: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  statusId: number;

  @Column({ nullable: false })
  typeId: number;

  @Column({ nullable: false })
  paymentMethodId: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => FinanceStatus, (status) => status.id)
  @JoinColumn({ name: 'statusId' })
  financeStatus: FinanceStatus;

  @ManyToOne(() => Types, (type) => type.id)
  type: Types;

  @ManyToOne(() => PaymentMethod, (method) => method.id)
  paymentMethod: PaymentMethod;

  @OneToMany(() => FinanceInstallment, (installment) => installment.finance)
  installment: FinanceInstallment[];

  @OneToOne(() => PixFinanceInfo, (pixInfo) => pixInfo.finance)
  pixInfo: PixFinanceInfo;

  @OneToOne(() => CreditCardFinanceInfo, (creditCard) => creditCard.finance)
  creditCardInfo: CreditCardFinanceInfo;

  @OneToOne(() => PaymentLinkFinanceInfo, (paymentLink) => paymentLink.finance)
  paymentLinkInfo: PaymentLinkFinanceInfo;
}
