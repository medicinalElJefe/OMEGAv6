import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const surface=await readFile(new URL('../src/data-native-surface-runtime.mjs',import.meta.url),'utf8');
test('loading state does not clear the previous regional or exact shaped canvas',()=>{assert.match(surface,/state!=='LOADING'\)\{regionalCanvas=null/);assert.match(surface,/state!=='DEEP_SOURCE_READ'\)\{exactCanvas=null/);});
