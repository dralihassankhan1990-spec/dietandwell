const requireRange = (name, value, min = 0, max = Infinity, allowZero = false) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || (allowZero ? value < min : value <= min) || value > max) throw new Error(`Check ${name}: enter a valid ${allowZero ? 'non-negative' : 'positive'} number within the supported range.`);
};

/* ================================================================
   DietAndWell — Complete Calculator Utilities
   All formulas are evidence-based and medically referenced.
   ================================================================ */

// ── BODY COMPOSITION ─────────────────────────────────────────────

export const calculateBMI = (weight, height) => {
  requireRange('weight', weight); requireRange('height', height);
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
};

export const getBMICategory = (bmi) => {
  if (bmi < 16)   return { category: 'Severely Underweight', color: 'info',    ring: 15 };
  if (bmi < 18.5) return { category: 'Underweight',          color: 'info',    ring: 30 };
  if (bmi < 25)   return { category: 'Normal Weight',        color: 'success', ring: 65 };
  if (bmi < 30)   return { category: 'Overweight',           color: 'warning', ring: 78 };
  if (bmi < 35)   return { category: 'Obese Class I',        color: 'error',   ring: 88 };
  if (bmi < 40)   return { category: 'Obese Class II',       color: 'error',   ring: 95 };
  return           { category: 'Obese Class III',            color: 'error',   ring: 100 };
};

export const calculateBodyFat = (weight, waist, neck, height, hip, gender) => {
  [weight, waist, neck, height].forEach(v => requireRange('measurements', v)); if (gender !== 'male') requireRange('hip', hip); if ((gender === 'male' ? waist - neck : waist + hip - neck) <= 0) throw new Error('Waist measurements must exceed neck circumference.');
  // U.S. Navy Method (all measurements in cm)
  let bf;
  if (gender === 'male') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }
  bf = Math.max(0, Math.round(bf * 10) / 10);
  let category, color;
  if (gender === 'male') {
    if (bf < 6)        { category = 'Essential Fat';  color = 'info'; }
    else if (bf < 14)  { category = 'Athletic';       color = 'success'; }
    else if (bf < 18)  { category = 'Fitness';        color = 'success'; }
    else if (bf < 25)  { category = 'Average';        color = 'warning'; }
    else               { category = 'Obese';          color = 'error'; }
  } else {
    if (bf < 14)       { category = 'Essential Fat';  color = 'info'; }
    else if (bf < 21)  { category = 'Athletic';       color = 'success'; }
    else if (bf < 25)  { category = 'Fitness';        color = 'success'; }
    else if (bf < 32)  { category = 'Average';        color = 'warning'; }
    else               { category = 'Obese';          color = 'error'; }
  }
  return { value: bf, category, color, max: 50 };
};

export const calculateLeanBodyMass = (weight, bodyFatPercent) => {
  requireRange('weight', weight); requireRange('body fat percentage', bodyFatPercent, 0, 100, true);
  const lbm = weight * (1 - bodyFatPercent / 100);
  return Math.round(lbm * 10) / 10;
};

export const calculateIdealWeight = (height, gender) => {
  requireRange('height', height);
  // Devine Formula
  const heightInches = height / 2.54;
  let base = gender === 'male' ? 50 : 45.5;
  let ideal = base + 2.3 * (heightInches - 60);
  ideal = Math.max(30, ideal);
  return {
    devine: Math.round(ideal),
    min: Math.round(ideal - 5),
    max: Math.round(ideal + 5),
    bmiMin: Math.round(18.5 * (height / 100) ** 2),
    bmiMax: Math.round(24.9 * (height / 100) ** 2),
  };
};

export const calculateWaistToHeight = (waist, height) => {
  requireRange('waist', waist); requireRange('height', height);
  const ratio = waist / height;
  const rounded = Math.round(ratio * 1000) / 1000;
  let category, color, advice;
  if (ratio < 0.4) { category = 'Below reference range'; color = 'info'; }
  else if (ratio < 0.5) { category = 'Healthy central adiposity'; color = 'success'; }
  else if (ratio < 0.6) { category = 'Increased central adiposity'; color = 'warning'; }
  else { category = 'High central adiposity'; color = 'error'; }
  advice = 'Adult screening measure, generally used with BMI below 35. Discuss results in context with your clinician.';
  return { ratio: rounded, category, color, advice };
};

