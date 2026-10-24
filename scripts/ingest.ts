import {neon} from '@neondatabase/serverless';
import {corpus} from '../src/ai/retrieve';
import {embed} from '../src/ai/llm';
async function main(){if(!process.env.DATABASE_URL||!process.env.GEMINI_API_KEY)throw new Error('DATABASE_URL and GEMINI_API_KEY required');const sql=neon(process.env.DATABASE_URL);
await sql`CREATE EXTENSION IF NOT EXISTS vector`;
await sql`CREATE TABLE IF NOT EXISTS corpus_chunks(id text primary key,module_id text,audience text CHECK (audience IN ('clinician','patient')),title text,source_id text,source_version text,source_date date,jurisdiction text,text text,embedding vector(768))`;
await sql`CREATE INDEX IF NOT EXISTS corpus_embedding_cosine ON corpus_chunks USING hnsw (embedding vector_cosine_ops)`;
for(const c of corpus){const v=JSON.stringify(await embed(c.text));await sql`INSERT INTO corpus_chunks(id,module_id,audience,title,source_id,source_version,source_date,jurisdiction,text,embedding) VALUES(${c.id},${c.module_id},${c.audience},${c.title},${c.source_id},${c.source_version},${c.source_date},${c.jurisdiction},${c.text},${v}::vector) ON CONFLICT(id) DO UPDATE SET module_id=EXCLUDED.module_id,audience=EXCLUDED.audience,title=EXCLUDED.title,source_id=EXCLUDED.source_id,source_version=EXCLUDED.source_version,source_date=EXCLUDED.source_date,jurisdiction=EXCLUDED.jurisdiction,text=EXCLUDED.text,embedding=EXCLUDED.embedding`;}console.log('Corpus ingested: '+corpus.length+' chunks');}
main().catch(()=>{console.error('Corpus ingestion unavailable. Check server environment and provider access; BM25 fallback remains active.');process.exitCode=1;});
