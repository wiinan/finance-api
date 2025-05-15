import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, MaxLength } from 'class-validator';
import { AuthUtils } from 'src/helpers/auth';

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

  @Column()
  @MaxLength(255)
  password: string;

  @Column({ type: 'decimal', default: 0 })
  balance: number;

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

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    this.password = AuthUtils.encrypt(this.password);
    return this.password;
  }
}
