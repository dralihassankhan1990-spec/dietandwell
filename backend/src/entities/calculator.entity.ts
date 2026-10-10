import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CalculatorType {
  BMI = 'bmi',
  TDEE = 'tdee',
  MACRO = 'macro',
  QURBANI_MEAT = 'qurbani_meat',
  BODY_FAT = 'body_fat',
  WATER_INTAKE = 'water_intake',
}

@Entity('calculators')
export class Calculator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CalculatorType,
    unique: true,
  })
  type: CalculatorType;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  instructions: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
