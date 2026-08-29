import {useMemo} from 'react';
import {corpusState,evaluateCorpusModes} from './corpusRuntime';
import SAISovereignControl from './SAISovereignControl';

export default function IntelligenceFabricPanel({address}:{address:number}){
 const record=useMemo(()=>corpusState(address),[address]);
 const modeCount=useMemo(()=>evaluateCorpusModes(record).count,[record]);
 return <SAISovereignControl record={record} modeCount={modeCount}/>;
}
