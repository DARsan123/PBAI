'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useEffect,useState,useRef} from 'react';
import {Activity,ArrowUpRight,LayoutDashboard,HeartPulse,Stethoscope,FlaskConical,ScrollText,ShieldCheck,RotateCcw,ChevronRight,PanelLeftClose,PanelLeftOpen} from 'lucide-react';
import {useDemo} from '@/core/store';
import {Button} from './ui/button';
import type {Role} from '@/core/types';
const nav=[{href:'/',label:'Overview',icon:LayoutDashboard},{href:'/patient/',label:'Patient workspace',icon:HeartPulse},{href:'/clinician/',label:'Clinician review',icon:Stethoscope},{href:'/research/',label:'Research workbench',icon:FlaskConical},{href:'/audit/',label:'Audit trail',icon:ScrollText}];
export const rolePath:Record<Role,string>={Patient:'/patient/',Clinician:'/clinician/',Researcher:'/research/'};
export function Shell({children}:{children:React.ReactNode}){
 const role=useDemo(s=>s.role),setRole=useDemo(s=>s.setRole),reset=useDemo(s=>s.reset),storageError=useDemo(s=>s.storageError);
 const [ready,setReady]=useState(false),[resetOpen,setResetOpen]=useState(false),[menu,setMenu]=useState(false);
 const path=usePathname(),router=useRouter();
 useEffect(()=>{Promise.resolve(useDemo.persist.rehydrate()).finally(()=>setReady(true));},[]);
 return <><div className="synthetic-banner"><ShieldCheck size={13}/><span>SYNTHETIC DATA — NOT FOR CLINICAL USE</span><span className="banner-right">EXL MVP · Demo only</span></div><div className="app-shell">
 <aside className={'sidebar '+(menu?'is-open':'')}><Link href="/" className="brand"><span className="brand-mark"><Activity size={25}/></span><span>PrecisionBridge<span className="brand-ai">AI</span><small>CARE MEETS DISCOVERY</small></span></Link>
 <p className="nav-caption">WORKSPACE</p><nav aria-label="Main navigation">{nav.map(item=><Link key={item.href} onClick={()=>setMenu(false)} href={item.href} className={'nav-link '+(path===item.href||path===item.href.slice(0,-1)?'active':'')}><item.icon size={19}/>{item.label}{(path===item.href||path===item.href.slice(0,-1))&&<span className="nav-dot"/>}</Link>)}</nav>
 <div className="sidebar-bottom"><div className="guardrail"><ShieldCheck size={22}/><strong>Human oversight, always.</strong><p>Clinical decisions stay with a clinician. Research stays exploratory.</p><Link href="/about/">Demo scope & limitations <ArrowUpRight size={13}/></Link></div><div className="version"><span className="live-dot"/>Local demo environment<span>v1.0</span></div></div></aside>
 <div className="workspace"><header className="topbar"><div className="breadcrumbs"><button aria-label="Toggle navigation" className="mobile-menu" onClick={()=>setMenu(!menu)}>{menu?<PanelLeftClose/>:<PanelLeftOpen/>}</button><span>Workspace</span><ChevronRight size={14}/><strong>{nav.find(n=>path===n.href||path===n.href.slice(0,-1))?.label||'Demo information'}</strong></div><div className="top-actions"><label className="role-select"><span>Viewing as</span><select aria-label="Demo role" value={role} onChange={e=>{const r=e.target.value as Role;setRole(r);router.push(rolePath[r]);}}>{(['Patient','Clinician','Researcher'] as Role[]).map(r=><option key={r}>{r}</option>)}</select></label><button className="reset-button" onClick={()=>setResetOpen(true)}><RotateCcw size={14}/> Reset demo</button><div className="avatar">{role.slice(0,2).toUpperCase()}</div></div></header>
 {storageError&&<div className="notice warning">Browser storage is unavailable. Changes may be lost when you reload.</div>}
 <main id="main-content">{ready?children:<div className="loading">Preparing your synthetic workspace…</div>}</main><footer>PrecisionBridge AI <span>Illustrative workflows · No autonomous treatment decisions</span><Link href="/about/">Demo only</Link></footer></div></div>
 {resetOpen&&<div className="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="reset-title" className="modal"><h2 id="reset-title">Reset this demo?</h2><p>This clears local check-ins, signed decisions, alerts, consent changes and the audit trail, then restores the 60 synthetic records.</p><div className="button-row"><Button variant="outline" onClick={()=>setResetOpen(false)}>Cancel</Button><Button onClick={()=>{reset();setResetOpen(false);router.push('/');}}>Reset demo</Button></div></section></div>}</>;
}
export function RoleGate({role,children}:{role:Role;children:React.ReactNode}){
 const actual=useDemo(s=>s.role),log=useDemo(s=>s.log);const path=usePathname();const logged=useRef('');
 useEffect(()=>{const key=actual+path;if(actual!==role&&logged.current!==key){logged.current=key;log('access_denied',path,'Required '+role+'; attempted '+actual);}},[actual,role,path,log]);
 if(actual!==role)return <div className="empty-state"><ShieldCheck size={36}/><h1>Access denied</h1><p>This workspace requires the {role} role. Use the role switcher to continue the demo.</p><Link href={rolePath[actual]}>Return to your workspace →</Link></div>;
 return <>{children}</>;
}
