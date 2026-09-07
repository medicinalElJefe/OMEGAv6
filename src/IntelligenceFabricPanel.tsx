import {useMemo} from 'react';
import {corpusState} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import SAISovereignControl from './SAISovereignControl';
import IntelligenceBridgeR195 from './IntelligenceBridgeR195';

export const INTELLIGENCE_FABRIC_IDENTITY='OMEGA Intelligence Fabric';
export const INTELLIGENCE_FABRIC_TRUTH='No donor is relabeled as a live neural model without compatible weights and runtime evidence. Mode catalog membership is not execution. R195 binds SAI planning to live AI/Hybrid/proof state without creating a second execution or Canon authority.';

export default function IntelligenceFabricPanel({address}:{address:number}){
 const record=useMemo(()=>corpusState(address),[address]);
 const modeCount=useMemo(()=>sourceBackedModeSummary(record).appliedCount,[record]);
 return <div data-intelligence-fabric={INTELLIGENCE_FABRIC_IDENTITY} data-truth-boundary={INTELLIGENCE_FABRIC_TRUTH}><IntelligenceBridgeR195/><SAISovereignControl record={record} modeCount={modeCount}/></div>;
}
