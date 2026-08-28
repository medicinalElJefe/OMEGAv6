const $ = (s) => document.querySelector(s);
const draftKey = "omega.b015.chatDraft.v1";
const prompt = $("#prompt");
const chatForm = $("#chatForm");
const sendBtn = $("#sendBtn");
const conversation = $("#conversation");
const routeState = $("#routeState");
const draftState = $("#draftState");
let requestSeq = 0;
let inFlight = false;

function addMessage(kind, text) {
  const el = document.createElement("div");
  el.className = `msg ${kind}`;
  el.textContent = text;
  conversation.appendChild(el);
  conversation.scrollTop = conversation.scrollHeight;
}

function setDraftState(text) { draftState.textContent = text; }

function restoreDraft() {
  try {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      prompt.value = saved;
      setDraftState("DRAFT RESTORED");
    } else setDraftState("NO LOCAL DRAFT");
  } catch { setDraftState("LOCAL DRAFT UNAVAILABLE"); }
}

prompt.addEventListener("input", () => {
  try {
    if (prompt.value) {
      localStorage.setItem(draftKey, prompt.value);
      setDraftState("DRAFT SAVED LOCALLY");
    } else {
      localStorage.removeItem(draftKey);
      setDraftState("NO LOCAL DRAFT");
    }
  } catch { setDraftState("LOCAL DRAFT UNAVAILABLE"); }
});

async function loadStatus() {
  try {
    const r = await fetch("/api/status", { cache: "no-store" });
    const s = await r.json();
    $("#liveBadge").textContent = r.ok ? "LIVE" : "DEGRADED";
    $("#cloudState").textContent = s.cloud?.worker || "UNKNOWN";
    $("#hybridState").textContent = s.hybridLink?.state || "UNKNOWN";
    $("#modelState").textContent = s.modelProvider || "UNKNOWN";
    $("#statusBox").textContent = JSON.stringify(s, null, 2);
  } catch (e) {
    $("#liveBadge").textContent = "OFFLINE";
    $("#statusBox").textContent = String(e);
  }
}

async function previewRoute(text, seq) {
  routeState.textContent = "CHECKING ROUTE";
  try {
    const r = await fetch("/api/route-preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ text })
    });
    const data = await r.json();
    if (seq !== requestSeq) return;
    routeState.textContent = data.route === "FAST_DETERMINISTIC" ? "FAST DETERMINISTIC" : data.route === "ROUTED_MODEL_FULL" ? "ROUTED MODEL • FULL" : "ROUTED MODEL";
  } catch {
    if (seq === requestSeq) routeState.textContent = "ROUTE UNKNOWN";
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = prompt.value.trim();
  if (!text || inFlight) return;
  inFlight = true;
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending…";
  const seq = ++requestSeq;
  addMessage("user", text);
  await previewRoute(text, seq);

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ text })
    });
    const data = await r.json();
    addMessage(r.ok ? "assistant" : "error", data.reply || data.code || "No response returned.");
    if (r.ok) {
      prompt.value = "";
      try { localStorage.removeItem(draftKey); } catch {}
      setDraftState("NO LOCAL DRAFT");
    }
  } catch (e) {
    addMessage("error", `Request failed: ${e.message || e}`);
  } finally {
    inFlight = false;
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
  }
});

restoreDraft();
loadStatus();
setInterval(loadStatus, 60000);
