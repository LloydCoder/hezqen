import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { calculators, getCalculator } from "@/domain/labs/calculator-suite";
import CalculatorExperience from "./calculator-experience";

export function generateStaticParams(){return calculators.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const definition=getCalculator(slug);if(!definition)return {};
 return {title:definition.title+" | HEZQEN Labs",description:definition.description,alternates:{canonical:"/labs/"+slug},openGraph:{title:definition.title+" | HEZQEN Labs",description:definition.description,type:"website"}};
}
export default async function LabsCalculatorPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const definition=getCalculator(slug);if(!definition)notFound();
 return <CalculatorExperience definition={definition}/>;
}
