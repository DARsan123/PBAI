import {z} from 'zod';
import {getModule} from '../core/modules';
import {allowedQuestions,cleanAnswers,emergency,medication,language,filterSchema,claimSchema,grounded,numericBullets,URGENT,CARE,UNAVAILABLE,INSUFFICIENT} from './guards';
import {generate,model} from './llm';
import {retrieve} from './retrieve';
const roles:Record<string,string>={'checkin-extract':'Patient','patient-education':'Patient','explain-option':'Clinician','change-summary':'Clinician','research-query':'Researcher'};
const events:Record<string,string>={'checkin-extract':'ai_checkin_extraction','patient-education':'ai_patient_education','explain-option':'ai_explanation_generated','change-summary':'ai_change_summary','research-query':'ai_research_query'};
const requestSchema=z.object({role:z.string(),moduleId:z.enum(['t2d','depression','hypertension']),text:z.string().max(2000).default(''),optionId:z.string().optional(),profile:z.record(z.string(),z.union([z.number(),z.boolean(),z.null()])).optional(),missing:z.array(z.string()).max(20).optional(),blocked:z.boolean().optional(),signedFollowUp:z.object({version:z.number().int().positive(),text:z.string().max(2000)}).optional(),timeline:z.array(z.object({at:z.string().datetime(),state:z.enum(['URGENT','PROMPT_REVIEW','ROUTINE','UNABLE_TO_ASSESS']),answers:z.record(z.string(),z.union([z.number(),z.boolean(),z.null()])),missing:z.array(z.string()),openAlerts:z.number().int().min(0)}).strict()).max(100).optional()}).strict();
export async function handle(feature:string,raw:unknown){
 if(!roles[feature])return {status:404,body:{message:'Not found'}};
 if((raw as {role?:string})?.role!==roles[feature])return {status:403,body:{message:'Access denied'}};
 const parsed=requestSchema.safeParse(raw);if(!parsed.success)return {status:400,body:{message:'Invalid request'}};
 const b=parsed.data,m=getModule(b.moduleId);let retriever='none',ids:string[]=[];
 const done=(data:object,valid:boolean)=>({status:200,body:{...data,label:'AI-generated · verify before use',audit:{action:events[feature],model:model(),retriever,chunkIds:ids,moduleVersion:m.version,validationPassed:valid}}});
 if(b.role==='Patient'&&emergency(b.text))return done({message:URGENT,urgent:true},false);
 if(b.role==='Patient'&&medication(b.text))return done({message:CARE},false);
 try{
 if(feature==='checkin-extract'){
 const shape:Record<string,z.ZodType>={};for(const q of allowedQuestions(m))shape[q.id]=(q.type==='boolean'?z.boolean():z.number().min(q.min??0).max(q.max??1000)).nullable();
 const schema=z.object({answers:z.object(shape).strict(),followups:z.array(z.string().max(180)).max(2)}).strict();
 const out=await generate('Extract only explicitly stated non-red-flag values. Use null when absent. Ask at most two questions from the provided question labels. Never answer red flags.',{language:language(b.text),questions:allowedQuestions(m)},schema);
 return done({answers:cleanAnswers(m,out.answers),followups:out.followups.filter(s=>!medication(s)&&!emergency(s))},true);
 }
 if(feature==='research-query'){const filters=await generate('Translate to allowed filters only. Baseline lower_burden or higher_burden; all if unspecified. Only response endpoint at 8 weeks. Do not invent unsupported filters.',{query:language(b.text)},filterSchema);return done({filters},true);}
 if(feature==='change-summary'){if(!b.timeline?.length)return done({message:'No changes since the last signed decision.'},true);const out=await generate('Summarize only supplied changes in 3–5 short bullets. No new numbers, dates, diagnoses or recommendations.',b.timeline,z.object({bullets:z.array(z.string().max(300)).min(3).max(5)}).strict());const bullets=numericBullets(out.bullets,b.timeline);return done(bullets.length?{bullets}:{message:UNAVAILABLE},bullets.length>0);}
 if(feature==='explain-option'&&b.blocked!==false)return done({message:'Option comparison blocked. Complete human safety review.'},false);
 const option=m.options.find(o=>o.id===b.optionId);if(feature==='explain-option'&&!option)return {status:400,body:{message:'Unknown option'}};
 if(feature==='patient-education'){const intent=await generate('Classify intent: education, medication, diagnosis or emergency. Do not answer.',{language:language(b.text)},z.object({intent:z.enum(['education','medication','diagnosis','emergency'])}).strict());if(intent.intent!=='education')return done({message:intent.intent==='emergency'?URGENT:CARE,urgent:intent.intent==='emergency'},false);}
 const r=await retrieve({query:option?option.drugClass+' '+option.considerations:language(b.text),moduleId:m.id,audience:b.role==='Patient'?'patient':'clinician'});retriever=r.retriever;ids=r.chunks.map(c=>c.id);
 const fallback=feature==='patient-education'?"I can't answer that from the approved information. Please ask your care team.":INSUFFICIENT;
 if(!r.chunks.length)return done({message:fallback},false);
 const passages=[...r.chunks.map(c=>({id:c.id,text:c.text}))];
 // Only a signed version is accepted by the demo client. Do not forward clinician names or unrestricted prose.
 if(b.role==='Patient'&&b.signedFollowUp){passages.push({id:'signed-followup',text:language(b.signedFollowUp.text)});ids.push('signed-followup');}
 const out=await generate('Use only provided passages. Each claim must be ONE sentence with citations containing passage ids supporting every part. No unsupported claims; return empty claims if insufficient. Never recommend a medication.',{query:language(b.text),option,profile:b.profile,missing:b.missing,passages},claimSchema);
 const claims=grounded(out.claims,ids);return done(claims.length?{claims,sources:r.chunks.map(({text,...c})=>c),signedVersion:b.signedFollowUp?.version}:{message:fallback},claims.length>0);
 }catch{return done({message:UNAVAILABLE},false);}
}
