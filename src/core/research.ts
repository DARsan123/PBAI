import type { Patient } from './types';
export const suppress=(n:number):string=>n<10?'<10':String(n);
export function cohort(patients:Patient[],moduleId:string) {
 const selected=patients.filter(p=>p.researchConsent&&p.moduleId===moduleId);
 return ['Moderate baseline','Higher baseline'].map(baseline=>{
  const group=selected.filter(p=>p.baseline===baseline);
  const N=group.length, observed=group.filter(p=>p.response!==null).length;
  const n=group.filter(p=>p.response===true).length, missing=N-observed, noResponse=observed-n;
  // Complementary suppression: exact totals must not reconstruct a small outcome cell.
  const safe=N>=10&&n>=10&&missing>=10&&noResponse>=10;
  return {baseline,cohort:suppress(N),response:safe?n+'/'+observed:'<10 / withheld',missing:suppress(missing),percent:safe?Math.round(100*n/observed):null,denominator:safe?String(observed):'withheld',suppressed:!safe};
 });
}
export function consentedCount(patients:Patient[],moduleId:string){return suppress(patients.filter(p=>p.researchConsent&&p.moduleId===moduleId).length);}
