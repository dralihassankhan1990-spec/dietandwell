import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CalculatorType {
  BMI = 'bmi',
  TDEE = 'tdee',
  MACRO = 'macro',
  QURBANI_MEAT = 'qurbani_meat',
  BODY_FAT = 'body_fat',
  WATER_INTAKE = 'water_intake',
  // Round 1: expanded calculator set (frontend registry ids).
  WAIST_HIP = 'waist_hip',
  LEAN_MASS = 'lean_mass',
  CALORIE_TARGET = 'calorie_target',
  FIBER = 'fiber',
  MUST_SCORE = 'must_score',
  CORRECTED_CALCIUM = 'corrected_calcium',
  IRON = 'iron',
  BREASTFEEDING = 'breastfeeding',
  SWEAT_RATE = 'sweat_rate',
  SODIUM_LOSS = 'sodium_loss',
  URINE_CHECK = 'urine_check',
  INFANT_FORMULA = 'infant_formula',
  ATHLETE_PROTEIN = 'athlete_protein',
  CARB_LOADING = 'carb_loading',
  PREWORKOUT_CARBS = 'preworkout_carbs',
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
