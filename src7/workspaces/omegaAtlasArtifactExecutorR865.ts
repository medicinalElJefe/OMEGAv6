import type {Mandala20736Field} from '../../src/mandala20736Runtime';
import {executeModelPipelineR847} from './omegaModelPipelineR847';
import {renderTraversalSvgR858} from './omegaTraversalSvgR858';
import {createModelArtifactR862,type OmegaArtifactR862} from './omegaArtifactSpineR862';
/** R865: one admitted input -> computed execution -> validated, portable artifact. */
export function executeAtlasArtifactR865(field:Mandala20736Field,startAddress:number,limit=32):{artifact:OmegaArtifactR862;csv:string;rowCount:number}{
 const result=executeModelPipelineR847(field,{route:'Atlas',startAddress,limit});
 if(result.admission.available!==true||result.authority!=='MODEL_DERIVED')throw Error('Atlas execution not admitted');
 if(result.trace.route.length<2)throw Error('Traversal did not produce at least two states');
 const svg=renderTraversalSvgR858(field,result.trace.route);
 const artifact=createModelArtifactR862(svg,result.trace.route);
 return {artifact,csv:result.export.csv,rowCount:result.export.rowCount};
}
