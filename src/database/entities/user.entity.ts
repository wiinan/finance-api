import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, MaxLength } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MaxLength(255)
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'decimal', default: 0 })
  incomeBalance: number;

  @Column({ type: 'decimal', default: 0 })
  expenseBalance: number;

  @Column({ type: 'decimal', default: 0 })
  receivedBalance: number;

  @Column()
  @MaxLength(25)
  provider: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isRoot: boolean;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;
}
