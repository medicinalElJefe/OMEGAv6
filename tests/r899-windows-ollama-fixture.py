#!/usr/bin/env python3
"""R899 Windows CI-only deterministic Ollama-shaped loopback fixture.

No production use, model inference, network downloads, or training. This verifies
the *compiled* Hub's actual request/response and authenticated job ledger.
"""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = 11434
MODEL = "omega-ci-fixture:latest"
PROMPT = "R899_EXECUTION_PROOF_PROMPT"
RESPONSE = "R899_COMPILED_WORKER_RETURNED_ACTUAL_LOCAL_HTTP_RESPONSE"


class Fixture(BaseHTTPRequestHandler):
    def _send(self, status, value):
        data = json.dumps(value, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path != "/api/tags":
            return self._send(404, {"error": "fixture route absent"})
        self._send(200, {"models": [{"name": MODEL}]})

    def do_POST(self):
        if self.path != "/api/generate":
            return self._send(404, {"error": "fixture route absent"})
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 16384:
                return self._send(400, {"error": "fixture request limit"})
            body = json.loads(self.rfile.read(size))
        except (ValueError, UnicodeError):
            return self._send(400, {"error": "fixture JSON"})
        if (body.get("model") != MODEL or body.get("prompt") != PROMPT or
                body.get("stream") is not False or body.get("options", {}).get("num_predict") != 32):
            return self._send(422, {"error": "fixture exact model/prompt/bounds mismatch"})
        self._send(200, {
            "model": MODEL,
            "response": RESPONSE,
            "done": True,
            "done_reason": "stop"
        })

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Fixture)
    try:
        server.serve_forever(poll_interval=0.05)
    finally:
        server.server_close()
