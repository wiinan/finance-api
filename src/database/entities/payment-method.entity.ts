import { MaxLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment_methods')
export class PaymentMethod {
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

  @Column({ default: false })
  isDeleted: boolean;
}
