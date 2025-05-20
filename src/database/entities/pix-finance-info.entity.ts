import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Finance, User } from '.';
import { MaxLength } from 'class-validator';

@Entity('pix_finance_info')
export class PixFinanceInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MaxLength(255)
  type: string;

  @Column()
  @MaxLength(255)
  key: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ type: 'decimal', default: 0, scale: 4 })
  taxes: number;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => User, (user) => user.id)
  userId: User;

  @ManyToOne(() => Finance)
  @JoinColumn({ name: 'financeId', referencedColumnName: 'id' })
  finance: Finance;
}
