import assert from 'node:assert/strict';
import {dot3,forwardOrthoWgs84,geodeticNormal,geodeticToEcef,inverseOrthoWgs84,solarElevationDegrees,solarPoint,terminatorGeodetic,wrapLon,WGS84_B,WGS84_F} from '../src/earthProjectionR284.ts';

const near=(a:number,b:number,tol:number,msg:string)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a} vs ${b}`);
const lonDelta=(a:number,b:number)=>Math.abs(wrapLon(a-b));

near(WGS84_F,1/298.257223563,1e-15,'WGS84 flattening must be exact');
near(geodeticToEcef(90,0)[2],WGS84_B,1e-12,'WGS84 polar semi-axis');
near(geodeticToEcef(0,0)[0],1,1e-12,'WGS84 equatorial semi-axis');

const centers:Array<[number,number]>=[[0,0],[32.2217,-110.9265],[70,45],[-50,170]];
for(const [centerLat,centerLon] of centers){
 const center=forwardOrthoWgs84(centerLat,centerLon,centerLat,centerLon);
 near(center.x,0,2e-12,'view center x');near(center.y,0,2e-12,'view center y');near(center.mu,1,2e-12,'view center visibility');
 const invCenter=inverseOrthoWgs84(0,0,centerLat,centerLon);assert.ok(invCenter,'center ray must intersect ellipsoid');near(invCenter.lat,centerLat,2e-10,'center latitude round trip');near(lonDelta(invCenter.lon,centerLon),0,2e-10,'center longitude round trip');
 for(let dLat=-35;dLat<=35;dLat+=17.5)for(let dLon=-55;dLon<=55;dLon+=22){
  const lat=Math.max(-88,Math.min(88,centerLat+dLat)),lon=wrapLon(centerLon+dLon),p=forwardOrthoWgs84(lat,lon,centerLat,centerLon);if(p.z<=.02)continue;
  const inv=inverseOrthoWgs84(p.x,p.y,centerLat,centerLon);assert.ok(inv,`visible projected point must invert ${lat},${lon}`);near(inv.lat,lat,2e-8,'latitude projection round trip');near(lonDelta(inv.lon,lon),0,2e-8,'longitude projection round trip');
 }
}

const datelineWest=forwardOrthoWgs84(5,179.9,5,-179.9),datelineEast=forwardOrthoWgs84(5,-179.9,5,179.9);
assert.ok(datelineWest.z>.99&&datelineEast.z>.99,'dateline-adjacent coordinates must remain continuous and visible');
assert.ok(Math.abs(datelineWest.x)<.01&&Math.abs(datelineEast.x)<.01,'dateline seam must not create a large projection discontinuity');

const equinoxDate=new Date('2026-03-20T12:00:00.000Z'),equinox=solarPoint(equinoxDate);
assert.ok(Math.abs(equinox.lat)<1,'March equinox subsolar latitude must remain near the equator');
assert.ok(Math.abs(equinox.lon)<5,'12 UTC equinox subsolar longitude must remain near Greenwich');
near(solarElevationDegrees(equinox.lat,equinox.lon,equinoxDate),90,1e-8,'subsolar solar elevation');

const now=new Date('2026-09-10T20:00:00.000Z'),sun=solarPoint(now),sunNormal=geodeticNormal(sun.lat,sun.lon),terminator=terminatorGeodetic(now,360);
assert.equal(terminator.length,361,'terminator sample closure');
for(const point of terminator)near(dot3(geodeticNormal(point.lat,point.lon),sunNormal),0,2e-12,'terminator solar dot product');
near(terminator[0].lat,terminator.at(-1)!.lat,2e-10,'terminator latitude closes');near(lonDelta(terminator[0].lon,terminator.at(-1)!.lon),0,2e-10,'terminator longitude closes');

assert.equal(inverseOrthoWgs84(1.2,1.2,0,0),null,'screen point outside ellipsoid silhouette must not invent a surface coordinate');
console.log('R284 EARTH VISUAL FIDELITY PASS · WGS84 ellipsoid round-trip projection · dateline continuity · equinox/subsolar geometry · exact UTC terminator orthogonality · no outside-limb coordinate fabrication');
