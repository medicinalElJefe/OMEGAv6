import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const url=process.argv[2];
if(!/^http:\/\/127\.0\.0\.1:\d+\/$/.test(String(url||'')))throw new Error('Expected exact loopback launch URL');
let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const failures=[];
 page.on('pageerror',e=>failures.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>{
  const root=document.querySelector('#root');
  return !!root && root.textContent.trim().length>=100 && root.querySelectorAll('button').length>=3;
 },{timeout:30000});
 const proof=await page.evaluate(()=>{
  const root=document.querySelector('#root');
  return {textLength:root.textContent.trim().length,buttons:root.querySelectorAll('button').length,main:!!root.querySelector('main'),title:document.title,visible:!!root.getBoundingClientRect().height,alerts:Array.from(root.querySelectorAll('[role="alert"]')).map(x=>x.textContent.trim().slice(0,200))};
 });
 if(!proof.main||!proof.visible||proof.textLength<100||proof.buttons<3)throw new Error('R882 rendered OMEGA7 application surface missing: '+JSON.stringify(proof));
 if(proof.alerts.some(x=>/surface could not finish loading|uncaught|fatal/i.test(x)))throw new Error('R882 browser error surface: '+JSON.stringify(proof.alerts));
 if(failures.length)throw new Error('R882 uncaught browser exceptions: '+failures.slice(0,6).join(' | '));
 await mkdir('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/omega7-r882-first-launch.png',fullPage:false});
 console.log('R882 REAL EDGE FIRST-RENDER PASS '+JSON.stringify(proof));
}finally{await browser?.close();}
