import {it,expect,vi} from 'vitest';
vi.mock('./retrieve',()=>({retrieve:vi.fn(async()=>({chunks:[],retriever:'BM25'}))}));
vi.mock('./llm',()=>({model:()=> 'mock',generate:vi.fn()}));
import {handle} from './service';
import {generate} from './llm';
it('empty evidence yields fixed explanation without model',async()=>{const r=await handle('explain-option',{role:'Clinician',moduleId:'t2d',optionId:'t2d-a',blocked:false});expect(r.body).toHaveProperty('message',expect.stringContaining('Insufficient evidence'));expect(generate).not.toHaveBeenCalled();});
it('blocked option never calls model',async()=>{const r=await handle('explain-option',{role:'Clinician',moduleId:'t2d',optionId:'t2d-a',blocked:true});expect(r.body).toHaveProperty('message',expect.stringContaining('blocked'));expect(generate).not.toHaveBeenCalled();});
