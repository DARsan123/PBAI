import {it,expect,vi,afterEach} from 'vitest';
import {z} from 'zod';
const calls=vi.hoisted(()=>({generateContent:vi.fn()}));
vi.mock('@google/genai',()=>({GoogleGenAI:class {models=calls;}}));
import {generate} from './llm';
afterEach(()=>{delete process.env.GEMINI_API_KEY;vi.resetAllMocks();});
it('rejects malformed provider JSON',async()=>{process.env.GEMINI_API_KEY='mock';calls.generateContent.mockResolvedValue({text:'not JSON'});await expect(generate('test',{},z.object({value:z.number()}))).rejects.toThrow();});
it('validates model values with Zod',async()=>{process.env.GEMINI_API_KEY='mock';calls.generateContent.mockResolvedValue({text:'{"value":"wrong"}'});await expect(generate('test',{},z.object({value:z.number()}))).rejects.toThrow();});
it('uses structured output and low temperature',async()=>{process.env.GEMINI_API_KEY='mock';calls.generateContent.mockResolvedValue({text:'{"value":2}'});expect(await generate('test',{},z.object({value:z.number()}))).toEqual({value:2});expect(calls.generateContent.mock.calls[0][0].config.temperature).toBeLessThanOrEqual(.2);expect(calls.generateContent.mock.calls[0][0].config.responseMimeType).toBe('application/json');});
