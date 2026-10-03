import {useEffect,useState} from 'react';
import EarthObservatoryR8 from '../../src/EarthObservatoryR8';

const clampAddress=(value:number)=>Math.max(0,Math.min(20735,Number.isFinite(value)?Math.floor(value):11498));
const readAddress=()=>{try{return clampAddress(Number(localStorage.getItem('omega.v6.address')||11498))}catch{return 11498}};

export default function EarthWorkspaceR438(){
 const[address,setAddress]=useState(readAddress);
 useEffect(()=>{
  let live=true;
  const sync=()=>{if(!live)return;const next=readAddress();setAddress(current=>current===next?current:next)};
  const id=window.setInterval(sync,850);
  window.addEventListener('storage',sync);
  return()=>{live=false;window.clearInterval(id);window.removeEventListener('storage',sync)};
 },[]);
 return <section className='o7-native-workspace o7-earth-workspace' data-omega7-native='earth.weather' data-legacy-address={address}>
  <header className='o7-native-head'>
   <div><span>Explore · Earth & Weather</span><h1>Earth</h1><p>Observed Earth data, weather, motion, ground evidence, satellite imagery, SAR, and representational analysis in one source-honest workspace.</p></div>
   <aside><b>Native OMEGA7 workspace</b><small>Inherited Earth engine · R436 truth boundary preserved</small></aside>
  </header>
  <div className='o7-native-surface'><EarthObservatoryR8 address={address}/></div>
 </section>;
}
