import { moduleSchema, type Module, type Answers, type Evaluation, type Patient, type OptionCard, type Alert } from './types';
function matches(c:{field:string;op:string;value:string|number|boolean}, values:Answers) {
 const v=values[c.field];
 if(c.op==='eq') return v===c.value;
 if(typeof v!=='number'||typeof c.value!=='number') return false;
 if(c.op==='gte') return v>=c.value;
 if(c.op==='lte') return v<=c.value;
 throw new Error('Unsupported operator');
}
export function evaluateSafety(input:unknown, answers:Answers):Evaluation {
 let version='unknown';
 try {
  const m=moduleSchema.parse(input); version=m.version;
  const missing=m.questions.filter(q=>{
   const v=answers[q.id];
   if(v===undefined||v===null||v==='') return q.required;
   return q.type==='boolean' ? typeof v!=='boolean' : typeof v!=='number'||!Number.isFinite(v)||(q.min!==undefined&&v<q.min)||(q.max!==undefined&&v>q.max);
  }).map(q=>q.id);
  const triggered=m.rules.filter(r=>r.all.every(c=>matches(c,answers)));
  const urgent=triggered.some(r=>r.state==='URGENT');
  return {state:urgent?'URGENT':missing.length?'UNABLE_TO_ASSESS':triggered.length?'PROMPT_REVIEW':'ROUTINE',ruleIds:triggered.map(r=>r.id),missing,reasons:triggered.map(r=>r.reason),moduleVersion:version};
 } catch {return {state:'UNABLE_TO_ASSESS',ruleIds:[],missing:[],reasons:['Safety evaluation unavailable. Human review required.'],moduleVersion:version};}
}
export function pgxConclusion(p:Patient,m:Module,asOf='2026-10-23'):string {
 const r=p.pgx;
 if(!r||!r.valid||!r.phenotype||!Number.isFinite(Date.parse(r.expiresAt))||Date.parse(r.expiresAt)<Date.parse(asOf)||!m.pgxPairs.some(x=>x.drug===r.drug&&x.gene===r.gene&&m.evidence.some(e=>e.id===x.evidenceId))) return 'No actionable PGx conclusion.';
 return 'Documented '+r.gene+' / '+r.drug+' pair; phenotype '+r.phenotype+'. Clinician interpretation required; no automatic treatment change.';
}
export function compareOptions(p:Patient,m:Module,e:Evaluation|undefined,alerts:Alert[]=[]) : {blocked:boolean;reason:string;cards:OptionCard[]} {
 if(!p.clinicalConsent) return {blocked:true,reason:'Clinical demo consent is required.',cards:[]};
 if(!e||!['ROUTINE','PROMPT_REVIEW'].includes(e.state)||alerts.some(a=>a.patientId===p.id&&!a.resolvedAt)) return {blocked:true,reason:'Option comparison blocked until safety assessment and any open urgent alert are resolved.',cards:[]};
 const values=Object.fromEntries(Object.entries(p.profile).filter(([,v])=>v.verified).map(([k,v])=>[k,v.value]));
 const cards=m.options.map(o=>{
  const missing=[...new Set([...m.requiredProfile,...o.criticalFields])].filter(k=>!p.profile[k]||p.profile[k].value===null||!p.profile[k].verified);
  const evidence=m.evidence.find(s=>s.id===o.evidenceId);
  const excluded=o.excludeIf.some(c=>matches(c,values));
  return {...o,missing,evidence,status:excluded?'excluded_by_rule' as const:missing.length||!evidence?'requires_manual_review' as const:'eligible_for_review' as const,pgx:p.pgx&&o.pgxDrugs.includes(p.pgx.drug)?pgxConclusion(p,m):'No actionable PGx conclusion.'};
 });
 return {blocked:false,reason:cards.some(c=>c.status==='requires_manual_review')?'Manual review required. No personalized ranking.':'Illustrative options for clinician review; no ranking.',cards};
}
export function defaults(m:Module):Answers {return Object.fromEntries(m.questions.map(q=>[q.id,q.default]));}
