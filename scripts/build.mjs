import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const env={...process.env};
if(process.platform==='win32'){
 const retry=fileURLToPath(new URL('./windows-fs-retry.cjs',import.meta.url));
 env.NODE_OPTIONS=[env.NODE_OPTIONS,'--require '+JSON.stringify(retry)].filter(Boolean).join(' ');
}
if(process.env.VERCEL&&process.env.DATABASE_URL&&process.env.GEMINI_API_KEY){await new Promise(resolve=>{const ingest=spawn(process.execPath,['--import','tsx','scripts/ingest.ts'],{stdio:'inherit',env});ingest.on('exit',resolve);ingest.on('error',resolve);});}
const next=fileURLToPath(new URL('../node_modules/next/dist/bin/next',import.meta.url));
const child=spawn(process.execPath,[next,'build','--webpack'],{stdio:'inherit',env});
child.on('exit',code=>process.exit(code??1));
child.on('error',error=>{console.error(error.message);process.exit(1);});
