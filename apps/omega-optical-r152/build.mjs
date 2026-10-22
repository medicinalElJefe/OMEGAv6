import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {OPTICAL_UI_R152} from '../../services/opticalUiR152.js';
const out=resolve('dist');
await mkdir(out,{recursive:true});
await writeFile(resolve(out,'index.html'),OPTICAL_UI_R152,'utf8');
console.log('OMEGA OPTICAL R152 · Vercel static surface exported to dist/index.html');
