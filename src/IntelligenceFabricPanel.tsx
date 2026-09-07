import {useMemo} from 'react';
import {corpusState} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import SAISovereignControl from './SAISovereignControl';
import IntelligenceBridgeR195 from './IntelligenceBridgeR195';
import SaiHybridHandoffPanelR1961 from './SaiHybridHandoffPanelR1961';

export const INTELLIGENCE_FABRIC_IDENTITY='OMEGA Intelligence Fabric';
export const INTELLIGENCE_FABRIC_TRUTH='No donor is relabeled as a live neural model without compatible weights and runtime evidence. Mode catalog membership is not execution. R195.1 exposes live AI/SAI/Hybrid proof state; R196.1 may translate a grounded SAI proposal into the existing held Hybrid draft/validation contract, but cannot confirm, queue, execute, deploy, promote or admit CanonState.';

export default function IntelligenceFabricPanel({address}:{address:number}){
 const record=useMemo(()=>corpusState(address),[address]);
 const modeSummary=useMemo(()=>sourceBackedModeSummary(record),[record]);
 return <div data-intelligence-fabric={INTELLIGENCE_FABRIC_IDENTITY} data-truth-boundary={INTELLIGENCE_FABRIC_TRUTH}><IntelligenceBridgeR195/><SaiHybridHandoffPanelR1961 record={record} modeSummary={modeSummary}/><SAISovereignControl record={record} modeCount={modeSummary.appliedCount}/></div>;
}
