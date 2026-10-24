'use client';
import {CheckinAI,PatientEducation,UrgentText} from '@/components/ai-panels';
import {useState} from 'react';
import {HeartPulse,Send,ShieldCheck,FlaskConical,CheckCircle2} from 'lucide-react';
import {RoleGate} from '@/components/shell';
import {PageHeading,PatientPicker,Profile,SafetyNotice,ApprovedPlan,Timeline,Status} from '@/components/shared';
import {Button} from '@/components/ui/button';
import {useDemo} from '@/core/store';
import {getModule} from '@/core/modules';
import {defaults} from '@/core/engine';
import type {Patient,Answers} from '@/core/types';
function CheckInForm({patient}:{patient:Patient}){
 const m=getModule(patient.moduleId),submit=useDemo(s=>s.submit);
 const [answers,setAnswers]=useState<Answers>(()=>defaults(m)),[note,setNote]=useState(''),[message,setMessage]=useState('');
 return <section className="card"><div className="section-heading"><div><div className="eyebrow">STRUCTURED CHECK-IN</div><h2>How are you doing today?</h2></div><HeartPulse size={24}/></div><p className="muted">Answer the structured questions first. These take priority over your note.</p><form onSubmit={e=>{e.preventDefault();if(submit(answers,note)){setMessage('Check-in saved. Your safety status has been updated.');setNote('');}}}>
 <div className="questions">{m.questions.map(q=><label className="question" key={q.id}><span>{q.label} <small>{q.required?'Required':'Optional'}{q.unit?' · '+q.unit:''}</small></span>{q.type==='boolean'?<select aria-label={q.label} value={answers[q.id]===null?'':String(answers[q.id])} onChange={e=>setAnswers({...answers,[q.id]:e.target.value===''?null:e.target.value==='true'})}><option value="">Not answered</option><option value="false">No</option><option value="true">Yes</option></select>:<input aria-label={q.label} type="number" min={q.min} max={q.max} step="1" value={answers[q.id]===null?'':String(answers[q.id])} onChange={e=>setAnswers({...answers,[q.id]:e.target.value===''?null:Number(e.target.value)})}/>}</label>)}</div>
 <label className="form-label">Anything else to share? <span>Optional · synthetic details only</span><textarea value={note} onChange={e=>setNote(e.target.value)} maxLength={2000} placeholder="Add context for your clinician…" rows={3}/></label>
 <UrgentText text={note}/><div className="form-bottom"><span className="fine-print">No medication advice is generated.</span><Button disabled={!patient.clinicalConsent} type="submit"><Send size={15}/>Submit check-in</Button></div><p className="success-message" role="status">{message}</p></form><CheckinAI patient={patient} answers={answers} onConfirm={setAnswers}/></section>;
}
function PatientWorkspace(){
 const p=useDemo(s=>s.patients.find(p=>p.id===s.selectedId)!);
 const check=useDemo(s=>s.checkIns).filter(c=>c.patientId===p.id).at(-1),alerts=useDemo(s=>s.alerts).filter(a=>a.patientId===p.id&&!a.resolvedAt),consent=useDemo(s=>s.consent);
 return <><PageHeading eyebrow="PATIENT WING" title="Your care, in context." description="Share a check-in and stay connected to your clinician-approved next steps."><PatientPicker/></PageHeading><div className="patient-title"><span className="patient-avatar">{p.id.split('-')[0]}</span><div><h2>{p.id}</h2><p>{getModule(p.moduleId).name} · Synthetic profile</p></div>{check&&<Status state={alerts.length?'URGENT':check.evaluation.state}/>}</div>
 <SafetyNotice evaluation={check?.evaluation} openAlerts={alerts}/><Profile patient={p}/><div className="two-column"><div><CheckInForm key={p.id} patient={p}/><Timeline patientId={p.id}/></div><div><ApprovedPlan patientId={p.id}/><PatientEducation key={p.id} patient={p}/><section className="card"><div className="section-heading"><h2>Your permissions</h2><ShieldCheck size={22}/></div><label className="consent-toggle"><span><strong>Clinical demo participation</strong><small>Allow check-ins and clinician review.</small></span><input type="checkbox" checked={p.clinicalConsent} onChange={e=>consent('clinicalConsent',e.target.checked)}/></label><label className="consent-toggle"><span><strong>Research participation</strong><small>Include this synthetic record in aggregate research. Turning off removes it from future calculations.</small></span><input type="checkbox" checked={p.researchConsent} onChange={e=>consent('researchConsent',e.target.checked)}/></label><div className="subtle-note"><FlaskConical size={18}/><p>Research participation is optional and separate from care. You can change it at any time.</p></div></section></div></div></>;
}
export default function PatientPage(){return <RoleGate role="Patient"><PatientWorkspace/></RoleGate>;}