// ── CALORIE & METABOLISM ─────────────────────────────────────────

export const calculateBMR = (weight, height, age, gender) => {
  requireRange('weight', weight); requireRange('height', height); requireRange('adult age', age, 17, 120);
  // Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return Math.round(bmr);
};

export const calculateTDEE = (weight, height, age, gender, activity) => {
  const bmr = calculateBMR(weight, height, age, gender);
  const multipliers = {
    sedentary:  { factor: 1.2,  label: 'Sedentary',    desc: 'Little or no exercise' },
    light:      { factor: 1.375, label: 'Light',        desc: '1–3 days/week' },
    moderate:   { factor: 1.55,  label: 'Moderate',     desc: '3–5 days/week' },
    active:     { factor: 1.725, label: 'Active',       desc: '6–7 days/week' },
    very_active:{ factor: 1.9,   label: 'Very Active',  desc: 'Hard exercise twice/day' },
  };
  const m = multipliers[activity] || multipliers.moderate;
  const tdee = Math.round(bmr * m.factor);
  return {
    bmr,
    tdee,
    weightLoss: Math.round(tdee - 500),
    weightGain: Math.round(tdee + 300),
    activityLabel: m.label,
  };
};

export const calculateCaloriesFromFood = (protein, carbs, fat, alcohol = 0) => {
  [protein, carbs, fat, alcohol].forEach(v => requireRange('grams', v, 0, Infinity, true));
  return Math.round(protein * 4 + carbs * 4 + fat * 9 + alcohol * 7);
};

export const calculateDailyCalories = (weight, height, age, gender, activity) => {
  return calculateTDEE(weight, height, age, gender, activity).tdee;
};

// ── MACRONUTRIENTS ────────────────────────────────────────────────

export const calculateMacros = (calories, goal, diet = 'balanced') => {
  requireRange('calories', calories);
  const distributions = {
    weightLoss:  { balanced:   { protein: 0.35, carbs: 0.40, fats: 0.25 },
                   low_carb:   { protein: 0.40, carbs: 0.20, fats: 0.40 },
                   keto:       { protein: 0.30, carbs: 0.05, fats: 0.65 } },
    maintenance: { balanced:   { protein: 0.30, carbs: 0.45, fats: 0.25 },
                   low_carb:   { protein: 0.35, carbs: 0.25, fats: 0.40 },
                   high_protein:{ protein: 0.40, carbs: 0.35, fats: 0.25 } },
    muscleGain:  { balanced:   { protein: 0.35, carbs: 0.45, fats: 0.20 },
                   high_protein:{ protein: 0.40, carbs: 0.40, fats: 0.20 },
                   low_carb:   { protein: 0.40, carbs: 0.25, fats: 0.35 } },
  };
  const goalDists = distributions[goal] || distributions.maintenance;
  const dist = goalDists[diet] || goalDists.balanced || goalDists[Object.keys(goalDists)[0]];
  return {
    protein: Math.round((calories * dist.protein) / 4),
    carbs:   Math.round((calories * dist.carbs)   / 4),
    fats:    Math.round((calories * dist.fats)    / 9),
    proteinPct: Math.round(dist.protein * 100),
    carbsPct:   Math.round(dist.carbs * 100),
    fatsPct:    Math.round(dist.fats * 100),
  };
};

export const calculateProteinIntake = (weight, goal, activityLevel = 'moderate') => {
  requireRange('weight', weight);
  const ranges = {
    maintenance: { min: 1.2, max: 1.6, optimal: 1.4 },
    muscleGain:  { min: 1.8, max: 2.5, optimal: 2.2 },
    weightLoss:  { min: 1.6, max: 2.4, optimal: 2.0 },
    endurance:   { min: 1.2, max: 1.8, optimal: 1.5 },
  };
  const r = ranges[goal] || ranges.maintenance;
  return {
    min: Math.round(weight * r.min),
    max: Math.round(weight * r.max),
    optimal: Math.round(weight * r.optimal),
    perMeal: Math.round((weight * r.optimal) / 4),
    gramsPerDay: Math.round(weight * r.optimal),
  };
};

// ── HYDRATION ─────────────────────────────────────────────────────

