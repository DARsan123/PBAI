import t2d from '../modules/t2d.json';
import depression from '../modules/depression.json';
import hypertension from '../modules/hypertension.json';
import { moduleSchema, type Module } from './types';
export const modules:Module[]=[t2d,depression,hypertension].map(m=>moduleSchema.parse(m));
export const getModule=(id:string):Module=>{const m=modules.find(m=>m.id===id);if(!m)throw new Error('Unknown module');return m;};
