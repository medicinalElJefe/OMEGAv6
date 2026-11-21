import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {R892_SCHEMA,R892_WIDTH,R892_HEIGHT,R892_PIXELS,rasterAddressR892,rasterCoordinateR892,pointerAddressR892} from '../src/spherePixelProjectionR892.mjs';
assert.equal(R892_WIDTH*R892_HEIGHT,20736);
assert.equal(R892_PIXELS,20736);
for(const mode of ['INNER_20736','OUTER_20736']){
 const addresses=new Set();
 for(let i=0;i<R892_PIXELS;i++){
  const p=rasterCoordinateR892(i,mode);
  assert.equal(p.schema,R892_SCHEMA);
  assert.equal(p.address,i);
  assert.equal(p.inner,mode==='INNER_20736'?i:null);
  assert.equal(p.outer,mode==='OUTER_20736'?i:null);
  assert.equal(rasterAddressR892(p.x,p.y,mode).address,i);
  addresses.add(p.address);
 }
 assert.equal(addresses.size,20736,'no pixel aliasing or skipped addresses');
 assert.equal(pointerAddressR892(0,0,0,0,1920,1080,mode).address,0);
 assert.equal(pointerAddressR892(1919,1079,0,0,1920,1080,mode).address,20735);
 assert.equal(pointerAddressR892(500,500,500,500,192,108,mode).address,0);
}
for(const value of [-1,20736,1.2,NaN])assert.throws(()=>rasterCoordinateR892(value));
for(const coords of [[-1,0],[192,0],[0,108],[0,-1],[.1,2]])assert.throws(()=>rasterAddressR892(...coords));
assert.throws(()=>rasterCoordinateR892(0,'BAD_MODE'));
assert.throws(()=>pointerAddressR892(0,0,0,0,0,108));
const ui=readFileSync('src/SphereAgentInstrumentR887.tsx','utf8');
for(const token of ['rasterAddressR892(x,y,pixelProjection)','pointerAddressR892(e.clientX','20,736 inner states · selected agent','20,736 outer agents · selected shell','data-r892-selected-address','setActiveInner(pixel.address)','setOuter(pixel.address)','data-r892-projection={pixelProjection}'])assert.ok(ui.includes(token),'Missing exact R892 UI mapping: '+token);
assert.ok(!ui.includes('inner=(innerPage*144+(x+y*WIDTH)%144)%SIZE'),'Old 144-repeated pixel sampling must be removed');
console.log('R892 PASS: 41,472 bijective address roundtrips across two projection modes; pixel boundaries; exact UI selection; no 144-state tiling.');
