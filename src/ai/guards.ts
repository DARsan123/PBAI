import {z} from 'zod';
import type {Module,Answers} from '../core/types';
export const UNAVAILABLE='AI assistance unavailable.';
export const INSUFFICIENT='Insufficient evidence in the approved corpus — manual review required.';
export const CARE='Medication decisions are made with your clinician. Please contact your care team.';
export const URGENT='Seek immediate human help. If you are in immediate danger, contact local emergency services now. Answer the structured red-flag questions directly; do not wait for AI.';
export const emergency=(s:string)=>/suicid|self[ -]?harm|kill myself|hurt myself|end my life|want to die|overdose|chest pain|cannot breathe|can.t breathe|stroke|unconscious|severe low|immediate danger/i.test(s);
export const medication=(s:string)=>/medicat|\bdos(e|age|ing)\b|\bmg\b|\b(start|stop|switch|increase|decrease|take|prescrib)\w*\b|diagnos|what (drug|medicine)|which (drug|medicine)/i.test(s);
// Restrict outbound patient language to a health vocabulary; names/contact/identifiers are not forwarded.
const vocabulary=new Set('i feel feeling am is are was not no yes my have has been today yesterday glucose reading blood sugar pressure systolic diastolic mood wellbeing well being worse worsening better sad happy low high illness dehydration thirsty dizzy tired fatigue sleep sleeping appetite pain condition diabetes depression hypertension check ins matter condition plan in follow up visit plan appointment cohort moderate higher baseline burden response endpoint horizon weeks eight all type t2d why what how when help care team clinician medication dose start stop switch diagnosis'.split(' '));
export function language(s:string){return s.toLowerCase().match(/[a-z]+|\d+(?:\.\d+)?/g)?.filter(t=>vocabulary.has(t)||/^\d{1,3}(\.\d+)?$/.test(t)).join(' ')||'';}
export function allowedQuestions(m:Module){const red=new Set(m.rules.filter(r=>r.state==='URGENT').flatMap(r=>r.all.map(x=>x.field)));return m.questions.filter(q=>!red.has(q.id));}
export function cleanAnswers(m:Module,input:Record<string,unknown>):Answers{const out:Answers={};for(const q of allowedQuestions(m)){const v=input[q.id];const schema=q.type==='boolean'?z.boolean():z.number().min(q.min??-Infinity).max(q.max??Infinity);if(schema.safeParse(v).success)out[q.id]=v as number|boolean;}return out;}
export function confirmedAnswers(current:Answers,suggested:Answers,confirmed:boolean){return confirmed?{...current,...suggested}:current;}
export const filterSchema=z.object({condition:z.enum(['t2d','depression','hypertension']),baseline:z.enum(['all','lower_burden','higher_burden']),endpoint:z.literal('response'),horizon:z.literal(8)}).strict();
export const claimSchema=z.object({claims:z.array(z.object({text:z.string().max(500),citations:z.array(z.string()).min(1)})).max(8)}).strict();
export function grounded(claims:z.infer<typeof claimSchema>['claims'],ids:string[]){return claims.filter(c=>c.citations.length>0&&c.citations.every(id=>ids.includes(id))&&!/\b\d+\s*(mg|mcg|tablets?)\b|\b(start|stop|switch|increase|decrease)\b/i.test(c.text));}
export function numericBullets(bullets:string[],input:unknown){const tokens=new Set(JSON.stringify(input).match(/\d+(?:\.\d+)?/g)||[]);return bullets.filter(b=>(b.match(/\d+(?:\.\d+)?/g)||[]).every(n=>tokens.has(n)));}

