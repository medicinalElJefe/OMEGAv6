import {useEffect} from 'react';
import type {OmegaUiMode} from './SingleFrameRuntimeShellR27';
import OmegaSideNavigatorR88 from './OmegaSideNavigatorR88';

type Props={uiMode:OmegaUiMode;onUiMode:(mode:OmegaUiMode)=>void;panel:string;onNavigate:(panel:string)=>void;record:any;modePolicy:string;modeCount:number;busy:string};

export default function InstrumentOSShellR62({uiMode,panel,onNavigate}:Props){
 useEffect(()=>{
  const media=window.matchMedia('(max-width: 900px)');
  const sync=()=>{const frame=uiMode==='MOBILE'?'mobile':uiMode==='DESKTOP'?'desktop':media.matches?'mobile':'desktop';document.documentElement.dataset.omegaFrame=frame};
  sync();
  if(uiMode==='AUTO')media.addEventListener('change',sync);
  return()=>{if(uiMode==='AUTO')media.removeEventListener('change',sync)};
 },[uiMode]);
 return <OmegaSideNavigatorR88 currentPanel={panel} onNavigate={onNavigate} onHome={()=>window.dispatchEvent(new CustomEvent('omega-home-request'))}/>;
}
