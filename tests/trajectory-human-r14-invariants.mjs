import fs from 'node:fs';
import assert from 'node:assert/strict';

const overlay=fs.readFileSync('src/TrajectoryFieldOverlay.tsx','utf8');
const css=fs.readFileSync('src/trajectoryHumanR14.css','utf8');
assert(overlay.includes("import './trajectoryHumanR14.css'"),'human-readable trajectory visual layer must be mounted');
assert(overlay.includes("className='trajectory-corridor-r14'")&&overlay.includes('trajectory-segment-r14'),'trajectory must expose corridor plus directional segments');
assert(overlay.includes("markerEnd='url(#trajectoryArrowR14)'"),'trajectory segments must visibly encode route direction');
assert(overlay.includes('data-decision={p.decision}')&&overlay.includes('data-closure={p.closure.toFixed(3)}')&&overlay.includes('data-drive={p.drive.toFixed(3)}'),'trajectory segments must retain source metrics as inspectable truth metadata');
assert(overlay.includes('COMPUTATIONAL STATE ROUTE')&&overlay.includes('not measured clock time'),'visual must explicitly distinguish state-route order from physical time');
assert(overlay.includes('BEST · S')&&overlay.includes('closure {p.closure.toFixed(2)}'),'visual must surface meaningful route milestones and closure progression');
assert(css.includes('.trajectory-segment-r14.stay')&&css.includes('.trajectory-segment-r14.turn')&&css.includes('.trajectory-segment-r14.escalate'),'STAY/TURN/ESCALATE must be visually distinguishable');
assert(!overlay.includes('@appdeploy/client')&&!css.includes('appdeploy.ai'),'trajectory visualization must remain provider portable');
console.log('PASS trajectory-human-r14-invariants');
