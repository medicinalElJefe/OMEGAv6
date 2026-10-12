import {useEffect,useState} from 'react';
import EarthObservatoryR8 from '../../src/EarthObservatoryR8';

const clampAddress=(value:number)=>Math.max(0,Math.min(20735,Number.isFinite(value)?Math.floor(value):11498));
const readAddress=()=>{try{return clampAddress(Number(localStorage.getItem('omega.v6.address')||11498))}catch{return 11498}};

export default function EarthWorkspaceR438(){
 const[address,setAddress]=useState(readAddress);
 const[weatherMode,setWeatherMode]=useState(false);
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
  <nav aria-label='Earth weather mode shortcuts' style={{display:'flex',flexWrap:'wrap',gap:10,margin:'12px 0'}}><button type='button' aria-pressed={weatherMode} onClick={()=>{try{localStorage.setItem('omega.earth.r279.view','WEATHER')}catch{}setWeatherMode(true)}}>Open Weather Mode · live local forecast</button><button type='button' onClick={()=>{try{localStorage.setItem('omega.earth.r279.view','SATELLITE')}catch{}setWeatherMode(false)}}>Open observed satellite maps</button></nav>
  <p style={{fontSize:12,opacity:.8}}>Weather Mode uses source-returned hourly and seven-day data for the selected Earth location. Satellite imagery is a separate observed layer; no synthetic radar or forecast-map pixels are claimed.</p>
  <div className='o7-native-surface'><EarthObservatoryR8 key={weatherMode?'weather':'satellite'} address={address}/></div>
 </section>;
}
