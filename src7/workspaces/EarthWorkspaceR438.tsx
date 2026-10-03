import EarthObservatoryR8 from '../../src/EarthObservatoryR8';
import {useOmega7NativeRuntimeR440} from '../runtime/Omega7NativeRuntimeR440';

export default function EarthWorkspaceR438(){
 const{address,ready,bootError,retry}=useOmega7NativeRuntimeR440();
 if(bootError)return <section className='o7-command-native-state' role='alert'><b>Earth could not load the shared OMEGA source runtime.</b><p>{bootError}</p><button onClick={()=>void retry()}>Retry source runtime</button></section>;
 if(!ready)return <section className='o7-native-loading' role='status' aria-live='polite'>Preparing the shared OMEGA runtime…</section>;
 return <section className='o7-native-workspace o7-earth-workspace' data-omega7-native='earth.weather' data-legacy-address={address}>
  <header className='o7-native-head'>
   <div><span>Explore · Earth & Weather</span><h1>Earth</h1><p>Observed Earth data, weather, motion, ground evidence, satellite imagery, SAR, and representational analysis in one source-honest workspace.</p></div>
   <aside><b>Native OMEGA7 workspace</b><small>Shared OMEGA7 runtime · inherited Earth engine · R436 truth boundary preserved</small></aside>
  </header>
  <div className='o7-native-surface'><EarthObservatoryR8 address={address}/></div>
 </section>;
}
