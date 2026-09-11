import {ShieldCheck} from 'lucide-react';
import {corpusState} from './corpusRuntime';
import BioInstrumentSurfaceR281 from './BioInstrumentSurfaceR281';
import BioAllModesFabricR281 from './BioAllModesFabricR281';
import BioEmpiricalConvergenceR281 from './BioEmpiricalConvergenceR281';
import './extremeRestorationR46.css';

// Retain the R46 scale contract as the compatibility bridge while R281 supplies
// the full instrument/evidence surface. These are representational scale lenses.
const LEVELS=[
 ['ORGANISM','whole-system coordination'],
 ['ORGAN','functional subsystem'],
 ['TISSUE','cooperating cellular field'],
 ['CELL','bounded living unit'],
 ['ORGANELLE','intracellular functional structure'],
 ['MOLECULE','chemical relational scale'],
 ['ATOM','atomic constituent scale']
] as const;

export default function BiologicalTraversalR46({address,onAddress}:{address:number;onAddress?:(n:number)=>void}){
 const record=corpusState(address);
 return <div className='r46-bio r46-bio-r281-bridge' data-scale-count={LEVELS.length}>
   <BioInstrumentSurfaceR281 address={address} onAddress={onAddress}/>
   <BioEmpiricalConvergenceR281/>
   <BioAllModesFabricR281 record={record}/>
   <footer className='r46-bio-r281-boundary'><ShieldCheck/>Heavy Bio now keeps three authorities distinct on one surface: calibrated observations, empirical residual/convergence evidence, and the complete 241-channel analytical mode fabric. Verified observations are invariant carry; residuals are scar/history carry; FIT may propose calibration; untouched HOLDOUT/PROSPECTIVE evidence must validate any improvement. Analytical and calibration outputs retain measurement authority zero and cannot overwrite observations.</footer>
 </div>;
}
