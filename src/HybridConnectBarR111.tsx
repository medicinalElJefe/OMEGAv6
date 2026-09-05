import SovereignConnectionR112 from './SovereignConnectionR112';

/**
 * R112 compatibility mount.
 * R111 introduced the one-touch connection surface; R112 keeps the mount point
 * while moving pairing, reconnect/repair, launcher generation, heartbeat truth,
 * solver state and progressive disclosure into one shared connection component.
 */
export default function HybridConnectBarR111(){return <SovereignConnectionR112 compact/>}
