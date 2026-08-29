export type RenderDonorStatus='HOSTED_ACTIVE'|'NATIVE_DONOR_IDENTIFIED'|'NATIVE_EXECUTION_UNVERIFIED';
export type SvgValidation={valid:boolean;namespace:boolean;viewBox:boolean;stateMarker:boolean;parserError:boolean;bytes:number};

export const RENDER_PORTABILITY_DONORS=[
 {id:'QT_SVG_A',family:'QtSvg',driveId:'11i6qdBfycfmUklESHDNHZ3nLR40-KA8L',evidence:'pyside6_qtsvg_python.h',status:'NATIVE_DONOR_IDENTIFIED' as RenderDonorStatus},
 {id:'QT_SVG_WIDGETS_A',family:'QtSvgWidgets',driveId:'1CTNqmaNsYtqcSrGn0qrrM6xg4WQipxY3',evidence:'pyside6_qtsvgwidgets_python.h',status:'NATIVE_DONOR_IDENTIFIED' as RenderDonorStatus},
 {id:'QT_SVG_B',family:'QtSvg',driveId:'1pgOTQaScm3fwEele8tkBgOF5DUfgd2L8',evidence:'pyside6_qtsvg_python.h',status:'NATIVE_DONOR_IDENTIFIED' as RenderDonorStatus},
 {id:'SVG_LIB_A',family:'svgLib',driveId:'1UA1vx2A0dayGMRZTks4S-AUornaQMHZT',evidence:'python/svg path donor tree',status:'NATIVE_DONOR_IDENTIFIED' as RenderDonorStatus},
 {id:'SVG_LIB_B',family:'svgLib',driveId:'14m9oNeykDrUCNLwQyFlDy6oaDvod6gBu',evidence:'python/svg path donor tree',status:'NATIVE_DONOR_IDENTIFIED' as RenderDonorStatus},
 {id:'SVG_LIB_C',family:'svgLib',driveId:'1pX-qbyw4dv68bAmOOJKeuwfR3if9HDwJ',evidence:'python/svg path donor tree',status:'NATIVE_DONOR_IDENTIFIED' as RenderDonorStatus},
] as const;

export const RENDER_PORTABILITY_BOUNDARY='Browser SVG export and DOM round-trip validation are hosted capabilities. Preserved QtSvg, QtSvgWidgets and svgLib directories are native donor evidence only; native Qt rendering is not represented as executed without a verified native runtime.';

export function validateOmegaSvg(text:string,stateId:number):SvgValidation{
 const namespace=/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(text);
 const viewBox=/viewBox=["']0 0 1200 1200["']/.test(text);
 const stateMarker=text.includes(`STATE ${stateId}`);
 let parserError=false;
 if(typeof DOMParser!=='undefined'){
  const doc=new DOMParser().parseFromString(text,'image/svg+xml');
  parserError=doc.querySelector('parsererror')!==null||doc.documentElement.nodeName.toLowerCase()!=='svg';
 }
 return{valid:namespace&&viewBox&&stateMarker&&!parserError,namespace,viewBox,stateMarker,parserError,bytes:new TextEncoder().encode(text).byteLength};
}

export function compileRenderPortabilityReceipt(stateId:number,validation:SvgValidation){
 return{schema:'OMEGA_RENDER_PORTABILITY_QTSVG_R1',stateId,hostedRenderer:'SVG_DOM',hostedValidation:validation,donorCount:RENDER_PORTABILITY_DONORS.length,donors:RENDER_PORTABILITY_DONORS,boundary:RENDER_PORTABILITY_BOUNDARY,nativeQtExecutionVerified:false,generatedAt:new Date().toISOString()};
}
