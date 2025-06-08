import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { MaxLength } from 'class-validator';

@Entity('auth_logs')
export class AuthLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column()
  @MaxLength(20)
  action: string;

  @Column({ nullable: false })
  @MaxLength(6)
  token: string;

  @Column({ default: new Date() })
  expiresAt: Date;

  @Column({ default: new Date() })
  createdAt: Date;

  @OneToMany(() => User, (user) => user.id)
  user: User;
}
