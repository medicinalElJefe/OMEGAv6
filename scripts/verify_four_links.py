from __future__ import annotations

import re
import sys
import urllib.error
import urllib.request

URLS = [
    "https://omegav6.jeffdeweyeljefe.workers.dev/",
    "https://omega-genesis-v1.jeffdeweyeljefe.workers.dev/",
    "https://omega-optical-cloud-woven2.vercel.app/",
    "https://omega-sovereign-convergence.foundasound.chatgpt.site/",
]

failures = 0
for url in URLS:
    print(f"=== {url} ===")
    req = urllib.request.Request(url, headers={"User-Agent": "OMEGA-live-link-probe/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read()
            code = response.getcode()
            final = response.geturl()
            ctype = response.headers.get("content-type", "")
    except urllib.error.HTTPError as exc:
        body = exc.read()
        code = exc.code
        final = exc.geturl()
        ctype = exc.headers.get("content-type", "")
    except Exception as exc:
        print(f"ERROR={type(exc).__name__}: {exc}")
        failures += 1
        continue

    text = body.decode("utf-8", errors="ignore")
    match = re.search(r"<title[^>]*>(.*?)</title>", text, re.I | re.S)
    title = re.sub(r"\s+", " ", match.group(1)).strip()[:180] if match else ""
    print(f"HTTP={code}")
    print(f"FINAL={final}")
    print(f"CONTENT_TYPE={ctype}")
    print(f"BYTES={len(body)}")
    print(f"TITLE={title}")
    if not (200 <= code < 400) or len(body) < 100:
        failures += 1

sys.exit(1 if failures else 0)
