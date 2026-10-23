'use client';
import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid} from 'recharts';
import {useDemo} from '@/core/store';
import {getModule} from '@/core/modules';
export function Trend({patientId,moduleId}:{patientId:string;moduleId:string}){
 const checks=useDemo(s=>s.checkIns).filter(c=>c.patientId===patientId);
 const metric=getModule(moduleId).questions.find(q=>q.unit);
 if(!metric)return null;
 const data=checks.filter(c=>typeof c.answers[metric.id]==='number').map(c=>({date:c.at.slice(5,10),value:c.answers[metric.id]}));
 return <section className="card"><div className="section-heading"><div><div className="eyebrow">LONGITUDINAL CONTEXT</div><h2>{metric.label}</h2></div><span className="tag">{metric.unit} · synthetic</span></div><div className="chart" role="img" aria-label={'Synthetic '+metric.label+' readings: '+data.map(d=>d.date+': '+d.value).join(', ')}><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{top:10,right:15,bottom:0,left:-20}}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e3e9e5"/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#7a8985'}}/><YAxis domain={['auto','auto']} axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#7a8985'}}/><Tooltip/><Line type="monotone" dataKey="value" name={metric.label} stroke="#337c69" strokeWidth={2.5} dot={{fill:'#337c69',r:4,strokeWidth:3,stroke:'#fff'}}/></LineChart></ResponsiveContainer></div><p className="fine-print">Synthetic observations only. No causal or predictive interpretation.</p></section>;
}