export const calculateWaterIntake = (weight, activity = 'moderate', climate = 'temperate') => {
  requireRange('weight', weight);
  let base = weight * 0.033; // 33ml per kg
  const activityAdd = { sedentary: 0, light: 0.25, moderate: 0.5, active: 0.75, very_active: 1.0 };
  const climateAdd  = { cold: -0.1, temperate: 0, warm: 0.3, hot: 0.6 };
  const total = base + (activityAdd[activity] || 0) + (climateAdd[climate] || 0);
  const rounded = Math.round(total * 10) / 10;
  return {
    litres: rounded,
    ml: Math.round(rounded * 1000),
    glasses: Math.round(rounded / 0.25),
    min: Math.round(weight * 30),
    max: Math.round(weight * 35),
    daily: `${(weight * 30 / 1000).toFixed(1)}–${(weight * 35 / 1000).toFixed(1)}L`,
  };
};

// ── CARDIOVASCULAR ────────────────────────────────────────────────

export const calculateTargetHeartRate = (age, restingHR = 65, fitnessGoal = 'fat_burn') => {
  requireRange('age', age, 0, 120); requireRange('resting heart rate', restingHR); if (restingHR >= 220-age) throw new Error('Resting heart rate must be below estimated maximum heart rate.');
  const maxHR = 220 - age; // Standard formula
  const hrReserve = maxHR - restingHR;
  const zones = {
    warmup:    { min: 0.50, max: 0.60, label: 'Warm-up',       color: 'info' },
    fat_burn:  { min: 0.60, max: 0.70, label: 'Fat Burn',      color: 'success' },
    aerobic:   { min: 0.70, max: 0.80, label: 'Aerobic',       color: 'success' },
    anaerobic: { min: 0.80, max: 0.90, label: 'Anaerobic',     color: 'warning' },
    max_effort:{ min: 0.90, max: 1.00, label: 'Maximum Effort',color: 'error' },
  };
  const allZones = Object.entries(zones).map(([key, z]) => ({
    key,
    label: z.label,
    color: z.color,
    min: Math.round(restingHR + hrReserve * z.min),
    max: Math.round(restingHR + hrReserve * z.max),
  }));
  const selected = zones[fitnessGoal] || zones.fat_burn;
  return {
    maxHR,
    restingHR,
    targetMin: Math.round(restingHR + hrReserve * selected.min),
    targetMax: Math.round(restingHR + hrReserve * selected.max),
    goalLabel: selected.label,
    allZones,
  };
};

export const calculateVO2Max = (age, gender, restingHR, weight = null, method = 'resting') => {
  requireRange('adult age', age, 17, 120); requireRange('resting heart rate', restingHR); if (method !== 'resting' && method !== 'cooper') throw new Error('Unsupported estimation method.'); if (method === 'cooper') requireRange('distance in metres', weight, 504.9);
  // Multiple estimation methods
  let vo2;
  if (method === 'resting') {
    // Uth-Sørensen-Overgaard-Pedersen equation
    const maxHR = 220 - age;
    vo2 = 15.3 * (maxHR / restingHR);
  } else if (method === 'cooper' && weight) {
    // Cooper 12-min run test estimate (distance in meters)
    vo2 = (weight - 504.9) / 44.73;
  }
  vo2 = Math.round(vo2 * 10) / 10;
  let category, color;
  const isGoodVO2 = gender === 'male'
    ? { poor: 35, fair: 42, good: 50, excellent: 55 }
    : { poor: 28, fair: 35, good: 42, excellent: 48 };
  if (vo2 < isGoodVO2.poor)      { category = 'Poor',       color = 'error'; }
  else if (vo2 < isGoodVO2.fair) { category = 'Fair',       color = 'warning'; }
  else if (vo2 < isGoodVO2.good) { category = 'Good',       color = 'success'; }
  else if (vo2 < isGoodVO2.excellent){ category = 'Excellent', color = 'success'; }
  else                           { category = 'Superior',   color = 'success'; }
  return { vo2, category: 'Rough estimate, not a fitness diagnosis', color: 'info', max: 80 };
};

// ── BLOOD & CHOLESTEROL ───────────────────────────────────────────

