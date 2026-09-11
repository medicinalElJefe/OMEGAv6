export type Vec3=[number,number,number];
export type GeoPoint={lat:number;lon:number};
export type ProjectedPoint={x:number;y:number;z:number;mu:number};
export type InversePoint=GeoPoint&{mu:number;normal:Vec3};

export const WGS84_F=1/298.257223563;
export const WGS84_B=1-WGS84_F;
export const WGS84_E2=1-WGS84_B*WGS84_B;

export const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
export const wrapLon=(x:number)=>((x+540)%360)-180;
const rad=(d:number)=>d*Math.PI/180;
const deg=(r:number)=>r*180/Math.PI;
export const dot3=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(a:Vec3)=>Math.hypot(a[0],a[1],a[2]);
const normalize=(a:Vec3):Vec3=>{const n=Math.max(1e-12,norm(a));return[a[0]/n,a[1]/n,a[2]/n]};
const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const scale=(a:Vec3,s:number):Vec3=>[a[0]*s,a[1]*s,a[2]*s];

export function geodeticNormal(lat:number,lon:number):Vec3{
 const p=rad(lat),l=rad(lon),c=Math.cos(p);return[c*Math.cos(l),c*Math.sin(l),Math.sin(p)];
}

export function geodeticToEcef(lat:number,lon:number):Vec3{
 const p=rad(lat),l=rad(lon),s=Math.sin(p),c=Math.cos(p),N=1/Math.sqrt(1-WGS84_E2*s*s);
 return[N*c*Math.cos(l),N*c*Math.sin(l),(1-WGS84_E2)*N*s];
}

export function cameraFrame(centerLat:number,centerLon:number){
 const p=rad(centerLat),l=rad(centerLon),up:Vec3=[Math.cos(p)*Math.cos(l),Math.cos(p)*Math.sin(l),Math.sin(p)],east:Vec3=[-Math.sin(l),Math.cos(l),0],north:Vec3=[-Math.sin(p)*Math.cos(l),-Math.sin(p)*Math.sin(l),Math.cos(p)],center=geodeticToEcef(centerLat,centerLon);
 return{center,east,north,up};
}

export function inverseOrthoWgs84(nx:number,ny:number,centerLat:number,centerLon:number):InversePoint|null{
 const {center,east,north,up}=cameraFrame(centerLat,centerLon),q=add(center,add(scale(east,nx),scale(north,ny))),ib2=1/(WGS84_B*WGS84_B);
 const A=up[0]*up[0]+up[1]*up[1]+up[2]*up[2]*ib2;
 const B=2*(q[0]*up[0]+q[1]*up[1]+q[2]*up[2]*ib2);
 const C=q[0]*q[0]+q[1]*q[1]+q[2]*q[2]*ib2-1;
 const disc=B*B-4*A*C;if(disc<0)return null;
 const t=(-B+Math.sqrt(Math.max(0,disc)))/(2*A),p=add(q,scale(up,t)),lon=wrapLon(deg(Math.atan2(p[1],p[0]))),xy=Math.hypot(p[0],p[1]),lat=deg(Math.atan2(p[2],Math.max(1e-12,xy)*(1-WGS84_E2))),normal=geodeticNormal(lat,lon),mu=dot3(normal,up);
 if(mu<-1e-8)return null;return{lat,lon,mu:clamp(mu,0,1),normal};
}

export function forwardOrthoWgs84(lat:number,lon:number,centerLat:number,centerLon:number):ProjectedPoint{
 const {center,east,north,up}=cameraFrame(centerLat,centerLon),p=geodeticToEcef(lat,lon),d:Vec3=[p[0]-center[0],p[1]-center[1],p[2]-center[2]],normal=geodeticNormal(lat,lon),mu=dot3(normal,up);
 return{x:dot3(d,east),y:dot3(d,north),z:mu,mu};
}

export function solarPoint(date:Date):GeoPoint{
 const jd=date.getTime()/86400000+2440587.5,T=(jd-2451545)/36525,L0=(280.46646+T*(36000.76983+T*.0003032))%360,M=357.52911+T*(35999.05029-.0001537*T),e=.016708634-T*(.000042037+.0000001267*T),C=Math.sin(rad(M))*(1.914602-T*(.004817+.000014*T))+Math.sin(rad(2*M))*(.019993-.000101*T)+Math.sin(rad(3*M))*.000289,trueLong=L0+C,omega=125.04-1934.136*T,lambda=trueLong-.00569-.00478*Math.sin(rad(omega)),eps0=23+(26+(21.448-T*(46.815+T*(.00059-T*.001813)))/60)/60,eps=eps0+.00256*Math.cos(rad(omega)),decl=deg(Math.asin(Math.sin(rad(eps))*Math.sin(rad(lambda)))),y=Math.tan(rad(eps/2))**2,eq=4*deg(y*Math.sin(2*rad(L0))-2*e*Math.sin(rad(M))+4*e*y*Math.sin(rad(M))*Math.cos(2*rad(L0))-.5*y*y*Math.sin(4*rad(L0))-1.25*e*e*Math.sin(2*rad(M))),minutes=date.getUTCHours()*60+date.getUTCMinutes()+date.getUTCSeconds()/60+date.getUTCMilliseconds()/60000;
 return{lat:decl,lon:wrapLon(180-(minutes+eq)*.25)};
}

export function terminatorGeodetic(date:Date,samples=240):GeoPoint[]{
 const sun=solarPoint(date),s=geodeticNormal(sun.lat,sun.lon),seed:Vec3=Math.abs(s[2])<.92?[0,0,1]:[0,1,0],u=normalize(cross(s,seed)),v=normalize(cross(s,u)),out:GeoPoint[]=[];
 for(let i=0;i<=samples;i++){const t=i/samples*Math.PI*2,n:Vec3=[u[0]*Math.cos(t)+v[0]*Math.sin(t),u[1]*Math.cos(t)+v[1]*Math.sin(t),u[2]*Math.cos(t)+v[2]*Math.sin(t)];out.push({lat:deg(Math.asin(clamp(n[2],-1,1))),lon:wrapLon(deg(Math.atan2(n[1],n[0])))})}
 return out;
}

export function solarIllumination(lat:number,lon:number,date:Date){
 const sun=solarPoint(date);return dot3(geodeticNormal(lat,lon),geodeticNormal(sun.lat,sun.lon));
}
