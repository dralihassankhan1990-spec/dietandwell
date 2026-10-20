import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Resend } from 'resend';
import { Calculator, CalculatorResult, User, CalculatorType } from '../entities';
import { CalculateDto, SaveCalculatorDto } from './dto/calculate.dto';

type Inputs = Record<string, any>;

/**
 * Formulas intentionally mirror frontend/src/utils/calculators.js (the
 * canonical client-side implementation). Any future formula change must be
 * made in BOTH places. Differences fixed in this pass:
 * BMI 1 decimal + 7-tier categories (was 2 decimals + 4 tiers);
 * TDEE weightGain +300 (was +500) + activityLabel;
 * Macros: camelCase/snake_case goals + diet styles, `fats` key + percentages;
 * Water: activity/climate adjustments, litres/ml/min/max/daily;
 * Body fat: clamped at 0 + category/color.
 */
@Injectable()
export class CalculatorsService {
  private readonly logger = new Logger(CalculatorsService.name);

  constructor(
    @InjectRepository(Calculator)
    private calculatorRepository: Repository<Calculator>,
    @InjectRepository(CalculatorResult)
    private resultRepository: Repository<CalculatorResult>,
    private configService: ConfigService,
  ) {}

  /** Calculator catalogue (seeded by demo-content.seed.ts). */
  async findAll(): Promise<Calculator[]> {
    return this.calculatorRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async calculate(calculateDto: CalculateDto, user?: User) {
    const inputData = this.normalizeInputs(calculateDto);
    const { type, saveResult } = calculateDto;

    let result: Record<string, any>;
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
      // ---- Round 1: expanded set (mirror frontend/src/utils/calculators.js) ----
      case CalculatorType.WAIST_HIP:
        result = this.calculateWaistHip(inputData);
        break;
      case CalculatorType.LEAN_MASS:
        result = this.calculateBoerLBM(inputData);
        break;
      case CalculatorType.CALORIE_TARGET:
        result = this.calculateCalorieTarget(inputData);
        break;
      case CalculatorType.FIBER:
        result = this.calculateFiber(inputData);
        break;
      case CalculatorType.MUST_SCORE:
        result = this.calculateMUST(inputData);
        break;
      case CalculatorType.CORRECTED_CALCIUM:
        result = this.calculateCorrectedCalcium(inputData);
        break;
      case CalculatorType.IRON:
        result = this.calculateIron(inputData);
        break;
      case CalculatorType.BREASTFEEDING:
        result = this.calculateBreastfeeding(inputData);
        break;
      case CalculatorType.SWEAT_RATE:
        result = this.calculateSweatRate(inputData);
        break;
      case CalculatorType.SODIUM_LOSS:
        result = this.calculateSodiumLoss(inputData);
        break;
      case CalculatorType.URINE_CHECK:
        result = this.checkUrine(inputData);
        break;
      case CalculatorType.INFANT_FORMULA:
        result = this.calculateInfantFormula(inputData);
        break;
      case CalculatorType.ATHLETE_PROTEIN:
        result = this.calculateAthleteProtein(inputData);
        break;
      case CalculatorType.CARB_LOADING:
        result = this.calculateCarbLoading(inputData);
        break;
      case CalculatorType.PREWORKOUT_CARBS:
        result = this.calculatePreworkoutCarbs(inputData);
        break;
      default:
        throw new BadRequestException('Invalid calculator type');
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
      .leftJoin('result.user', 'user')
      .where('user.id = :userId', { userId });

    // CalculatorResult has NO relation to Calculator — it stores the enum in
    // calculatorType. (The old code joined a non-existent 'result.calculator'
    // relation, which fails at runtime.)
    if (type && Object.values(CalculatorType).includes(type as CalculatorType)) {
      query.andWhere('result.calculatorType = :type', { type });
    }

    return query.orderBy('result.createdAt', 'DESC').getMany();
  }

  /**
   * Spec §5.2 POST /calculators/save: { email, type, result } — email the
   * result to the user. No DB row is created (there is no user to attach it
   * to for an anonymous caller). When RESEND_API_KEY is unset this is a
   * graceful no-op that still returns success.
   */
  async saveViaEmail(saveDto: SaveCalculatorDto) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not set — calculator result email skipped (no-op).',
      );
      return { success: true, emailed: false };
    }
    try {
      const resend = new Resend(apiKey);
      const from = this.configService.get<string>('FROM_EMAIL', 'noreply@dietandwell.com');
      await resend.emails.send({
        from,
        to: saveDto.email,
        subject: `Your ${saveDto.type} result from DietAndWell`,
        html: `<h2>Your ${saveDto.type} result</h2><pre>${this.escapeHtml(
          JSON.stringify(saveDto.result, null, 2),
        )}</pre>`,
      });
      return { success: true, emailed: true };
    } catch (error) {
      // Email must never fail the save flow.
      this.logger.warn(`Failed to email calculator result: ${(error as Error).message}`);
      return { success: true, emailed: false };
    }
  }

  // ---- Input handling ----

  private normalizeInputs(dto: CalculateDto): Inputs {
    const flat: Inputs = {};
    for (const key of [
      'weight', 'height', 'age', 'gender', 'activityLevel', 'activity',
      'calories', 'goal', 'diet', 'climate', 'waist', 'neck', 'hip',
      'people', 'animal',
    ] as const) {
      if (dto[key] !== undefined) flat[key] = dto[key];
    }
    const merged: Inputs = { ...flat, ...(dto.inputData || {}) };
    // Frontend sends `activity`; backend formulas use `activityLevel`.
    if (!merged.activityLevel && merged.activity) {
      merged.activityLevel = merged.activity;
    }
    return merged;
  }

  private requireNumbers(data: Inputs, fields: string[]) {
    for (const field of fields) {
      const value = Number(data[field]);
      if (data[field] === undefined || data[field] === null || data[field] === '' || typeof data[field] === 'boolean' || !Number.isFinite(value)) {
        throw new BadRequestException(`Field '${field}' is required and must be a number`);
      }
      const zeroAllowed = ['loss', 'fluid', 'urine', 'rate', 'sodium', 'age'].includes(field);
      if (value < 0 || (!zeroAllowed && value === 0)) throw new BadRequestException(`Field '${field}' is outside its valid range`);
      data[field] = value;
    }
  }

  // ---- Formulas (mirroring frontend/src/utils/calculators.js) ----

  private calculateBMI(data: Inputs) {
    this.requireNumbers(data, ['weight', 'height']);
    const { weight, height } = data;
    const h = height / 100;
    const bmi = parseFloat((weight / (h * h)).toFixed(1));

    let category = '';
    if (bmi < 16) category = 'Severely Underweight';
    else if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal Weight';
    else if (bmi < 30) category = 'Overweight';
    else if (bmi < 35) category = 'Obese Class I';
    else if (bmi < 40) category = 'Obese Class II';
    else category = 'Obese Class III';

    return { bmi, category };
  }

  private calculateTDEE(data: Inputs) {
    this.requireNumbers(data, ['weight', 'height', 'age']);
    const { weight, height, age, gender, activityLevel } = data;

    // Mifflin-St Jeor, BMR rounded first (frontend does the same).
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    bmr = Math.round(bmr);

    const multipliers: Record<string, { factor: number; label: string }> = {
      sedentary: { factor: 1.2, label: 'Sedentary' },
      light: { factor: 1.375, label: 'Light' },
      moderate: { factor: 1.55, label: 'Moderate' },
      active: { factor: 1.725, label: 'Active' },
      very_active: { factor: 1.9, label: 'Very Active' },
    };
    const m = multipliers[activityLevel] || multipliers.moderate;
    const tdee = Math.round(bmr * m.factor);

    return {
      bmr,
      tdee,
      weightLoss: Math.round(tdee - 500),
      weightGain: Math.round(tdee + 300),
      activityLabel: m.label,
    };
  }

  private calculateMacros(data: Inputs) {
    this.requireNumbers(data, ['calories']);
    const { calories } = data;
    // Accept both frontend camelCase (weightLoss/muscleGain/maintenance)
    // and snake_case (weight_loss/muscle_gain) goal keys.
    const goalMap: Record<string, string> = {
      weightLoss: 'weightLoss',
      weight_loss: 'weightLoss',
      lose: 'weightLoss',
      maintenance: 'maintenance',
      maintain: 'maintenance',
      muscleGain: 'muscleGain',
      muscle_gain: 'muscleGain',
      gain: 'muscleGain',
    };
    const goal = goalMap[data.goal] || 'maintenance';
    const diet = data.diet || 'balanced';

    const distributions: Record<string, Record<string, { protein: number; carbs: number; fats: number }>> = {
      weightLoss: {
        balanced: { protein: 0.35, carbs: 0.40, fats: 0.25 },
        low_carb: { protein: 0.40, carbs: 0.20, fats: 0.40 },
        keto: { protein: 0.30, carbs: 0.05, fats: 0.65 },
      },
      maintenance: {
        balanced: { protein: 0.30, carbs: 0.45, fats: 0.25 },
        low_carb: { protein: 0.35, carbs: 0.25, fats: 0.40 },
        high_protein: { protein: 0.40, carbs: 0.35, fats: 0.25 },
      },
      muscleGain: {
        balanced: { protein: 0.35, carbs: 0.45, fats: 0.20 },
        high_protein: { protein: 0.40, carbs: 0.40, fats: 0.20 },
        low_carb: { protein: 0.40, carbs: 0.25, fats: 0.35 },
      },
    };
    const goalDists = distributions[goal];
    const dist = goalDists[diet] || goalDists.balanced;

    const protein = Math.round((calories * dist.protein) / 4);
    const carbs = Math.round((calories * dist.carbs) / 4);
    const fats = Math.round((calories * dist.fats) / 9);
    return {
      protein,
      carbs,
      fats,
      fat: fats, // legacy alias (older backend returned `fat`)
      proteinPct: Math.round(dist.protein * 100),
      carbsPct: Math.round(dist.carbs * 100),
      fatsPct: Math.round(dist.fats * 100),
    };
  }

  private calculateBodyFat(data: Inputs) {
    this.requireNumbers(data, ['weight', 'waist', 'neck', 'height']);
    const { weight, gender, neck, waist, hip, height } = data;
    if (gender !== 'male' && (hip === undefined || hip === null)) {
      throw new BadRequestException(`Field 'hip' is required for female body-fat calculation`);
    }

    if (gender !== 'male') this.requireNumbers(data, ['hip']);
    if ((gender === 'male' ? waist - neck : waist + Number(hip) - neck) <= 0) throw new BadRequestException('Invalid circumference measurements');
    // U.S. Navy method (all measurements in cm).
    let bodyFat: number;
    if (gender === 'male') {
      bodyFat =
        495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      bodyFat =
        495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) - 450;
    }
    bodyFat = Math.max(0, Math.round(bodyFat * 10) / 10);

    let category = '';
    let color = '';
    if (gender === 'male') {
      if (bodyFat < 6) { category = 'Essential Fat'; color = 'info'; }
      else if (bodyFat < 14) { category = 'Athletic'; color = 'success'; }
      else if (bodyFat < 18) { category = 'Fitness'; color = 'success'; }
      else if (bodyFat < 25) { category = 'Average'; color = 'warning'; }
      else { category = 'Obese'; color = 'error'; }
    } else {
      if (bodyFat < 14) { category = 'Essential Fat'; color = 'info'; }
      else if (bodyFat < 21) { category = 'Athletic'; color = 'success'; }
      else if (bodyFat < 25) { category = 'Fitness'; color = 'success'; }
      else if (bodyFat < 32) { category = 'Average'; color = 'warning'; }
      else { category = 'Obese'; color = 'error'; }
    }

    const leanMass = Math.round(weight * (1 - bodyFat / 100) * 10) / 10;
    const fatMass = Math.round((weight - leanMass) * 10) / 10;

    return { bodyFat, value: bodyFat, category, color, leanMass, fatMass };
  }

  private calculateWater(data: Inputs) {
    this.requireNumbers(data, ['weight']);
    const { weight, climate } = data;
    // Accept both `activityLevel` (backend name) and `activity` (frontend name).
    const level = data.activityLevel ?? data.activity;
    const base = weight * 0.033; // 33ml per kg
    const activityAdd: Record<string, number> = {
      sedentary: 0,
      light: 0.25,
      moderate: 0.5,
      active: 0.75,
      very_active: 1.0,
    };
    const climateAdd: Record<string, number> = {
      cold: -0.1,
      temperate: 0,
      warm: 0.3,
      hot: 0.6,
    };
    const total = base + (activityAdd[level] ?? activityAdd.moderate ?? 0.5) + (climateAdd[climate] ?? 0);
    const litres = Math.round(total * 10) / 10;
    return {
      litres,
      liters: litres, // alias
      ml: Math.round(litres * 1000),
      glasses: Math.round(litres / 0.25),
      min: Math.round(weight * 30),
      max: Math.round(weight * 35),
      daily: `${(weight * 30 / 1000).toFixed(1)}–${(weight * 35 / 1000).toFixed(1)}L`,
    };
  }

  private calculateQurbani(data: Inputs) {
    this.requireNumbers(data, ['weight', 'people']);
    const { animal, weight, people } = data;
    if (people <= 0) {
      throw new BadRequestException(`Field 'people' must be greater than 0`);
    }

    const meatYield = weight * 0.6;
    const perPerson = meatYield / people;

    return {
      totalMeat: parseFloat(meatYield.toFixed(2)),
      perPerson: parseFloat(perPerson.toFixed(2)),
      animal,
      people,
    };
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ── Round 1: expanded calculators (mirror frontend/src/utils/calculators.js) ── */

  private calculateWaistHip(data: Inputs) {
    this.requireNumbers(data, ['waist', 'hip']);
    const { waist, hip, gender } = data;
    const ratio = waist / hip;
    const rounded = Math.round(ratio * 1000) / 1000;
    let category: string, color: string;
    if (gender === 'male') {
      if (ratio < 0.85) { category = 'Low Risk'; color = 'success'; }
      else if (ratio < 0.9) { category = 'Moderate Risk'; color = 'warning'; }
      else { category = 'High Risk'; color = 'error'; }
    } else {
      if (ratio < 0.8) { category = 'Low Risk'; color = 'success'; }
      else if (ratio < 0.85) { category = 'Moderate Risk'; color = 'warning'; }
      else { category = 'High Risk'; color = 'error'; }
    }
    return { ratio: rounded, category, color, cutoff: gender === 'male' ? 0.9 : 0.85 };
  }

  private calculateBoerLBM(data: Inputs) {
    this.requireNumbers(data, ['weight', 'height']);
    const { weight, height, gender } = data;
    let lbm: number;
    if (gender === 'male') lbm = 0.407 * weight + 0.267 * height - 19.2;
    else lbm = 0.252 * weight + 0.473 * height - 48.3;
    lbm = Math.round(lbm * 10) / 10;
    return {
      lbm,
      fatMass: Math.round((weight - lbm) * 10) / 10,
      lbmPct: Math.round((lbm / weight) * 1000) / 10,
    };
  }

  private calculateCalorieTarget(data: Inputs) {
    this.requireNumbers(data, ['tdee']);
    const { tdee, goal, rate } = data;
    const rateKgPerWeek = rate == null ? 0.5 : Number(rate);
    if (!Number.isFinite(rateKgPerWeek) || rateKgPerWeek < 0 || rateKgPerWeek > 1) throw new BadRequestException('Weekly rate must be between 0 and 1 kg');
    const dailyDelta = goal === 'maintain' || goal === 'maintenance' ? 0 : Math.round((rateKgPerWeek * 7700) / 7);
    let target = tdee, label = 'Maintenance';
    if (goal === 'lose') { target = tdee - dailyDelta; label = 'Fat Loss'; }
    else if (goal === 'gain') { target = tdee + dailyDelta; label = 'Muscle Gain'; }
    const clamped = Math.max(target, 1200);
    return {
      tdee, target: Math.round(clamped), dailyDelta, rateKgPerWeek, label,
      belowFloor: clamped !== target,
      safetyNote: clamped !== target
        ? 'Calculated target was below the display floor of 1,200 kcal/day. This floor is not a personalised safe intake; seek a dietitian’s advice before restricting calories.'
        : null,
    };
  }

  private calculateFiber(data: Inputs) {
    this.requireNumbers(data, ['tdee']);
    const { tdee, gender } = data;
    const fromCalories = Math.round((tdee / 1000) * 14);
    const ai = gender === 'male' ? 38 : 25;
    return { fromCalories, ai, recommended: Math.max(fromCalories, ai), unit: 'g/day' };
  }

  private calculateMUST(data: Inputs) {
    this.requireNumbers(data, ['bmi', 'loss']);
    const { bmi, loss, acute } = data;
    const acuteDisease = acute === 'yes' || acute === true;
    const bmiScore = bmi > 20 ? 0 : bmi >= 18.5 ? 1 : 2;
    const lossScore = loss < 5 ? 0 : loss <= 10 ? 1 : 2;
    const acuteScore = acuteDisease ? 2 : 0;
    const total = bmiScore + lossScore + acuteScore;
    let risk: string, color: string, action: string;
    if (total === 0) { risk = 'Low Risk'; color = 'success'; action = 'Routine clinical care; repeat screening.'; }
    else if (total === 1) { risk = 'Medium Risk'; color = 'warning'; action = 'Observe: document intake for 3 days.'; }
    else { risk = 'High Risk'; color = 'error'; action = 'Treat: refer to a dietitian/physician.'; }
    return { bmiScore, lossScore, acuteScore, total, risk, color, action };
  }

  private calculateCorrectedCalcium(data: Inputs) {
    this.requireNumbers(data, ['ca', 'albumin']);
    const { ca, albumin } = data;
    const corrected = Math.round((ca + 0.8 * (4.0 - albumin)) * 100) / 100;
    let status: string, color: string;
    if (corrected < 8.5) { status = 'Low (Hypocalcaemia)'; color = 'warning'; }
    else if (corrected <= 10.5) { status = 'Normal'; color = 'success'; }
    else { status = 'High (Hypercalcaemia)'; color = 'error'; }
    return { corrected, status, color };
  }

  private calculateIron(data: Inputs) {
    this.requireNumbers(data, ['age']);
    const { age, gender, stage } = data;
    const lifeStage = stage || 'none';
    if (age > 120 || (lifeStage !== 'none' && (gender !== 'female' || age < 14 || age > 50))) throw new BadRequestException('Check age and life stage');
    let rda: number, group: string;
    if (lifeStage === 'pregnant') { rda = 27; group = 'Pregnant (14–50 y)'; }
    else if (lifeStage === 'lactating') { rda = age < 19 ? 10 : 9; group = age < 19 ? 'Lactating (14–18 y)' : 'Lactating (19–50 y)'; }
    else if (age < 7 / 12) { rda = 0.27; group = 'Infant (0–6 mo; adequate intake)'; }
    else if (age < 1) { rda = 11; group = 'Infant (7–12 mo)'; }
    else if (age < 4) { rda = 7; group = 'Child (1–3 y)'; }
    else if (age < 9) { rda = 10; group = 'Child (4–8 y)'; }
    else if (age < 14) { rda = 8; group = 'Child (9–13 y)'; }
    else if (age < 19) { rda = gender === 'male' ? 11 : 15; group = 'Adolescent (14–18 y)'; }
    else if (age < 51) { rda = gender === 'male' ? 8 : 18; group = 'Adult (19–50 y)'; }
    else { rda = 8; group = 'Adult (51+ y)'; }
    return { rda, group, unit: 'mg/day' };
  }

  private calculateBreastfeeding(data: Inputs) {
    this.requireNumbers(data, ['tdee', 'age']);
    const { tdee, age } = data;
    if (age > 12) throw new BadRequestException('Infant age must be 0–12 months');
    const extra = age < 6 ? 330 : 400;
    return {
      base: tdee, extra, total: tdee + extra,
      phase: age < 6 ? '0–6 months (exclusive breastfeeding)' : '6–12 months (with complementary foods)',
    };
  }

  private calculateSweatRate(data: Inputs) {
    this.requireNumbers(data, ['pre', 'post', 'fluid', 'urine', 'hours']);
    const { pre, post, fluid, urine, hours } = data;
    const litres = (pre - post + fluid - urine) / hours;
    if (litres < 0) throw new BadRequestException('Measurements imply negative sweat loss');
    const rounded = Math.round(litres * 100) / 100;
    let level: string, color: string;
    if (rounded < 0.5) { level = 'Low'; color = 'success'; }
    else if (rounded < 1.2) { level = 'Moderate'; color = 'info'; }
    else if (rounded < 2.0) { level = 'High'; color = 'warning'; }
    else { level = 'Very High'; color = 'error'; }
    return { litresPerHour: rounded, mlPerHour: Math.round(rounded * 1000), level, color };
  }

  private calculateSodiumLoss(data: Inputs) {
    this.requireNumbers(data, ['rate']);
    const { rate, sodium, hours } = data;
    const sodiumMgL = sodium == null ? 1000 : Number(sodium);
    const hrs = hours == null ? 1 : Number(hours);
    if (!Number.isFinite(sodiumMgL) || sodiumMgL < 0 || !Number.isFinite(hrs) || hrs <= 0) throw new BadRequestException('Invalid sodium concentration or duration');
    const mgPerHour = Math.round(rate * sodiumMgL);
    const totalMg = Math.round(mgPerHour * hrs);
    let level: string;
    if (mgPerHour < 500) level = 'Low';
    else if (mgPerHour < 1200) level = 'Moderate';
    else level = 'High — replace with an electrolyte drink';
    return { mgPerHour, totalMg, saltEquivalentG: Math.round((totalMg / 393) * 10) / 10, level };
  }

  private checkUrine(data: Inputs) {
    this.requireNumbers(data, ['colour']);
    const colour = Number(data.colour);
    if (!Number.isInteger(colour) || colour < 1 || colour > 8) throw new BadRequestException('Colour must be 1–8');
    let status: string, color: string, advice: string;
    if (colour <= 3) { status = 'Well Hydrated'; color = 'success'; advice = 'Pale straw to light yellow is the target.'; }
    else if (colour <= 5) { status = 'Mildly Dehydrated'; color = 'warning'; advice = 'Drink a glass or two of water now.'; }
    else { status = 'Dehydrated'; color = 'error'; advice = 'Drink water steadily over the next few hours.'; }
    return { colour, status, color, advice };
  }

  private calculateInfantFormula(data: Inputs) {
    this.requireNumbers(data, ['weight']);
    const { weight, feeds } = data;
    const feedsPerDay = feeds == null ? 8 : Number(feeds);
    if (!Number.isInteger(feedsPerDay) || feedsPerDay < 1 || feedsPerDay > 24) throw new BadRequestException('Feeds must be a whole number from 1–24');
    const dailyMl = Math.round(weight * 150);
    return {
      dailyMl,
      dailyRange: `${Math.round(weight * 120)}–${Math.round(weight * 180)} mL`,
      perFeed: Math.round(dailyMl / feedsPerDay),
      feedsPerDay,
    };
  }

  private calculateAthleteProtein(data: Inputs) {
    this.requireNumbers(data, ['weight']);
    const { weight, sport } = data;
    const ranges: Record<string, { min: number; max: number; label: string }> = {
      endurance: { min: 1.2, max: 1.4, label: 'Endurance (running, cycling, swimming)' },
      team: { min: 1.4, max: 1.7, label: 'Team / intermittent sports' },
      strength: { min: 1.6, max: 2.2, label: 'Strength / power sports' },
    };
    const r = ranges[sport] || ranges.team;
    const mid = (r.min + r.max) / 2;
    return {
      label: r.label,
      min: Math.round(weight * r.min),
      max: Math.round(weight * r.max),
      optimal: Math.round(weight * mid),
      perMeal: Math.round((weight * mid) / 4),
      unit: 'g/day',
    };
  }

  private calculateCarbLoading(data: Inputs) {
    this.requireNumbers(data, ['weight']);
    const { weight } = data;
    const target = Math.round(weight * 11);
    return {
      min: Math.round(weight * 10), max: Math.round(weight * 12), target,
      perMeal: Math.round(target / 4), days: '2 days before the event', unit: 'g/day',
    };
  }

  private calculatePreworkoutCarbs(data: Inputs) {
    this.requireNumbers(data, ['weight', 'hours']);
    const { weight, hours } = data;
    if (hours > 4) throw new BadRequestException('Timing must be within 1–4 hours');
    const perKg = Math.min(4, Math.max(1, hours));
    return {
      min: Math.round(weight * Math.max(1, perKg - 1)),
      max: Math.round(weight * perKg),
      hoursBefore: hours, timing: `${hours} h before exercise`, unit: 'g',
    };
  }
}