export const calculateCholesterolRatio = (totalCholesterol, hdl, ldl, triglycerides) => {
  [totalCholesterol, hdl, ldl].forEach(v => requireRange('cholesterol', v)); requireRange('triglycerides', triglycerides, 0, Infinity, true);
  const totalHDL = totalCholesterol / hdl;
  const ldlHDL   = ldl / hdl;
  const trig_HDL = triglycerides / hdl;
  let riskLevel, color;
  if (totalHDL < 3.5)       { riskLevel = 'Optimal';   color = 'success'; }
  else if (totalHDL < 5.0)  { riskLevel = 'Normal',    color = 'success'; }
  else if (totalHDL < 6.0)  { riskLevel = 'Elevated',  color = 'warning'; }
  else                      { riskLevel = 'High Risk',  color = 'error'; }
  return {
    totalHDL: Math.round(totalHDL * 100) / 100,
    ldlHDL:   Math.round(ldlHDL   * 100) / 100,
    trig_HDL: Math.round(trig_HDL * 100) / 100,
    riskLevel, color,
  };
};

// ── WOMEN'S HEALTH ────────────────────────────────────────────────

export const calculateFertilityWindow = (lastPeriodDate, cycleLength = 28) => {
  requireRange('cycle length', cycleLength, 20, 45);
  const lp = new Date(`${lastPeriodDate}T12:00:00`);
  if (Number.isNaN(lp.getTime())) throw new Error('Enter a valid period start date.');
  const ovulationDay = cycleLength - 14;
  const ovulation = new Date(lp);
  ovulation.setDate(lp.getDate() + ovulationDay);
  const windowStart = new Date(ovulation);
  windowStart.setDate(ovulation.getDate() - 5);
  const windowEnd = new Date(ovulation);
  windowEnd.setDate(ovulation.getDate() + 1);
  const nextPeriod = new Date(lp);
  nextPeriod.setDate(lp.getDate() + cycleLength);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return {
    ovulationDate:  fmt(ovulation),
    windowStart:    fmt(windowStart),
    windowEnd:      fmt(windowEnd),
    nextPeriod:     fmt(nextPeriod),
    daysUntilOvulation: Math.ceil((ovulation - new Date()) / 86400000),
  };
};

export const calculatePregnancyWeightGain = (prePregnancyBMI, currentWeek) => {
  requireRange('BMI', prePregnancyBMI); requireRange('pregnancy week', currentWeek, 0, 42); currentWeek = Math.min(40, currentWeek);
  const bmiCat = prePregnancyBMI < 18.5 ? 'underweight'
    : prePregnancyBMI < 25  ? 'normal'
    : prePregnancyBMI < 30  ? 'overweight'
    : 'obese';
  const guidelines = {
    underweight: { min: 12.7, max: 18.1, label: 'Underweight (BMI < 18.5)' },
    normal:      { min: 11.3, max: 15.9, label: 'Normal Weight (BMI 18.5–24.9)' },
    overweight:  { min: 6.8,  max: 11.3, label: 'Overweight (BMI 25–29.9)' },
    obese:       { min: 5.0,  max: 9.1,  label: 'Obese (BMI ≥ 30)' },
  };
  const g = guidelines[bmiCat];
  const weeklyMin = currentWeek > 13 ? (g.min - 0.9) / 27 : 0;
  const weeklyMax = currentWeek > 13 ? (g.max - 0.9) / 27 : 0;
  const expectedMin = currentWeek <= 13 ? 0.5 : 0.9 + weeklyMin * (currentWeek - 13);
  const expectedMax = currentWeek <= 13 ? 1.5 : 0.9 + weeklyMax * (currentWeek - 13);
  return {
    category: g.label,
    totalMin: g.min,
    totalMax: g.max,
    expectedMin: Math.round(expectedMin * 10) / 10,
    expectedMax: Math.round(expectedMax * 10) / 10,
    trimester: currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3,
  };
};

// ── CHILDREN'S HEALTH ─────────────────────────────────────────────

export const calculateChildBMI = (weight, height, age, gender) => {
  const bmi = parseFloat(calculateBMI(weight, height));
  if (age < 2 || age >= 20) throw new Error('Child BMI is for ages 2–19.');
  // CDC classification needs exact age and sex-specific growth-chart data.
  return { bmi: bmi.toFixed(1), category: 'Growth-chart assessment needed', color: 'info' };
};

// ── ALCOHOL UNITS ─────────────────────────────────────────────────

