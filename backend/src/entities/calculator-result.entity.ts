import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { CalculatorType } from './calculator.entity';

@Entity('calculator_results')
export class CalculatorResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.calculatorResults)
  user: User;

  @Column({
    type: 'enum',
    enum: CalculatorType,
  })
  calculatorType: CalculatorType;

  @Column('jsonb')
  inputs: Record<string, any>;

  @Column('jsonb')
  results: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
