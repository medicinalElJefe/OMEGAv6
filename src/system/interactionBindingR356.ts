export function interactionBindingKeyR356(panel:string,record:any,address?:number){
 const state=record?.stateId??record?.address??address??'UNBOUND';
 return `${String(panel||'UNBOUND')}:${String(state)}`;
}