export const calculateAlcoholUnits = (volumeML, abvPercent) => {
  requireRange('volume', volumeML); requireRange('ABV', abvPercent, 0, 100, true);
  // UK standard: 1 unit = 10ml pure alcohol
  const units = (volumeML * abvPercent) / 1000;
  const calories = units * 56; // ~56 cal per unit
  let riskLevel, color;
  const weeklyLimit = 14; // UK guideline
  if (units <= 2)          { riskLevel = 'Low Risk';    color = 'success'; }
  else if (units <= 4)     { riskLevel = 'Moderate';    color = 'warning'; }
  else                     { riskLevel = 'High Risk';   color = 'error'; }
  return {
    units: Math.round(units * 10) / 10,
    calories: Math.round(calories),
    riskLevel, color,
    weeklyLimit,
  };
};

// ── MEDICATION DOSAGE ─────────────────────────────────────────────

export const calculatePediatricDosage = (weightKg, dosePerKg, maxDailyDose, dosesPerDay) => {
  [weightKg, dosePerKg, maxDailyDose, dosesPerDay].forEach(v => requireRange('prescribed values', v));
  const singleDose = weightKg * dosePerKg;
  const cappedDose = Math.min(singleDose, maxDailyDose / dosesPerDay);
  return {
    singleDose:   Math.round(cappedDose * 10) / 10,
    dailyTotal:   Math.round(cappedDose * dosesPerDay * 10) / 10,
    isCapped:     singleDose > cappedDose,
    note: cappedDose !== singleDose ? 'Arithmetic exceeds the entered daily limit. Confirm the prescription with a pharmacist.' : null,
  };
};

// --- Mock blog posts used by demo pages (kept here for convenience) ---
export const mockBlogPosts = [
  {
    id: 1,
    slug: 'macro-tracking-basics',
    title: 'The Complete Guide to Macro Tracking',
    excerpt: 'Learn how to optimize your protein, carbs, and fats for maximum results.',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&q=80',
    date: 'Mar 12, 2024',
    readTime: 8,
    author: 'Dr. Sarah Chen',
    content: '# Macro Tracking\n\nMacro tracking helps you understand how different nutrients affect your body.\n\n- Protein builds muscle\n- Carbs provide energy\n\n## Getting Started\n\nStart by logging your daily intake.'
  },
  {
    id: 2,
    slug: 'hydration-foundation',
    title: 'Hydration: The Foundation of Wellness',
    excerpt: "Why water is your secret weapon for recovery and performance.",
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
    date: 'Feb 02, 2024',
    readTime: 5,
    author: 'Marcus Thorne',
    content: '# Hydration\n\nProper hydration supports cognition and recovery. Aim for consistent intake across the day.'
  },
  {
    id: 3,
    slug: 'anti-inflammatory-meals',
    title: 'Anti-Inflammatory Meals to Speed Recovery',
    excerpt: 'Meal ideas and ingredients that help reduce systemic inflammation.',
    category: 'Cooking',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
    date: 'Jan 20, 2024',
    readTime: 6,
    author: 'Elena Rodriguez',
    content: '# Anti-inflammatory Meals\n\nFoods rich in omega-3s and antioxidants may help lower inflammation.'
  }
];


// ── ROUND 1 EXPANSION: 15 NEW EVIDENCE-BASED FORMULAS ────────────
// Every function below implements a real published formula.
// (Boer 1984; WHO WHR cutoffs; Wishnofsky 7700 kcal/kg; IOM/FNB;
//  BAPEN MUST; Payne corrected calcium; ACSM sweat rate; ISSN protein;
//  Burke carb loading; Armstrong urine colour chart.)

// Waist-to-Hip Ratio — WHO cutoffs (substantially increased risk:
// men ≥ 0.90, women ≥ 0.85)
export const calculateWaistHipRatio = (waist, hip, gender) => {
  requireRange('waist', waist); requireRange('hip', hip);
  const ratio = waist / hip;
  const rounded = Math.round(ratio * 1000) / 1000;
  let category, color;
  if (gender === 'male') {
    if (ratio < 0.85)        { category = 'Low Risk';      color = 'success'; }
    else if (ratio < 0.90)   { category = 'Moderate Risk'; color = 'warning'; }
    else                     { category = 'High Risk';     color = 'error'; }
  } else {
    if (ratio < 0.80)        { category = 'Low Risk';      color = 'success'; }
    else if (ratio < 0.85)   { category = 'Moderate Risk'; color = 'warning'; }
    else                     { category = 'High Risk';     color = 'error'; }
  }
  const cutoff = gender === 'male' ? 0.90 : 0.85;
  return { ratio: rounded, category, color, cutoff };
};

