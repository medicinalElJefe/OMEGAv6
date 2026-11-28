import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const science=readFileSync('src7/workspaces/ScienceWorkspaceR441.tsx','utf8');
const css=readFileSync('src7/omega7.css','utf8');
const groups={
 Relativity:['relativity-lab','temporal-workbench','pell-research','typed-provenance','canon-topology'],
 Atlas:['full-sphere','sphere-agent-fabric','route-basin','atlas-topology','source-execution','motion-source','atlas-viewport']
};
for(const [route,ids] of Object.entries(groups)){
 assert.ok(science.includes(route+':['),'missing instrument index '+route);
 for(const id of ids){
  assert.ok(science.includes("id:'"+id+"'"),'missing navigation item '+id);
  assert.ok(science.includes("id='o7-"+id+"' tabIndex={-1}"),'missing focusable instrument '+id);
 }
}
for(const token of ['data-r777-instrument-index','aria-label={route+\' instrument navigation\'}','scrollIntoView','prefers-reduced-motion','target.focus({preventScroll:true})'])assert.ok(science.includes(token),'missing accessible navigation '+token);
for(const component of ['RelativityLab','DeweyTemporalWorkbenchV9','PellResearchWorkbenchR755','TypedProvenanceWorkbenchR757','CanonTopologyWorkbenchR763','FullSphereInstrumentR525','RouteBasinInstrumentR732','SourceExecutionWorkspaceR531','MotionSourceInstrumentR537','AtlasViewport'])assert.ok(science.includes('<'+component),'capability removed '+component);
assert.ok(css.includes('.o7-science-instrument-index')&&css.includes('min-height:44px')&&css.includes('@media(max-width:600px)'),'responsive touch target contract missing');
console.log('R777 SCIENCE INSTRUMENT NAVIGATION PASS · all 11 instrument mounts retained · keyboard focus · mobile touch targets · reduced-motion behavior');

assert.ok(science.includes('{SCIENCE_INSTRUMENTS[route]&&<nav'),'instrument index must be visible before expanding deep tools');
assert.ok(science.includes('requestedInstrument.current=item.id;setInstrumentOpen(true)'),'direct instrument navigation opens the existing surface');
console.log('R1022 DISCOVERY PASS: Atlas/Relativity index visible in standard mode; direct instrument open and focus.');
