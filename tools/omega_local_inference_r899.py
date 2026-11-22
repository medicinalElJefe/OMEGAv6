#!/usr/bin/env python3
"""R899 optional, bounded local model inference via installed Ollama (no model downloads).

Only the Hub's authenticated, operator-submitted LOCAL_INFER task can call this.
Never contacts cloud endpoints or executes a shell. A local model and its backend
must already be running; absence is a held condition, not synthetic inference.
"""
from __future__ import annotations
import json
import re
import urllib.error
import urllib.request

LOCAL_MODEL_ENDPOINT_R899 = "http://127.0.0.1:11434/api/generate"
MAX_PROMPT_CHARS_R899 = 8192
MAX_RESPONSE_BYTES_R899 = 65536
MAX_TOKENS_R899 = 512
MODEL_PATTERN_R899 = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,127}$")


def list_local_models_r899(*, endpoint: str = "http://127.0.0.1:11434/api/tags") -> dict:
    """Discover models from local Ollama only; never download or probe remote hosts."""
    req = urllib.request.Request(endpoint, method="GET", headers={"Accept": "application/json"})
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, request, fp, code, msg, headers, newurl):
            return None
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect)
    try:
        with opener.open(req, timeout=5) as response:
            if response.status != 200: raise ValueError("LOCAL_MODELS_BACKEND_STATUS_HELD")
            data_bytes = response.read(MAX_RESPONSE_BYTES_R899 + 1)
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise ValueError("LOCAL_MODEL_BACKEND_NOT_AVAILABLE_HELD") from exc
    if len(data_bytes) > MAX_RESPONSE_BYTES_R899:
        raise ValueError("LOCAL_MODELS_RESPONSE_BOUND_HELD")
    try:
        data = json.loads(data_bytes.decode("utf-8"))
    except (UnicodeError, ValueError) as exc:
        raise ValueError("LOCAL_MODELS_JSON_HELD") from exc
    if not isinstance(data, dict) or not isinstance(data.get("models"), list):
        raise ValueError("LOCAL_MODELS_SCHEMA_HELD")
    if len(data["models"]) > 512: raise ValueError("LOCAL_MODELS_COUNT_HELD")
    names = []
    for entry in data["models"]:
        if not isinstance(entry, dict) or not isinstance(entry.get("name"), str):
            raise ValueError("LOCAL_MODELS_ENTRY_HELD")
        name = entry["name"]
        if not MODEL_PATTERN_R899.fullmatch(name): raise ValueError("LOCAL_MODELS_NAME_HELD")
        names.append(name)
    if len(set(names)) != len(names): raise ValueError("LOCAL_MODELS_DUPLICATE_HELD")
    return {"schema": "OMEGA_LOCAL_MODELS_R899", "models": sorted(names), "backend": "OLLAMA_LOOPBACK_ONLY",
            "nativePcAccepted": False, "gpuProven": False}


def infer_local_r899(args: dict, *, endpoint: str = LOCAL_MODEL_ENDPOINT_R899) -> dict:
    if not isinstance(args, dict):
        raise ValueError("LOCAL_INFER_ARGS_REQUIRED")
    # endpoint is an internal unit-test seam, never an operator argument.
    model = args.get("model")
    prompt = args.get("prompt")
    if not isinstance(model, str) or not MODEL_PATTERN_R899.fullmatch(model):
        raise ValueError("LOCAL_INFER_MODEL_REQUIRED")
    if not isinstance(prompt, str) or not 1 <= len(prompt) <= MAX_PROMPT_CHARS_R899 or "\0" in prompt:
        raise ValueError("LOCAL_INFER_PROMPT_BOUND_HELD")
    tokens = args.get("num_predict", 256)
    if type(tokens) is not int or not 1 <= tokens <= MAX_TOKENS_R899:
        raise ValueError("LOCAL_INFER_TOKEN_BOUND_HELD")
    if "endpoint" in args or "url" in args or "host" in args or "options" in args:
        raise ValueError("LOCAL_INFER_OPERATOR_ENDPOINT_OR_OPTIONS_HELD")
    payload = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": tokens, "temperature": 0}
    }, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    req = urllib.request.Request(
        endpoint, data=payload, method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json"}
    )
    # Do not honor HTTP_PROXY/HTTPS_PROXY or follow 30x redirects to remote hosts.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, request, fp, code, msg, headers, newurl):
            return None
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect)
    try:
        with opener.open(req, timeout=45) as response:
            if response.status != 200:
                raise ValueError("LOCAL_INFER_BACKEND_STATUS_HELD")
            raw = response.read(MAX_RESPONSE_BYTES_R899 + 1)
            if len(raw) > MAX_RESPONSE_BYTES_R899:
                raise ValueError("LOCAL_INFER_RESPONSE_BOUND_HELD")
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise ValueError("LOCAL_MODEL_BACKEND_NOT_AVAILABLE_HELD") from exc
    try:
        data = json.loads(raw.decode("utf-8"))
    except (UnicodeError, ValueError) as exc:
        raise ValueError("LOCAL_INFER_BACKEND_JSON_HELD") from exc
    if not isinstance(data, dict) or data.get("model") != model or data.get("done") is not True:
        raise ValueError("LOCAL_INFER_BACKEND_IDENTITY_OR_COMPLETION_HELD")
    answer = data.get("response")
    if not isinstance(answer, str) or len(answer) > 32768:
        raise ValueError("LOCAL_INFER_ANSWER_BOUND_HELD")
    # This is software execution evidence, not proof of physical truth,
    # independent model correctness, R141 native host acceptance, or GPU use.
    return {
        "schema": "OMEGA_LOCAL_INFER_R899",
        "model": model,
        "response": answer,
        "state": "LOCAL_MODEL_RETURNED",
        "backend": "OLLAMA_LOOPBACK_ONLY",
        "tokensRequested": tokens,
        "done": True,
        "nativePcAccepted": False,
        "gpuProven": False,
        "semanticTruthProven": False
    }
