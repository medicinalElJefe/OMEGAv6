import importlib.util
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import unittest

MODULE = Path(__file__).resolve().parents[1] / "tools" / "omega_local_inference_r899.py"
spec = importlib.util.spec_from_file_location("_omega_local_inference_r899_test", MODULE)
adapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(adapter)


class LocalInferenceTests(unittest.TestCase):
    def test_backend_is_loopback_only(self):
        self.assertEqual(adapter.LOCAL_MODEL_ENDPOINT_R899, "http://127.0.0.1:11434/api/generate")
        for arguments in (
            {"model": "llama3.2", "prompt": "", "num_predict": 5},
            {"model": "bad model", "prompt": "hello"},
            {"model": "llama3.2", "prompt": "hello", "num_predict": 513},
            {"model": "llama3.2", "prompt": "hello", "num_predict": True},
            {"model": "llama3.2", "prompt": "hello", "url": "https://example.org"},
            {"model": "llama3.2", "prompt": "hello", "endpoint": "http://example.org"},
            {"model": "llama3.2", "prompt": "x" * 8193},
        ):
            with self.subTest(arguments=arguments), self.assertRaises(ValueError):
                adapter.infer_local_r899(arguments)

    def test_absent_model_fails_closed(self):
        with self.assertRaisesRegex(ValueError, "LOCAL_MODEL_BACKEND_NOT_AVAILABLE_HELD"):
            adapter.infer_local_r899(
                {"model": "llama3.2", "prompt": "hello"},
                endpoint="http://127.0.0.1:1/api/generate"
            )

    def _mock(self, *, response=None, status=200, redirect=None):
        calls = []
        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                calls.append({"path": self.path, "method": "GET"})
                self.send_response(302 if redirect else status)
                self.send_header("Content-Type", "application/json")
                if redirect: self.send_header("Location", redirect)
                self.end_headers()
                if response is not None: self.wfile.write(json.dumps(response).encode())
            def do_POST(self):
                raw = self.rfile.read(int(self.headers.get("Content-Length", "0")))
                calls.append({"path": self.path, "body": json.loads(raw)})
                self.send_response(302 if redirect else status)
                self.send_header("Content-Type", "application/json")
                if redirect: self.send_header("Location", redirect)
                self.end_headers()
                if response is not None: self.wfile.write(json.dumps(response).encode())
            def log_message(self, *args): pass
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        return server, thread, calls

    def test_real_local_model_response_and_bounded_receipt(self):
        server, thread, calls = self._mock(response={
            "model": "llama3.2", "response": "local result only", "done": True
        })
        try:
            url = f"http://127.0.0.1:{server.server_port}/api/generate"
            result = adapter.infer_local_r899(
                {"model": "llama3.2", "prompt": "Explain a vector", "num_predict": 21},
                endpoint=url
            )
            self.assertEqual(result["schema"], "OMEGA_LOCAL_INFER_R899")
            self.assertEqual(result["response"], "local result only")
            self.assertFalse(result["gpuProven"])
            self.assertFalse(result["nativePcAccepted"])
            self.assertEqual(calls[0]["path"], "/api/generate")
            self.assertEqual(calls[0]["body"]["options"]["num_predict"], 21)
            self.assertFalse(calls[0]["body"]["stream"])
        finally:
            server.shutdown()
            thread.join(timeout=3)
            server.server_close()

    def test_remote_redirect_not_followed(self):
        server, thread, calls = self._mock(redirect="https://example.org/api/generate")
        try:
            with self.assertRaisesRegex(ValueError, "LOCAL_MODEL_BACKEND_NOT_AVAILABLE_HELD"):
                adapter.infer_local_r899(
                    {"model": "llama3.2", "prompt": "hello"},
                    endpoint=f"http://127.0.0.1:{server.server_port}/api/generate"
                )
            self.assertEqual(len(calls), 1)
        finally:
            server.shutdown()
            thread.join(timeout=3)
            server.server_close()

    def test_local_model_inventory_and_remote_redirect_refusal(self):
        server, thread, calls = self._mock(response={
            "models": [{"name": "llama3.2:latest"}, {"name": "phi3:mini"}]
        })
        try:
            result = adapter.list_local_models_r899(
                endpoint=f"http://127.0.0.1:{server.server_port}/api/tags"
            )
            self.assertEqual(result["schema"], "OMEGA_LOCAL_MODELS_R899")
            self.assertEqual(result["models"], ["llama3.2:latest", "phi3:mini"])
            self.assertFalse(result["gpuProven"])
            self.assertEqual(calls[0]["path"], "/api/tags")
        finally:
            server.shutdown();thread.join(timeout=3);server.server_close()
        server, thread, calls = self._mock(redirect="https://example.org/api/tags")
        try:
            with self.assertRaisesRegex(ValueError, "LOCAL_MODEL_BACKEND_NOT_AVAILABLE_HELD"):
                adapter.list_local_models_r899(
                    endpoint=f"http://127.0.0.1:{server.server_port}/api/tags"
                )
            self.assertEqual(len(calls), 1)
        finally:
            server.shutdown();thread.join(timeout=3);server.server_close()

    def test_backend_model_identity_refusal(self):
        server, thread, calls = self._mock(response={
            "model": "unrelated", "response": "wrong model", "done": True
        })
        try:
            with self.assertRaisesRegex(ValueError, "LOCAL_INFER_BACKEND_IDENTITY_OR_COMPLETION_HELD"):
                adapter.infer_local_r899(
                    {"model": "llama3.2", "prompt": "hello"},
                    endpoint=f"http://127.0.0.1:{server.server_port}/api/generate"
                )
        finally:
            server.shutdown()
            thread.join(timeout=3)
            server.server_close()


if __name__ == "__main__":
    unittest.main()
