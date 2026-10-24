'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { seedData } from './seed';
import { getModule } from './modules';
import { evaluateSafety } from './engine';
import type { Role, Patient, CheckIn, Alert, Decision, Audit, Answers } from './types';
type DemoState={
 role:Role; roleTransition:boolean; selectedId:string; patients:Patient[];checkIns:CheckIn[];alerts:Alert[];decisions:Decision[];audit:Audit[];
 hypothesis:'unreviewed'|'dismissed'|'scientific_review'; storageError:boolean;
 setRole:(role:Role)=>void;selectPatient:(id:string)=>void;reset:()=>void;
 log:(action:string,subject:string,detail:string)=>void;
 consent:(kind:'clinicalConsent'|'researchConsent',value:boolean)=>void;
 submit:(answers:Answers,note:string)=>boolean;
 sign:(input:Pick<Decision,'action'|'rationale'|'followUp'|'signer'>)=>boolean;
 acknowledge:(id:string)=>void;resolve:(id:string,reason:string)=>void;
 reviewHypothesis:(status:'dismissed'|'scientific_review')=>void;
};
const now=()=>new Date().toISOString();
const id=()=>globalThis.crypto?.randomUUID?.()??String(Date.now())+'-'+Math.random().toString(16).slice(2);
const event=(actor:Role|'System',action:string,subject:string,detail:string):Audit=>({id:id(),at:now(),actor,action,subject,detail});
const initial=()=>({...seedData(),role:'Clinician' as Role,roleTransition:false,selectedId:'DM-042',alerts:[] as Alert[],decisions:[] as Decision[],audit:[] as Audit[],hypothesis:'unreviewed' as const,storageError:false});
export const useDemo=create<DemoState>()(persist((set,get)=>({
 ...initial(),
 log:(action,subject,detail)=>set(s=>({audit:[...s.audit,event(s.role,action,subject,detail)]})),
 setRole:role=>set({role,roleTransition:true}),
 selectPatient:selectedId=>{if(get().role==='Researcher'){get().log('access_denied','patient selection','Researcher cannot select patient records');return;} if(get().patients.some(p=>p.id===selectedId))set({selectedId});},
 reset:()=>set(initial()),
 consent:(kind,value)=>{
  const s=get();if(s.role!=='Patient'){s.log('access_denied','consent','Patient role required');return;}
  set({patients:s.patients.map(p=>p.id===s.selectedId?{...p,[kind]:value}:p),audit:[...s.audit,event(s.role,'consent_changed',s.selectedId,kind+' = '+value)]});
 },
 submit:(answers,note)=>{
  const s=get();const p=s.patients.find(p=>p.id===s.selectedId);
  if(s.role!=='Patient'||!p?.clinicalConsent){s.log('access_denied','check-in','Patient role and clinical consent required');return false;}
  const m=getModule(p.moduleId),evaluation=evaluateSafety(m,answers);
  const check:CheckIn={id:id(),patientId:p.id,at:now(),answers:{...answers},note:note.slice(0,2000),evaluation,source:'patient'};
  const urgent=evaluation.state==='URGENT';
  const alert:Alert={id:id(),patientId:p.id,checkInId:check.id,at:check.at,ruleIds:evaluation.ruleIds};
  set({checkIns:[...s.checkIns,check],alerts:urgent?[...s.alerts,alert]:s.alerts,audit:[...s.audit,event(s.role,'checkin_submitted',p.id,check.id),event('System','safety_evaluated',p.id,evaluation.state+'; module '+m.version+'; rules '+(evaluation.ruleIds.join(', ')||'none')+'; missing '+evaluation.missing.join(', ')),...(urgent?[event('System','alert_created',p.id,alert.id+'; not yet acknowledged')]:[])]});
  return true;
 },
 sign:input=>{
  const s=get(),p=s.patients.find(p=>p.id===s.selectedId);
  if(s.role!=='Clinician'||!p?.clinicalConsent){s.log('access_denied','decision','Clinician role and clinical consent required');return false;}
  const check=[...s.checkIns].reverse().find(c=>c.patientId===p.id);
  if(!check||!input.signer.trim()||!input.rationale.trim()||!input.followUp.trim())return false;
  const decision:Decision={...input,id:id(),patientId:p.id,version:s.decisions.filter(d=>d.patientId===p.id).length+1,at:now(),checkInId:check.id,moduleVersion:check.evaluation.moduleVersion};
  set({decisions:[...s.decisions,decision],audit:[...s.audit,event(s.role,'clinician_decision_signed',p.id,'v'+decision.version+'; '+input.action+'; signer '+input.signer+'; module '+decision.moduleVersion)]});return true;
 },
 acknowledge:alertId=>{
  const s=get();if(s.role!=='Clinician'){s.log('access_denied','alert','Clinician role required');return;}
  if(!s.alerts.some(a=>a.id===alertId&&!a.acknowledgedAt))return;
  set({alerts:s.alerts.map(a=>a.id===alertId?{...a,acknowledgedAt:now(),acknowledgedBy:'Demo clinician'}:a),audit:[...s.audit,event(s.role,'alert_acknowledged',alertId,'Acknowledged only; comparison remains blocked')]});
 },
 resolve:(alertId,reason)=>{
  const s=get();if(s.role!=='Clinician'){s.log('access_denied','alert','Clinician role required');return;}
  if(!reason.trim()||!s.alerts.some(a=>a.id===alertId&&a.acknowledgedAt&&!a.resolvedAt))return;
  set({alerts:s.alerts.map(a=>a.id===alertId?{...a,resolvedAt:now(),resolution:reason}:a),audit:[...s.audit,event(s.role,'alert_resolved',alertId,reason)]});
 },
 reviewHypothesis:status=>{
  const s=get();if(s.role!=='Researcher'){s.log('access_denied','hypothesis','Researcher role required');return;}
  set({hypothesis:status,audit:[...s.audit,event(s.role,'hypothesis_reviewed','HYP-001',status+'; isolated from patient care')]});
 }
}),{name:'precisionbridge-demo-v2',version:1,partialize:({roleTransition,...state})=>state,storage:createJSONStorage(()=>({
 getItem:(name)=>localStorage.getItem(name),
 setItem:(name,value)=>{try{localStorage.setItem(name,value);}catch{queueMicrotask(()=>{if(!useDemo.getState().storageError)useDemo.setState({storageError:true});});}},
 removeItem:(name)=>localStorage.removeItem(name)
})),skipHydration:true}));