// Lean Body Mass — Boer formula (1984). weight kg, height cm.
export const calculateBoerLBM = (weight, height, gender) => {
  requireRange('weight', weight); requireRange('height', height);
  let lbm;
  if (gender === 'male') lbm = 0.407 * weight + 0.267 * height - 19.2;
  else                   lbm = 0.252 * weight + 0.473 * height - 48.3;
  lbm = Math.round(lbm * 10) / 10;
  const fatMass = Math.round((weight - lbm) * 10) / 10;
  const lbmPct  = Math.round((lbm / weight) * 1000) / 10;
  return { lbm, fatMass, lbmPct };
};

// Calorie Target — goal-based. 1 kg body fat ≈ 7700 kcal (Wishnofsky).
export const calculateCalorieTarget = (tdee, goal, rateKgPerWeek = 0.5) => {
  requireRange('TDEE', tdee); requireRange('weekly rate', rateKgPerWeek, 0, 1, true);
  const KCAL_PER_KG = 7700;
  const dailyDelta = goal === 'maintain' || goal === 'maintenance' ? 0 : Math.round((rateKgPerWeek * KCAL_PER_KG) / 7);
  let target = tdee, label = 'Maintenance';
  if (goal === 'lose')      { target = tdee - dailyDelta; label = 'Fat Loss'; }
  else if (goal === 'gain') { target = tdee + dailyDelta; label = 'Muscle Gain'; }
  // Safety floor (widely published minimums) — never prescribe below these.
  const floor = 1200;
  const clamped = Math.max(target, floor);
  return {
    tdee, target: Math.round(clamped), dailyDelta,
    rateKgPerWeek, label,
    belowFloor: clamped !== target,
    safetyNote: clamped !== target
      ? 'Calculated target was below the display floor of 1,200 kcal/day. This floor is not a personalised safe intake; seek a dietitian’s advice before restricting calories.'
      : null,
  };
};

// Fiber Needs — Institute of Medicine / Food and Nutrition Board:
// 14 g per 1,000 kcal; Adequate Intake 38 g men, 25 g women.
export const calculateFiberNeeds = (tdee, gender) => {
  requireRange('TDEE', tdee);
  const fromCalories = Math.round((tdee / 1000) * 14);
  const ai = gender === 'male' ? 38 : 25;
  const recommended = Math.max(fromCalories, ai);
  return { fromCalories, ai, recommended, unit: 'g/day' };
};

// MUST score — Malnutrition Universal Screening Tool (BAPEN).
// BMI >20 → 0; 18.5–20 → 1; <18.5 → 2.
// Unplanned weight loss: <5% → 0; 5–10% → 1; >10% → 2.
// Acute disease (no intake >5 days) → 2. 0 = low, 1 = medium, ≥2 = high.
export const calculateMUSTScore = (bmi, weightLossPct, acuteDisease) => {
  requireRange('BMI', bmi); requireRange('weight loss percentage', weightLossPct, 0, 100, true);
  const bmiScore  = bmi > 20 ? 0 : bmi >= 18.5 ? 1 : 2;
  const lossScore = weightLossPct < 5 ? 0 : weightLossPct <= 10 ? 1 : 2;
  const acuteScore = acuteDisease ? 2 : 0;
  const total = bmiScore + lossScore + acuteScore;
  let risk, color, action;
  if (total === 0)      { risk = 'Low Risk';    color = 'success'; action = 'Routine clinical care; repeat screening (e.g. weekly in care settings).'; }
  else if (total === 1) { risk = 'Medium Risk'; color = 'warning'; action = 'Observe: document intake for 3 days; repeat screening weekly.'; }
  else                  { risk = 'High Risk';   color = 'error';   action = 'Treat: refer to a dietitian/physician and start a nutrition care plan.'; }
  return { bmiScore, lossScore, acuteScore, total, risk, color, action };
};

