import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,extname,sep,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../out/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let path=resolve(root,'.'+pathname);
  if(path!==resolve(root)&&!path.startsWith(resolve(root)+sep)){res.writeHead(403);res.end('Forbidden');return;}
  if((await stat(path)).isDirectory())path=join(path,'index.html');
  const info=await stat(path);
  if(!info.isFile())throw new Error('Not a file');
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache'});
  if(req.method==='HEAD')res.end();else createReadStream(path).pipe(res);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found. Run npm run build before starting the preview.');}
}).listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log('PrecisionBridge production preview: http://127.0.0.1:'+(process.env.PORT||3000)));
