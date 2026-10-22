import {OMEGA_ACCEPTED_PRODUCTION_R116} from './acceptedProductionR116';

export const OMEGA_ACCEPTED_PRODUCTION_R117={
 schema:'OMEGA_ACCEPTED_PRODUCTION_CONTRACT_R117',
 predecessor:OMEGA_ACCEPTED_PRODUCTION_R116.schema,
 authority:'ADDITIVE_PERSISTENT_NON_REGRESSION',
 laws:[
  {id:'FRESH_UNPAIRED_BOOTSTRAP_REQUIRES_NO_BRIDGE_SECRET',text:'A brand-new browser runtime session may mint its first durable Hybrid credential without a pre-existing bridge secret. Bootstrap itself is not device proof.'},
  {id:'EXISTING_PAIR_ROTATION_REQUIRES_MATCHING_BRIDGE_PROOF',text:'Once a runtime session already has a durable Hybrid credential, rotation must present that session’s current x-omega-bridge-secret before any replacement secret is generated or stored. A stale or cross-session credential cannot seize the pairing.'},
  {id:'ONE_CLEAN_CONNECTOR_IS_CANONICAL',text:'The ordinary Windows connection path exposes one current R117 connector bound only to https://omegav6.jeffdeweyeljefe.workers.dev. Retired Foundasound launchers and inherited fallback launchers are not part of the normal repair path.'},
  {id:'BOOTSTRAP_IS_NOT_DEVICE_PROOF',text:'Issuing or downloading a fresh credential never sets nativeExecutionClaimed and never becomes PC ONLINE. A current authenticated device heartbeat is still required.'},
  {id:'LIVE_WINDOWS_DIAGNOSTICS',text:'The clean connector prints canonical reachability, Python start, agent validation, authentication, heartbeat and governed poll output directly in the Windows console so failures are visible instead of hidden behind a silent launcher state.'},
  {id:'SERVER_AND_BROWSER_BRIDGE_BINDING_MATCH',text:'The browser saves the exact bridgeId/secret returned by the durable bootstrap before it begins polling status, so the status surface and downloaded connector address the same durable bridge.'},
  {id:'R116_AND_ALL_PRIOR_ACCEPTED_PRODUCTION_PRESERVED',text:'R116 authority separation, R115 machine adapters, R114 durable federation ceremony, R113 vector carry, R112/R111 federation and Hybrid truth, RSC/Woven Continuity, Mode 188, atlas relativity, AI, Earth/source evidence, archive continuity, navigation, mobile/desktop surfaces, specialist tools and proof governance remain non-regression requirements.'}
 ]
} as const;