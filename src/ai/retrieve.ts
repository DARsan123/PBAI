import {neon} from '@neondatabase/serverless';
import {embed} from './llm';
import clinician from '../corpus/clinician/cards.json';
import patient from '../corpus/patient/cards.json';
export type Chunk={id:string;module_id:string;audience:string;title:string;source_id:string;source_version:string;source_date:string;jurisdiction:string;text:string;url:string};
export const corpus:Chunk[]=[...clinician,...patient];
const words=(s:string):string[]=>s.toLowerCase().match(/[a-z]{3,}/g)||[];
export function bm25(query:string,docs:Chunk[]){const q=[...new Set(words(query))];const lengths=docs.map(d=>words(d.title+' '+d.text));const avg=lengths.reduce((s,x)=>s+x.length,0)/(docs.length||1);return docs.map((d,i)=>{const score=q.reduce((sum,t)=>{const tf=lengths[i].filter(x=>x===t).length,df=lengths.filter(x=>x.includes(t)).length;return sum+Math.log(1+(docs.length-df+.5)/(df+.5))*tf*2.2/(tf+1.2*(.25+.75*lengths[i].length/(avg||1)));},0);return {...d,score};}).filter(d=>d.score>=.1).sort((a,b)=>b.score-a.score);}
export async function retrieve({query,moduleId,audience,k=4}:{query:string;moduleId:string;audience:'clinician'|'patient';k?:number}){
 const docs=corpus.filter(d=>d.module_id===moduleId&&d.audience===audience),lex=bm25(query,docs);k=Math.min(k,5);
 if(process.env.DATABASE_URL)try{const vector=await embed(query),sql=neon(process.env.DATABASE_URL);const rows=await sql`SELECT id, 1-(embedding <=> ${JSON.stringify(vector)}::vector) AS similarity FROM corpus_chunks WHERE module_id=${moduleId} AND audience=${audience} ORDER BY embedding <=> ${JSON.stringify(vector)}::vector LIMIT 12`;const chunks=docs.map(d=>{const similarity=Number(rows.find(r=>r.id===d.id)?.similarity||0),keyword=lex.find(x=>x.id===d.id)?.score||0;return {...d,score:.7*(similarity>=.55?similarity:0)+.3*keyword/(1+keyword)};}).filter(d=>d.score>=.1).sort((a,b)=>b.score-a.score).slice(0,k);return {chunks,retriever:'pgvector' as const};}catch{/* deterministic fallback */}
 return {chunks:lex.slice(0,k),retriever:'BM25' as const};
}

