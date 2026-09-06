import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R121 '+msg)};
const sphere=read('src/OmegaEarthRelativitySphereR121.tsx');
const sphereCss=read('src/omegaEarthRelativitySphereR121.css');
const membrane=read('src/CanonicalMembraneR95.tsx');
const launcher=read('src/sovereignLauncherR117.ts');

must(membrane.includes("import OmegaEarthRelativitySphereR121 from './OmegaEarthRelativitySphereR121'"),'whole-sphere instrument must be shared through canonical membrane authority');
must(membrane.includes("const homeComposite=compact&&label.startsWith('HOME ·')")&&membrane.includes('<OmegaEarthRelativitySphereR121 address={address} onAddress={onAddress} projection={projection} view={view}/>'),'Home compact membrane must promote whole-sphere integration and bind the selected deterministic projection/data skin without removing canonical source truth');
must(membrane.includes("className='r121-home-membrane'")&&membrane.includes('CANONICAL SOURCE MEMBRANE · OPEN 20,736-CELL INSPECTION SURFACE'),'20,736-cell membrane must remain directly reachable as source-truth inspection');
for(const token of ['EARTH_RADIUS_KM=6371','EARTH_ROTATION_RAD_S=7.292115e-5','SURFACE_G=9.80665','INNER CORE','OUTER CORE','LOWER MANTLE','TRANSITION 410 km','TROPOSPHERE','THERMOSPHERE REF'])must(sphere.includes(token),'Earth reference layer missing '+token);
for(const token of ["SphereLens='WHOLE'|'CUTAWAY'|'EVIDENCE'|'CANON'|'SPACE'",'/api/earth/evidence','/api/earth/noaa/catalog','/api/earth/noaa/image','STATE_COUNT','compileSourceTraversal','CANONICAL RADIAL LAYERS ARE REPRESENTATIONAL','not physical dimensions','REFERENCE = published Earth constants','No satellite coverage returned; nothing synthetic substituted'])must(sphere.includes(token),'whole-sphere truth/source contract missing '+token);
must(sphere.includes('atlas resolution · not physical dimensions')||sphere.includes('atlas address resolution · not physical dimensions'),'atlas resolution truth boundary must explicitly reject literal physical dimensions');
must(sphere.includes('for(let i=0;i<STATE_COUNT;i++)'),'canonical spherical field must traverse the full 20,736-address registry rather than a decorative sample');
must(sphere.includes('onDoubleClick={choose}')&&sphere.includes('atlasAddress(d,p,r,l)'),'sphere surface must be an interactive address-navigation instrument');
must(sphereCss.includes('.r121-sphere-body')&&sphereCss.includes('@media(max-width:820px)')&&sphereCss.includes('@media(max-width:620px)'),'whole-sphere UI must have desktop and mobile layout authority');
must(sphereCss.includes('Whole-sphere integrative view is primary; the canonical 20,736-cell membrane remains the source-truth inspection surface.'),'Home projection copy must communicate sphere/membrane authority correctly');

const legacyCmdSafe="s.startswith(chr(35)+chr(33)+'/usr/bin/env python3') and 'OMEGA R34 local Hybrid Link agent' in s and 'https://omegav6.jeffdeweyeljefe.workers.dev' in s and 'Pairing is explicit.' in s";
const r127CmdSafe=launcher.includes("s.startswith(chr(35)+chr(33)+'/usr/bin/env python3')")&&launcher.includes("'OMEGA R34 local Hybrid Link agent' in s")&&launcher.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'")&&launcher.includes("'Pairing is explicit.' in s")&&launcher.includes('hashlib.sha256(b).hexdigest()')&&launcher.includes('server==local');
must(launcher.includes(legacyCmdSafe)||r127CmdSafe,'Hybrid agent validator must construct the shebang without a literal ! under CMD delayed expansion and retain canonical identity validation');
must(launcher.includes("'OMEGA Sovereign RCWA transport agent' in s")&&launcher.includes("s.startswith(chr(35)+chr(33)+'/usr/bin/env python3')"),'RCWA validator must use the same CMD-safe shebang construction');
const legacyValidator=launcher.includes('R120.3_CMD_SAFE')&&launcher.includes('no literal exclamation mark is permitted inside this inline Python');
const r127Validator=launcher.includes('R127_ZERO_DRIFT_SHA256')&&launcher.includes('server-declared SHA256')&&launcher.includes('-m py_compile');
must(legacyValidator||r127Validator,'launcher must preserve CMD-safe construction and expose an equal-or-stronger validator boundary');
must(!launcher.includes("s.startswith('#//omegav6.jeffdeweyeljefe.workers.dev' in s")&&!launcher.includes("s.startswith('#!/usr/bin/env python3' in s"),'malformed R120 screenshot validator pattern must never regress');
must(launcher.includes("replace(/[\\r\\n\"!%&|<>^]/g,''"),'pairing code sanitizer must neutralize CMD delayed and percent expansion metacharacters');
const legacyFailClosed=launcher.includes('The connector did not execute unvalidated source.');
const r127FailClosed=launcher.includes('No downloaded bytes were executed.')&&launcher.includes('failed Python parse validation. It will not execute.');
must(legacyFailClosed||r127FailClosed,'fail-closed Hybrid execution boundary must remain');

console.log('R121/R127 PASS · whole-sphere Earth relativity home instrument · full canonical field · source-backed Earth/satellite evidence · CMD-safe + SHA-256 zero-drift connector validator regression sealed');
