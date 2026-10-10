import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calculator, CalculatorResult, User, CalculatorType } from '../entities';
import { CalculateDto } from './dto/calculate.dto';

@Injectable()
export class CalculatorsService {
  constructor(
    @InjectRepository(Calculator)
    private calculatorRepository: Repository<Calculator>,
    @InjectRepository(CalculatorResult)
    private resultRepository: Repository<CalculatorResult>,
  ) {}

  async calculate(calculateDto: CalculateDto, user?: User) {
    const { type, inputData, saveResult } = calculateDto;

    let result;
    switch (type) {
      case CalculatorType.BMI:
        result = this.calculateBMI(inputData);
        break;
      case CalculatorType.TDEE:
        result = this.calculateTDEE(inputData);
        break;
      case CalculatorType.MACRO:
        result = this.calculateMacros(inputData);
        break;
      case CalculatorType.BODY_FAT:
        result = this.calculateBodyFat(inputData);
        break;
      case CalculatorType.WATER_INTAKE:
        result = this.calculateWater(inputData);
        break;
      case CalculatorType.QURBANI_MEAT:
        result = this.calculateQurbani(inputData);
        break;
      default:
        throw new Error('Invalid calculator type');
    }

    if (saveResult && user) {
      const savedResult = this.resultRepository.create({
        user,
        calculatorType: type as CalculatorType,
        inputs: inputData,
        results: result,
      });
      await this.resultRepository.save(savedResult);
    }

    return result;
  }

  async getMyResults(userId: string, type?: string) {
    const query = this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.calculator', 'calculator')
      .where('result.userId = :userId', { userId });

    if (type) {
      query.andWhere('calculator.type = :type', { type });
    }

    return query.orderBy('result.createdAt', 'DESC').getMany();
  }

  private calculateBMI(data: any) {
    const { weight, height } = data;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    return { bmi: parseFloat(bmi.toFixed(2)), category };
  }

  private calculateTDEE(data: any) {
    const { weight, height, age, gender, activityLevel } = data;
    
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      weightLoss: Math.round(tdee - 500),
      weightGain: Math.round(tdee + 500),
    };
  }

  private calculateMacros(data: any) {
    const { calories, goal } = data;
    
    let proteinPct = 0.30;
    let fatPct = 0.30;
    let carbPct = 0.40;

    if (goal === 'weight_loss') {
      proteinPct = 0.35;
      fatPct = 0.25;
      carbPct = 0.40;
    } else if (goal === 'muscle_gain') {
      proteinPct = 0.30;
      fatPct = 0.25;
      carbPct = 0.45;
    }

    return {
      protein: Math.round((calories * proteinPct) / 4),
      carbs: Math.round((calories * carbPct) / 4),
      fat: Math.round((calories * fatPct) / 9),
    };
  }

  private calculateBodyFat(data: any) {
    const { weight, gender, neck, waist, hip, height } = data;
    
    let bodyFat;
    if (gender === 'male') {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }

    const leanMass = weight * (1 - bodyFat / 100);
    const fatMass = weight - leanMass;

    return {
      bodyFat: parseFloat(bodyFat.toFixed(1)),
      leanMass: parseFloat(leanMass.toFixed(1)),
      fatMass: parseFloat(fatMass.toFixed(1)),
    };
  }

  private calculateWater(data: any) {
    const { weight } = data;
    const waterIntake = weight * 0.033;

    return {
      liters: parseFloat(waterIntake.toFixed(2)),
      glasses: Math.round(waterIntake / 0.25),
    };
  }

  private calculateQurbani(data: any) {
    const { animal, weight, people } = data;
    
    const meatYield = weight * 0.6;
    const perPerson = meatYield / people;

    return {
      totalMeat: parseFloat(meatYield.toFixed(2)),
      perPerson: parseFloat(perPerson.toFixed(2)),
      animal,
      people,
    };
  }
}
