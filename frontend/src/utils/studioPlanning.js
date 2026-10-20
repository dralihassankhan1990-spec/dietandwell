export function studioEnergy(profile) {
  const age=Number(profile.age), weight=Number(profile.weight), height=Number(profile.height);
  if (!profile.age || !profile.weight || !profile.height || !Number.isFinite(age+weight+height) || age<18 || age>120 || weight<30 || weight>350 || height<100 || height>230) return {error:'Enter adult sample values: age 18–120, weight 30–350 kg and height 100–230 cm.'};
  const clinical=!['balance','loss','gain','sport','budget','vegetarian'].includes(profile.goal) || profile.special!=='none';
  const clinician=Number(profile.clinicianKcal);
  if (profile.clinicianKcal && (!Number.isFinite(clinician) || clinician<1000 || clinician>6000)) return {error:'Check the entered clinician target (supported display range 1,000–6,000 kcal). This range is not a safety recommendation.'};
  const factor={sedentary:1.2,light:1.375,moderate:1.55,active:1.725}[profile.activity];
  if (!factor) return {error:'Select a supported activity level.'};
  const bmr=['male','female'].includes(profile.sex) ? Math.round(10*weight+6.25*height-5*age+(profile.sex==='male'?5:-161)) : null;
  const maintenance=bmr?Math.round(bmr*factor):null;
  if ((clinical || !bmr) && !(clinician && profile.confirmed)) return {bmr,maintenance,clinical:true,error:'This pathway requires an individual clinician-set energy target and review. Automatic calorie changes are not applied.'};
  const adjustment=profile.goal==='loss'?-300:profile.goal==='gain'?300:0;
  const target=clinician&&profile.confirmed?Math.round(clinician):maintenance+adjustment;
  if (target<1500 && !(clinician&&profile.confirmed)) return {bmr,maintenance,error:'The estimate is below the automatic preview threshold. Use an individual target reviewed by a dietitian.'};
  return {bmr,maintenance,target,delta:maintenance?target-maintenance:null,clinical,source:clinician&&profile.confirmed?'Entered clinician target (not verified by this website)':'Mifflin–St Jeor estimate; 300 kcal goal adjustment where selected'};
}
export function studioMealBudget(target, count) {
  const weights=count==='5'?[.25,.1,.3,.1,.25]:count==='4'?[.25,.35,.1,.3]:[.3,.4,.3];
  const labels=count==='5'?['Breakfast','Morning snack','Lunch','Afternoon snack','Dinner']:count==='4'?['Breakfast','Lunch','Afternoon snack','Dinner']:['Breakfast','Lunch','Dinner'];
  let allocated=0;
  return weights.map((weight,i)=>{const kcal=i===weights.length-1?target-allocated:Math.round(target*weight);allocated+=kcal;return {label:labels[i],kcal};});
}
