import { MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './';

@Entity('types')
export class Types {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MaxLength(255)
  name: string;

  @Column({ nullable: true })
  @MaxLength(255)
  description: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @OneToMany(() => User, (user) => user.id)
  userId: User;
}
