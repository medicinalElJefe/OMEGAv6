import SovereignConnectionR117 from './SovereignConnectionR117';

/**
 * Compatibility mount for the one-touch connection surface.
 * R117 keeps the existing mount point while moving connection repair to a
 * server-backed fresh-pair bootstrap and one clean canonical Windows connector.
 */
export default function HybridConnectBarR111(){return <SovereignConnectionR117 compact/>}
