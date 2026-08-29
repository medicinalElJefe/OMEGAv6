import {useMemo} from 'react';
import {corpusState,evaluateCorpusModes} from './corpusRuntime';
import SAISovereignControl from './SAISovereignControl';

export const INTELLIGENCE_FABRIC_IDENTITY='OMEGA Intelligence Fabric';

export default function IntelligenceFabricPanel({address}:{address:number}){
 const record=useMemo(()=>corpusState(address),[address]);
 const modeCount=useMemo(()=>evaluateCorpusModes(record).count,[record]);
 return <div data-intelligence-fabric={INTELLIGENCE_FABRIC_IDENTITY}><SAISovereignControl record={record} modeCount={modeCount}/></div>;
}
