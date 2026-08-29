import {useMemo} from 'react';
import {corpusState} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import SAISovereignControl from './SAISovereignControl';

export const INTELLIGENCE_FABRIC_IDENTITY='OMEGA Intelligence Fabric';
export const INTELLIGENCE_FABRIC_TRUTH='No donor is relabeled as a live neural model without compatible weights and runtime evidence. Mode catalog membership is not execution.';

export default function IntelligenceFabricPanel({address}:{address:number}){
 const record=useMemo(()=>corpusState(address),[address]);
 const modeCount=useMemo(()=>sourceBackedModeSummary(record).appliedCount,[record]);
 return <div data-intelligence-fabric={INTELLIGENCE_FABRIC_IDENTITY} data-truth-boundary={INTELLIGENCE_FABRIC_TRUTH}><SAISovereignControl record={record} modeCount={modeCount}/></div>;
}
