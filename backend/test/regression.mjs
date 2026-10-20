import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as c from '../../frontend/src/utils/calculators.js';
const require = createRequire(import.meta.url);
const { CalculatorsService } = require('../dist/calculators/calculators.service.js');
const { ContactService } = require('../dist/contact/contact.service.js');
const service = new CalculatorsService({}, {}, { get: () => undefined });
const cases = [
 ['bmi',{weight:70,height:175},()=>({bmi:Number(c.calculateBMI(70,175))}),['bmi']],
 ['tdee',{weight:70,height:175,age:30,gender:'male',activity:'moderate'},()=>c.calculateTDEE(70,175,30,'male','moderate'),['bmr','tdee']],
 ['water_intake',{weight:70,activity:'active',climate:'hot'},()=>c.calculateWaterIntake(70,'active','hot'),['litres','daily']],
 ['waist_hip',{waist:80,hip:100,gender:'female'},()=>c.calculateWaistHipRatio(80,100,'female'),['ratio']],
 ['lean_mass',{weight:70,height:175,gender:'male'},()=>c.calculateBoerLBM(70,175,'male'),['lbm']],
 ['calorie_target',{tdee:2400,goal:'maintain',rate:0},()=>c.calculateCalorieTarget(2400,'maintain',0),['target','dailyDelta']],
 ['fiber',{tdee:2500,gender:'male'},()=>c.calculateFiberNeeds(2500,'male'),['recommended']],
 ['must_score',{bmi:18,loss:11,acute:true},()=>c.calculateMUSTScore(18,11,true),['total']],
 ['corrected_calcium',{ca:8,albumin:3},()=>c.calculateCorrectedCalcium(8,3),['corrected']],
 ['iron',{age:17,gender:'female',stage:'lactating'},()=>c.calculateIronNeeds(17,'female','lactating'),['rda']],
 ['breastfeeding',{tdee:2000,age:3},()=>c.calculateBreastfeedingCalories(2000,3),['total']],
 ['sweat_rate',{pre:70,post:69.5,fluid:0.5,urine:0,hours:1},()=>c.calculateSweatRate(70,69.5,.5,0,1),['litresPerHour']],
 ['sodium_loss',{rate:1,sodium:1000,hours:2},()=>c.calculateSodiumLoss(1,1000,2),['totalMg']],
 ['urine_check',{colour:3},()=>c.checkUrineHydration(3),['status']],
 ['infant_formula',{weight:4,feeds:8},()=>c.calculateInfantFormula(4,8),['dailyMl','perFeed']],
 ['athlete_protein',{weight:70,sport:'strength'},()=>c.calculateAthleteProtein(70,'strength'),['min','max']],
 ['carb_loading',{weight:70},()=>c.calculateCarbLoading(70),['target']],
 ['preworkout_carbs',{weight:70,hours:1},()=>c.calculatePreWorkoutCarbs(70,1),['min','max']],
];
for(const [type,input,compute,keys] of cases) test(`frontend / backend: ${type}`, async()=>{
 const actual=await service.calculate({type,inputData:input}); const expected=compute();
 const result=actual.result || actual.results || actual;
 for(const key of keys) assert.equal(Number.isFinite(expected[key]) ? Number(result[key]) : result[key],expected[key],key);
});
test('known reference results',()=>{
 assert.equal(c.calculateBMI(70,175),'22.9'); assert.equal(c.calculateBMR(70,175,30,'male'),1649);
 assert.equal(c.calculateMacros(2000,'maintenance').protein,150);
 assert.equal(c.calculateCaloriesFromFood(10,10,10),170);
 assert.equal(c.calculatePediatricDosage(20,10,600,3).dailyTotal,600);
 assert.equal(c.calculateChildBMI(35,140,10,'male').category,'Growth-chart assessment needed');
 assert.equal(c.calculateVO2Max(30,'male',60).vo2,48.5);
 assert.equal(c.calculateWaistToHeight(90,180).category,'Increased central adiposity');
});
test('invalid inputs cannot yield infinity or negative sweat loss',async()=>{
 assert.throws(()=>c.calculateBMI(70,0)); assert.throws(()=>c.calculateBodyFat(70,30,40,175,0,'male'));
 assert.throws(()=>c.calculateSweatRate(70,72,0,0,1)); assert.throws(()=>c.calculateInfantFormula(4,0));
 await assert.rejects(()=>service.calculate({type:'bmi',inputData:{weight:70,height:0}}));
});
test('contact read preserves replied state and missing email configuration cannot mark a reply sent',async()=>{
 const inquiry={id:'test',status:'replied',notes:'existing'};
 const repo={findOne:async()=>inquiry,save:async v=>v};
 const contacts=new ContactService(repo,{get:()=>undefined});
 assert.equal((await contacts.markAsRead('test')).status,'replied');
 await assert.rejects(()=>contacts.reply('test','Test message'));
 assert.equal(inquiry.notes,'existing');
});
