// R1012: SHA-256 byte consistency, not authentication or scientific proof.
export const MAX_RESULT_JSON_R1012=4096;
export async function resultDigestR1012(json){
 if(typeof json!=='string')throw Error('Result bytes required');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(json));
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
}
export function validateDeterministicPayloadR1012(payload){
 if(typeof payload!=='string'||payload.length>MAX_RESULT_JSON_R1012)throw Error('Untrusted bounded result payload');
 let result;try{result=JSON.parse(payload)}catch{throw Error('Untrusted result JSON')}
 if(!result||result.kind!=='DETERMINISTIC_CELL_ANALYSIS'||typeof result.summary!=='string'||!result.metrics||typeof result.metrics!=='object')throw Error('Untrusted deterministic result shape');
 return payload;
}
export async function verifyDeterministicReturnR1012(row){
 if(!row||row.executor!=='DETERMINISTIC'||row.ok!==true||typeof row.receiptSha!=='string'||!/^[a-f0-9]{64}$/.test(row.receiptSha))throw Error('No deterministic result receipt');
 const json=validateDeterministicPayloadR1012(row.resultJson);
 return (await resultDigestR1012(json))===row.receiptSha;
}
