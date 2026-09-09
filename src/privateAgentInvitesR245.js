export const PRIVATE_AGENT_REVISION_R245='R245';
export const PRIVATE_AGENT_PROTOCOL_R245='OMEGA_PRIVATE_AGENT_HTTP_R245';

// Capability URLs are private credentials. Only SHA-256 digests are committed.
// Revocation is fail-closed by setting active:false or deleting the row.
export const PRIVATE_AGENT_INVITES_R245=Object.freeze([
 Object.freeze({id:'friend-01',label:'Private Friend 01',tokenSha256:'5725ec3ae928e08e6e8fc206424e47b7e4898dcb0df36e77c9e45adee4d0d443',active:true,scopes:Object.freeze(['DISCOVER','MESSAGE','TOOLS_READ']),maxPromptChars:6000,expiresAt:null}),
 Object.freeze({id:'friend-02',label:'Private Friend 02',tokenSha256:'a7666e51b54d40a977314be5ce18ad75bc2a9750c8b02f01088e124a318dc90e',active:true,scopes:Object.freeze(['DISCOVER','MESSAGE','TOOLS_READ']),maxPromptChars:6000,expiresAt:null}),
 Object.freeze({id:'friend-03',label:'Private Friend 03',tokenSha256:'a5e0726f99d7560c0fd9c713b211d65e91a13491e4b19924951e3251a81fb445',active:true,scopes:Object.freeze(['DISCOVER','MESSAGE','TOOLS_READ']),maxPromptChars:6000,expiresAt:null})
]);

export const R245_FORBIDDEN_AUTHORITIES=Object.freeze([
 'HYBRID_PAIR','HYBRID_EXECUTE','PC_CONTROL','PRIVATE_FILES','GITHUB_WRITE','CLOUDFLARE_DEPLOY','R147_DISPATCH','R125_CANON_ADMISSION','BRIDGE_SECRET','FEDERATION_WRITE'
]);
