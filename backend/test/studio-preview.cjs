const test = require('node:test');
const assert = require('node:assert/strict');
const {StudioController} = require('../dist/diet-plan-studio/studio.module');
test('missing key fails clearly, never returns simulated AI',async()=>{
  const controller=new StudioController({get:()=>undefined});
  await assert.rejects(()=>controller.explain({region:'pk'}),e=>e.getStatus()===503);
});
test('real provider adapter sends only fixed sample pantry and reads response',async()=>{
  const original=global.fetch;let request;
  global.fetch=async(url,options)=>{request={url,options};return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'Educational example from provider.'}]}}]})};};
  try{
    const controller=new StudioController({get:(name,fallback)=>name==='GEMINI_API_KEY'?'test-key':fallback});
    const result=await controller.explain({region:'pk'});
    assert.equal(result.explanation,'Educational example from provider.');assert.equal(result.personalised,false);
    assert.match(request.url,/generativelanguage.googleapis.com/);
    assert.match(request.options.body,/Pakistan/);assert.doesNotMatch(request.options.body,/email|password/);
  }finally{global.fetch=original;}
});
test('provider failure returns an error rather than invented explanation',async()=>{
  const original=global.fetch;global.fetch=async()=>({ok:false});
  try{const controller=new StudioController({get:(name,fallback)=>name==='GEMINI_API_KEY'?'test-key':fallback});await assert.rejects(()=>controller.explain({region:'us'}),e=>e.getStatus()===502);}finally{global.fetch=original;}
});
