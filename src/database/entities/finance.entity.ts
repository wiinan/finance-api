import { MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FinanceStatus, PaymentMethod, Types, User } from './';

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

  @OneToMany(() => User, (user) => user.id)
  user: User;

  @OneToMany(() => FinanceStatus, (status) => status.id)
  financeStatus: FinanceStatus;

  @OneToMany(() => Types, (type) => type.id)
  type: Types;

  @OneToMany(() => PaymentMethod, (method) => method.id)
  paymentMethod: PaymentMethod;
}
