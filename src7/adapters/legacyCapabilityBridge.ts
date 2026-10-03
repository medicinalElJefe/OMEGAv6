import {OMEGA7_CAPABILITY_BY_ROUTE} from '../kernel/capabilityRegistry';
import type {Omega7Availability} from '../kernel/types';

export type Omega7LegacyCapabilityBridge={
 capabilityId:string;
 legacyRoute:string;
 availability:Omega7Availability;
 canMount:boolean;
 reason:string;
 canonicalMutation:false;
};

export function bridgeLegacyCapability(route:string,availability:Omega7Availability='READY'):Omega7LegacyCapabilityBridge{
 const cap=OMEGA7_CAPABILITY_BY_ROUTE.get(route);
 if(!cap)return{capabilityId:'unregistered',legacyRoute:route,availability:'HELD',canMount:false,reason:'Route is not part of the frozen OMEGAv6 inheritance registry.',canonicalMutation:false};
 const canMount=!['HELD','OFFLINE','FAILED'].includes(availability);
 return{capabilityId:cap.id,legacyRoute:route,availability,canMount,reason:canMount?'Inherited capability is registered for adapter-based presentation.':'Capability is retained but cannot mount in its current availability state.',canonicalMutation:false};
}
