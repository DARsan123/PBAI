import {it,expect,vi,afterEach} from 'vitest';
import {z} from 'zod';
const calls=vi.hoisted(()=>({generateContent:vi.fn()}));
vi.mock('@google/genai',()=>({ThinkingLevel:{LOW:'LOW'},GoogleGenAI:class {models=calls;}}));
import {generate} from './llm';
afterEach(()=>{delete process.env.GEMINI_API_KEY;vi.resetAllMocks();});
it('rejects malformed provider JSON',async()=>{process.env.GEMINI_API_KEY='mock';calls.generateContent.mockResolvedValue({text:'not JSON'});await expect(generate('test',{},z.object({value:z.number()}))).rejects.toThrow();});
it('validates model values with Zod',async()=>{process.env.GEMINI_API_KEY='mock';calls.generateContent.mockResolvedValue({text:'{"value":"wrong"}'});await expect(generate('test',{},z.object({value:z.number()}))).rejects.toThrow();});
it('uses structured output and low temperature',async()=>{process.env.GEMINI_API_KEY='mock';calls.generateContent.mockResolvedValue({text:'{"value":2}'});expect(await generate('test',{},z.object({value:z.number()}))).toEqual({value:2});expect(calls.generateContent.mock.calls[0][0].config.temperature).toBeLessThanOrEqual(.2);expect(calls.generateContent.mock.calls[0][0].config.responseMimeType).toBe('application/json');});

it('retries one transient provider error then validates',async()=>{process.env.GEMINI_API_KEY='mock';calls.generateContent.mockRejectedValueOnce({status:503}).mockResolvedValueOnce({text:'{"value":2}'});expect(await generate('test',{},z.object({value:z.number()}))).toEqual({value:2});expect(calls.generateContent).toHaveBeenCalledTimes(2);});
it('bounds retries when provider remains unavailable',async()=>{process.env.GEMINI_API_KEY='mock';calls.generateContent.mockRejectedValue({status:503});await expect(generate('test',{},z.object({value:z.number()}))).rejects.toThrow('unavailable');expect(calls.generateContent).toHaveBeenCalledTimes(2);});

