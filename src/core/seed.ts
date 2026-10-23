import { modules } from './modules';
import { defaults, evaluateSafety } from './engine';
import type { Patient, CheckIn, Datum } from './types';
export const SEED=42017;
export function seedData(){
 let seed=SEED; const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
 const patients:Patient[]=[],checkIns:CheckIn[]=[];
 const datum=(value:Datum['value'],verified=true,unit?:string):Datum=>({value,verified,source:'synthetic',date:'2026-10-01',...(unit?{unit}:{}),...(value===null?{nullReason:'not_available'}:{})});
 for(const [mi,m] of modules.entries()) for(let i=0;i<20;i++){
  const id=mi===0?(i===0?'DM-042':'DM-'+String(100+i).padStart(3,'0')):mi===1?(i===0?'DEP-017':'DEP-'+String(100+i).padStart(3,'0')):'HTN-'+String(100+i).padStart(3,'0');
  const p:Patient={id,moduleId:m.id,ageBand:i%2?'45–54':'55–64',profile:{diagnosis:datum(m.name),kidneyCondition:datum(mi===0&&i===0),renalStatus:datum(i%4===0?null:82,i%4!==0,'mL/min/1.73m²'),allergies:datum(i%7===6?null:'No reported allergies',i%7!==6),currentTherapy:datum('Synthetic class A exposure'),interactionReview:datum(i%5===0?null:'Documented in synthetic fixture',i%5!==0),classAAllergy:datum(i===5)},preferences:mi===0&&i===0?['Avoid hypoglycemia','Discuss cost and treatment burden']:['Discuss tolerability and treatment burden'],clinicalConsent:true,researchConsent:i%6!==5,baseline:i<14?'Moderate baseline':'Higher baseline',response:i%7===0?null:random()>.3};
  patients.push(p);
  for(let j=0;j<3+i%3;j++){
   const answers=defaults(m);const metric=m.questions.find(q=>q.unit);
   if(metric)answers[metric.id]=Number(metric.default)+(mi===1?j-2:8-j*3+Math.floor(random()*4));
   checkIns.push({id:'seed-'+id+'-'+j,patientId:id,at:'2026-10-'+String(3+j*4).padStart(2,'0')+'T09:00:00.000Z',answers,note:'Synthetic historical check-in',evaluation:evaluateSafety(m,answers),source:'synthetic'});
  }
 }
 return {patients,checkIns};
}
