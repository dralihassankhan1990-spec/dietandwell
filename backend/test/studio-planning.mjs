import test from 'node:test';import assert from 'node:assert/strict';
import {studioEnergy,studioMealBudget} from '../../frontend/src/utils/studioPlanning.js';
const p={age:'30',weight:'65',height:'165',sex:'female',activity:'light',goal:'balance',special:'none',clinicianKcal:'',confirmed:false};
test('adult energy estimate and all meal allocations preserve total',()=>{const r=studioEnergy(p);assert.equal(r.bmr,1370);assert.equal(r.target,1884);for(const count of ['3','4','5']){const meals=studioMealBudget(r.target,count);assert.equal(meals.length,Number(count));assert.equal(meals.reduce((s,m)=>s+m.kcal,0),r.target);}});
test('clinical pathways do not auto-prescribe',()=>{for(const goal of ['diabetes','hypertension','renal','pregnancy']){assert.equal(studioEnergy({...p,goal}).target,undefined);assert.equal(studioEnergy({...p,goal,clinicianKcal:'1800',confirmed:true}).target,1800);}});
test('invalid and child values are rejected',()=>{for(const change of [{age:'12'},{weight:'-5'},{height:'Infinity'},{clinicianKcal:'abc'}])assert.ok(studioEnergy({...p,...change}).error);});
test('weight goals show correct signed adjustment',()=>{assert.equal(studioEnergy({...p,goal:'loss'}).delta,-300);assert.equal(studioEnergy({...p,goal:'gain'}).delta,300);});
