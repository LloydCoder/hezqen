import assert from "node:assert/strict";
import test from "node:test";
import { calculators, calculateLab } from "./calculator-suite.ts";

const inputFor=(slug)=>Object.fromEntries(calculators.find((item)=>item.slug===slug).fields.map((field)=>[field.key,field.initial]));
test("registers fourteen additional calculators with unique stable slugs",()=>{
 assert.equal(calculators.length,14);
 assert.equal(new Set(calculators.map((item)=>item.slug)).size,14);
});
for(const definition of calculators){
 test(definition.title+" returns finite, labeled metrics for default inputs",()=>{
  const result=calculateLab(definition.slug,inputFor(definition.slug));
  assert.ok(result.headline.length>0);
  assert.ok(result.metrics.length>=3);
  for(const metric of result.metrics){assert.ok(Number.isFinite(metric.value),metric.label);assert.ok(metric.unit.length>0);}
  assert.ok(result.notes.length>=1);
 });
 test(definition.title+" rejects missing and out-of-range inputs",()=>{
  const values=inputFor(definition.slug);
  const key=definition.fields[0].key;
  const missing = { ...values };
  delete missing[key];
  assert.throws(()=>calculateLab(definition.slug,missing),RangeError);
  assert.throws(()=>calculateLab(definition.slug,{...values,[key]:Number.NaN}),RangeError);
  assert.throws(()=>calculateLab(definition.slug,{...values,[key]:(definition.fields[0].max??1e12)+1}),RangeError);
 });
}
test("RAG sizing scales vector payload with embedding dimensions",()=>{
 const values=inputFor("rag-storage");const one=calculateLab("rag-storage",values);const two=calculateLab("rag-storage",{...values,embeddingDimensions:values.embeddingDimensions*2});
 assert.ok(two.metrics.find((m)=>m.label==="Vector payload").value>one.metrics.find((m)=>m.label==="Vector payload").value);
});
test("database forecast grows with retention horizon",()=>{
 const values=inputFor("database-capacity");const one=calculateLab("database-capacity",values);const two=calculateLab("database-capacity",{...values,months:values.months+12});
 assert.ok(two.metrics.find((m)=>m.label==="With headroom").value>one.metrics.find((m)=>m.label==="With headroom").value);
});
test("agent costs include retry overhead",()=>{
 const values=inputFor("agent-cost");const one=calculateLab("agent-cost",values);const two=calculateLab("agent-cost",{...values,retryPercent:50});
 assert.ok(two.metrics.find((m)=>m.label==="Total").value>one.metrics.find((m)=>m.label==="Total").value);
});
test("rejects unknown calculator slugs",()=>assert.throws(()=>calculateLab("unknown",{}),RangeError));
