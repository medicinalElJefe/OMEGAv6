import assert from "node:assert/strict";
import { classify } from "../src/worker.js";

const cases = [
  ["", "FAST_DETERMINISTIC"],
  ["status", "FAST_DETERMINISTIC"],
  ["health", "FAST_DETERMINISTIC"],
  ["version", "FAST_DETERMINISTIC"],
  ["build status", "FAST_DETERMINISTIC"],
  ["runtime status", "FAST_DETERMINISTIC"],
  ["provider status", "FAST_DETERMINISTIC"],
  ["bridge status", "FAST_DETERMINISTIC"],
  ["hybrid link status", "FAST_DETERMINISTIC"],
  ["heartbeat status", "FAST_DETERMINISTIC"],
  ["what is the status?", "FAST_DETERMINISTIC"],
  ["show health", "FAST_DETERMINISTIC"],
  ["check the version", "FAST_DETERMINISTIC"],
  ["get build status", "FAST_DETERMINISTIC"],
  ["activate all modes", "ROUTED_MODEL_FULL"],
  ["use full modes", "ROUTED_MODEL_FULL"],
  ["build me a new runtime", "ROUTED_MODEL"],
  ["can we build it now?", "ROUTED_MODEL"],
  ["repair the display", "ROUTED_MODEL"],
  ["design a dashboard", "ROUTED_MODEL"],
  ["forecast tomorrow", "ROUTED_MODEL"],
  ["train the router", "ROUTED_MODEL"],
  ["compare these builds", "ROUTED_MODEL"],
  ["analyze the state", "ROUTED_MODEL"],
  ["code a worker", "ROUTED_MODEL"],
  ["program the bridge", "ROUTED_MODEL"],
  ["create a menu", "ROUTED_MODEL"],
  ["make it responsive", "ROUTED_MODEL"],
  ["upgrade this", "ROUTED_MODEL"],
  ["hello omega", "ROUTED_MODEL"]
];

for (const [input, expected] of cases) {
  assert.equal(classify(input).route, expected, `route mismatch for ${JSON.stringify(input)}`);
}

console.log(`route regression PASS ${cases.length}/${cases.length}`);
