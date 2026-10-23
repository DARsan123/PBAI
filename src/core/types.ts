import { z } from 'zod';
export type Role = 'Patient' | 'Clinician' | 'Researcher';
export type SafetyState = 'URGENT' | 'PROMPT_REVIEW' | 'ROUTINE' | 'UNABLE_TO_ASSESS';
export const questionSchema = z.object({ id:z.string(), label:z.string(), type:z.enum(['boolean','number']), required:z.boolean(), unit:z.string().optional(), min:z.number().optional(), max:z.number().optional(), default:z.union([z.boolean(),z.number()]) });
const conditionSchema = z.object({field:z.string(), op:z.enum(['eq','gte','lte']), value:z.union([z.boolean(),z.number(),z.string()])});
export const moduleSchema = z.object({
 id:z.string(), name:z.string(), version:z.string(), status:z.literal('illustrative'), reviewDate:z.string(), population:z.string(),
 questions:z.array(questionSchema).min(1), requiredProfile:z.array(z.string()),
 rules:z.array(z.object({id:z.string(),state:z.enum(['URGENT','PROMPT_REVIEW']),all:z.array(conditionSchema).min(1),reason:z.string()})),
 options:z.array(z.object({id:z.string(),drugClass:z.string(),context:z.string(),considerations:z.string(),criticalFields:z.array(z.string()),excludeIf:z.array(conditionSchema),evidenceId:z.string(),pgxDrugs:z.array(z.string()).default([])})),
 evidence:z.array(z.object({id:z.string(),source:z.string(),version:z.string(),date:z.string(),url:z.string().url()})),
 pgxPairs:z.array(z.object({drug:z.string(),gene:z.string(),evidenceId:z.string()}))
});
export type Module = z.infer<typeof moduleSchema>;
export type Answers = Record<string, number | boolean | string | null>;
export type Datum = {value:string | number | boolean | null;source:'synthetic' | 'patient' | 'clinician' | 'lab';verified:boolean;date:string;unit?:string;nullReason?:string};
export type Patient = {id:string;moduleId:string;ageBand:string;profile:Record<string,Datum>;preferences:string[];clinicalConsent:boolean;researchConsent:boolean;baseline:'Moderate baseline'|'Higher baseline';response:boolean|null;pgx?:{valid:boolean;expiresAt:string;drug:string;gene:string;phenotype:string}};
export type Evaluation = {state:SafetyState;ruleIds:string[];missing:string[];reasons:string[];moduleVersion:string};
export type CheckIn = {id:string;patientId:string;at:string;answers:Answers;note:string;evaluation:Evaluation;source:'synthetic'|'patient'};
export type Alert = {id:string;patientId:string;checkInId:string;at:string;ruleIds:string[];acknowledgedAt?:string;acknowledgedBy?:string;resolvedAt?:string;resolution?:string};
export type Decision = {id:string;patientId:string;version:number;at:string;signer:string;action:'request_more_data'|'approve_follow_up'|'reject_candidate';rationale:string;followUp:string;checkInId:string;moduleVersion:string};
export type Audit = {id:string;at:string;actor:Role|'System';action:string;subject:string;detail:string};
export type OptionCard = Module['options'][number] & {status:'eligible_for_review'|'requires_manual_review'|'excluded_by_rule';missing:string[];evidence:Module['evidence'][number]|undefined;pgx:string};