// Corrected Calcium — Payne formula (1973).
// Corrected (mg/dL) = measured + 0.8 × (4.0 − albumin g/dL). Normal: 8.5–10.5.
export const calculateCorrectedCalcium = (measuredMgDl, albuminGDl) => {
  requireRange('calcium', measuredMgDl); requireRange('albumin', albuminGDl);
  const corrected = Math.round((measuredMgDl + 0.8 * (4.0 - albuminGDl)) * 100) / 100;
  let status, color;
  if (corrected < 8.5)       { status = 'Low (Hypocalcaemia)';  color = 'warning'; }
  else if (corrected <= 10.5){ status = 'Normal';               color = 'success'; }
  else                       { status = 'High (Hypercalcaemia)'; color = 'error'; }
  return { corrected, status, color };
};

// Iron Needs — daily iron RDA (mg/day), Institute of Medicine / FNB table.
export const calculateIronNeeds = (age, gender, lifeStage = 'none') => {
  requireRange('age', age, 0, 120, true); if (lifeStage !== 'none' && (gender !== 'female' || age < 14 || age > 50)) throw new Error('Pregnancy/lactation table applies to females aged 14–50.');
  // lifeStage: 'none' | 'pregnant' | 'lactating'
  let rda, group;
  if (lifeStage === 'pregnant')       { rda = 27; group = 'Pregnant (14–50 y)'; }
  else if (lifeStage === 'lactating') { rda = age < 19 ? 10 : 9; group = age < 19 ? 'Lactating (14–18 y)' : 'Lactating (19–50 y)'; }
  else if (age < 7 / 12) { rda = 0.27; group = 'Infant (0–6 mo; adequate intake)'; }
  else if (age < 1)                  { rda = 11; group = 'Infant (7–12 mo)'; }
  else if (age < 4)                  { rda = 7;  group = 'Child (1–3 y)'; }
  else if (age < 9)                  { rda = 10; group = 'Child (4–8 y)'; }
  else if (age < 14)                 { rda = 8;  group = 'Child (9–13 y)'; }
  else if (age < 19)                 { rda = gender === 'male' ? 11 : 15; group = 'Adolescent (14–18 y)'; }
  else if (age < 51)                 { rda = gender === 'male' ? 8 : 18;  group = 'Adult (19–50 y)'; }
  else                               { rda = 8;  group = 'Adult (51+ y)'; }
  return { rda, group, unit: 'mg/day' };
};

// Breastfeeding Calorie Needs — IOM: +330 kcal/day (0–6 mo), +400 kcal/day (6–12 mo)
// above pre-pregnancy energy needs.
export const calculateBreastfeedingCalories = (baseTDEE, infantAgeMonths) => {
  requireRange('TDEE', baseTDEE); requireRange('infant age in months', infantAgeMonths, 0, 12, true);
  const extra = infantAgeMonths < 6 ? 330 : 400;
  const phase = infantAgeMonths < 6 ? '0–6 months (exclusive breastfeeding)' : '6–12 months (with complementary foods)';
  return { base: baseTDEE, extra, total: baseTDEE + extra, phase };
};

// Sweat Rate — ACSM guideline.
// Sweat rate (L/h) = (pre kg − post kg + fluid L − urine L) ÷ hours.
export const calculateSweatRate = (preKg, postKg, fluidL, urineL, hours) => {
  [preKg, postKg, hours].forEach(v => requireRange('weight/duration', v)); [fluidL, urineL].forEach(v => requireRange('fluid volume', v, 0, Infinity, true)); if (preKg - postKg + fluidL - urineL < 0) throw new Error('Measurements imply negative sweat loss. Recheck weights and fluid volumes.');
  const litres = (preKg - postKg + fluidL - urineL) / hours;
  const rounded = Math.round(litres * 100) / 100;
  let level, color;
  if (rounded < 0.5)      { level = 'Low';       color = 'success'; }
  else if (rounded < 1.2) { level = 'Moderate';  color = 'info'; }
  else if (rounded < 2.0) { level = 'High';      color = 'warning'; }
  else                    { level = 'Very High'; color = 'error'; }
  return { litresPerHour: rounded, mlPerHour: Math.round(rounded * 1000), level, color };
};

