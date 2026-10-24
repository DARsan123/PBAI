import {handle} from '@/ai/service';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request,{params}:{params:Promise<{feature:string}>}){
 try{if(Number(request.headers.get('content-length')||0)>24000)return Response.json({message:'Request too large'},{status:413});const text=await request.text();if(text.length>24000)return Response.json({message:'Request too large'},{status:413});const result=await handle((await params).feature,JSON.parse(text));return Response.json(result.body,{status:result.status,headers:{'Cache-Control':'no-store'}});}catch{return Response.json({message:'AI assistance unavailable.'},{status:400});}
}
