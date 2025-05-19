import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