// Sodium Loss from Sweat — loss (mg/h) = sweat rate (L/h) × sweat [Na⁺] (mg/L).
// Typical sweat sodium ≈ 1000 mg/L (range ~460–1840; Maughan & Shirreffs).
export const calculateSodiumLoss = (sweatRateLh, sodiumMgL = 1000, hours = 1) => {
  [sweatRateLh, sodiumMgL].forEach(v => requireRange('sweat measurement', v, 0, Infinity, true)); requireRange('duration', hours);
  const mgPerHour = Math.round(sweatRateLh * sodiumMgL);
  const totalMg = Math.round(mgPerHour * hours);
  const saltG = Math.round((totalMg / 393) * 10) / 10; // ~393 mg Na per gram of table salt
  let level;
  if (mgPerHour < 500)      level = 'Low';
  else if (mgPerHour < 1200) level = 'Moderate';
  else                       level = 'High — replace with an electrolyte drink';
  return { mgPerHour, totalMg, saltEquivalentG: saltG, level };
};

// Urine Colour Hydration Check — Armstrong urine colour chart (1–8 scale).
// 1–3 well hydrated; 4–5 mildly dehydrated; 6–8 dehydrated. Subjective tool.
export const checkUrineHydration = (colour) => {
  requireRange('colour', colour, 0, 8); if (!Number.isInteger(colour)) throw new Error('Select a whole-number colour from 1 to 8.');
  let status, color, advice;
  if (colour <= 3)      { status = 'Well Hydrated';     color = 'success'; advice = 'Pale straw to light yellow is the target. Keep up your current intake.'; }
  else if (colour <= 5) { status = 'Mildly Dehydrated'; color = 'warning'; advice = 'Drink a glass or two of water now and keep sipping through the day.'; }
  else                  { status = 'Dehydrated';        color = 'error';   advice = 'Drink water steadily over the next few hours — not all at once.'; }
  return { colour, status, color, advice };
};

// Infant Formula Volume — standard paediatric estimate ≈ 150 mL/kg/day
// (accepted range 120–180 mL/kg/day for healthy term infants).
export const calculateInfantFormula = (weightKg, feedsPerDay = 8) => {
  requireRange('weight', weightKg); requireRange('feeds per day', feedsPerDay, 0, 24); if (!Number.isInteger(feedsPerDay)) throw new Error('Feeds per day must be a whole number.');
  const dailyMl = Math.round(weightKg * 150);
  const perFeed = Math.round(dailyMl / feedsPerDay);
  return {
    dailyMl,
    dailyRange: `${Math.round(weightKg * 120)}–${Math.round(weightKg * 180)} mL`,
    perFeed, feedsPerDay,
  };
};

// Protein for Athletes — International Society of Sports Nutrition (ISSN):
// endurance 1.2–1.4, team sports 1.4–1.7, strength/power 1.6–2.2 g/kg/day.
export const calculateAthleteProtein = (weightKg, sportType) => {
  requireRange('weight', weightKg);
  const ranges = {
    endurance: { min: 1.2, max: 1.4, label: 'Endurance (running, cycling, swimming)' },
    team:      { min: 1.4, max: 1.7, label: 'Team / intermittent sports' },
    strength:  { min: 1.6, max: 2.2, label: 'Strength / power sports' },
  };
  const r = ranges[sportType] || ranges.team;
  return {
    label: r.label,
    min: Math.round(weightKg * r.min),
    max: Math.round(weightKg * r.max),
    optimal: Math.round(weightKg * ((r.min + r.max) / 2)),
    perMeal: Math.round((weightKg * ((r.min + r.max) / 2)) / 4),
    unit: 'g/day',
  };
};

// Carb Loading — classical protocol (Burke et al.): 10–12 g/kg/day for
// 36–48 hours before an endurance event lasting >90 minutes.
export const calculateCarbLoading = (weightKg) => {
  requireRange('weight', weightKg);
  const min = Math.round(weightKg * 10);
  const max = Math.round(weightKg * 12);
  const target = Math.round(weightKg * 11);
  return { min, max, target, perMeal: Math.round(target / 4), days: '2 days before the event', unit: 'g/day' };
};

// Pre-Workout Carbs — ACSM/ISSN: 1–4 g/kg eaten 1–4 hours before exercise
// (closer to the session → smaller amount).
export const calculatePreWorkoutCarbs = (weightKg, hoursBefore) => {
  requireRange('weight', weightKg); requireRange('hours before exercise', hoursBefore, 0, 4);
  const perKg = Math.min(4, Math.max(1, hoursBefore));
  const min = Math.round(weightKg * Math.max(1, perKg - 1));
  const max = Math.round(weightKg * perKg);
  return { min, max, hoursBefore, timing: `${hoursBefore} h before exercise`, unit: 'g' };
};
