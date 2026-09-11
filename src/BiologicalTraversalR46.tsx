import {ShieldCheck} from 'lucide-react';
import {corpusState} from './corpusRuntime';
import BioInstrumentSurfaceR281 from './BioInstrumentSurfaceR281';
import BioAllModesFabricR281 from './BioAllModesFabricR281';
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
   <BioAllModesFabricR281 record={record}/>
   <footer className='r46-bio-r281-boundary'><ShieldCheck/>Representational biological-scale traversal only. R281 can bind calibrated instrument packets and display uncertainty at every Heavy Bio layer while exposing all 241 analytical channels (179 source-catalog + 62 canon/calculus) with measurement authority fixed at zero. Molecular, cellular, tissue, organ and whole-body model views remain explicitly distinct from measurements and from validated medical claims.</footer>
 </div>;
}
