"use client";
import { useMemo, useState } from "react";
import { calculateLab, type CalculatorDefinition } from "@/domain/labs/calculator-suite";

export default function CalculatorExperience({definition}:{definition:CalculatorDefinition}){
 const [values,setValues]=useState<Record<string,number>>(()=>Object.fromEntries(definition.fields.map((field)=>[field.key,field.initial])));
 const [error,setError]=useState("");
 const result=useMemo(()=>{try{return calculateLab(definition.slug,values);}catch(e){return null;}},[definition.slug,values]);
 const update=(key:string,value:string)=>{const number=Number(value);setValues((current)=>({...current,[key]:number}));};
 const money=(value:number)=>value.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2});
 const formatted=(value:number,unit:string,precision=2)=>unit==="USD"?money(value):value.toLocaleString("en-US",{maximumFractionDigits:precision})+" "+unit;
 return <main className="vram-page"><div className="container">
  <a className="back-link" href="/labs">← All HEZQEN Labs calculators</a>
  <p className="eyebrow"><span className="eyebrow-line"/> HEZQEN LABS / {definition.category.toUpperCase()}</p>
  <h1>{definition.title}</h1><p className="vram-lede">{definition.description}</p>
  <div className="vram-layout">
   <section className="vram-panel" aria-labelledby="suite-inputs"><div className="vram-panel-heading"><p className="section-label">SCENARIO INPUTS</p><h2 id="suite-inputs">Configure your assumptions</h2></div>
    <div className="vram-fields">{definition.fields.map((field)=><label className="vram-field" key={field.key}><span>{field.label} <small>({field.unit})</small></span><input type="number" inputMode="decimal" min={field.min??0} max={field.max??1e12} step={field.step??1} value={Number.isFinite(values[field.key])?values[field.key]:""} onChange={(event)=>update(field.key,event.target.value)} aria-describedby={field.help?field.key+"-help":undefined}/>{field.help&&<small id={field.key+"-help"}>{field.help}</small>}</label>)}</div>
    <p className="vram-footnote">Values are local to this browser session and are not submitted to HEZQEN. All prices are user-supplied scenario assumptions.</p>
   </section>
   <section className="vram-results" aria-live="polite" aria-labelledby="suite-results"><p className="section-label">MODEL OUTPUT</p><h2 id="suite-results">{result?.headline??"Check input values"}</h2>
    {result?<><p className="vram-total">{formatted(result.metrics.find((m)=>m.label==="Total")?.value??result.metrics[0]?.value??0,result.metrics.find((m)=>m.label==="Total")?.unit??result.unit)}</p><div className="vram-breakdown">{result.metrics.map((metric)=><div key={metric.label}><span>{metric.label}</span><strong>{formatted(metric.value,metric.unit,metric.precision)}</strong></div>)}</div></>:<p role="alert">Enter finite values within each field's stated range to calculate this scenario.</p>}
   </section>
  </div>
  <section className="vram-method"><p className="section-label">MODEL PURPOSE & LIMITATIONS</p><h2>Interpret the result carefully</h2><p>{definition.purpose}</p>{result&&<ul>{result.notes.map((note)=><li key={note}>{note}</li>)}</ul>}<p>HEZQEN Labs outputs are transparent planning estimates, not vendor quotes, professional advice, security assessments, audited measurements or performance guarantees. Validate assumptions with production telemetry, representative tests and qualified specialists before making procurement or compliance decisions.</p></section>
 </div></main>;
}
