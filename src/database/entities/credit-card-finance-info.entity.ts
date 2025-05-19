import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Finance, User } from './';
import { MaxLength } from 'class-validator';

@Entity('credit_card_finance_info')
export class CreditCardFinanceInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MaxLength(6)
  cvv: string;

  @Column()
  @MaxLength(6)
  number: string;

  @Column()
  @MaxLength(6)
  titleName: string;

  @Column()
  @MaxLength(6)
  name: string;

  @Column({ type: 'decimal', default: 0, scale: 4 })
  taxes: number;

  @Column()
  @MaxLength(7)
  dueDate: string;

  @Column({ nullable: false })
  financeId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => User, (user) => user.id)
  user: User;

  @OneToMany(() => Finance, (finance) => finance.id)
  finance: Finance;
}
