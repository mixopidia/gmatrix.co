import { api, getCurrentPair, setCurrentPair } from "./api";

/* try to infer a pair like BTC/USDT from visible text such as "BTCUSDT" */
function normalizeSymbolText(t) {
  t = (t || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (/USDT$/.test(t)) return t.replace(/USDT$/, "/USDT");
  if (/USD$/.test(t))  return t.replace(/USD$/, "/USD");
  if (/BTC$/.test(t))  return t.replace(/BTC$/, "/BTC");
  return "BTC/USDT";
}

function startSymbolObserver() {
  const root = document.body;
  let last = "";
  const read = () => {
    // scan a slice of text for a token like BTCUSDT/BNBUSDT/etc
    const all = document.body.innerText || "";
    const m = all.match(/\b[A-Z]{2,6}(USDT|USD|BTC)\b/);
    if (m && m[0] !== last) {
      last = m[0];
      setCurrentPair(normalizeSymbolText(m[0]));
    }
  };
  const mo = new MutationObserver(() => read());
  mo.observe(root, { subtree: true, childList: true, characterData: true });
  read();
}

function pickInput(scope, name) {
  return (
    scope.querySelector(`input[placeholder="${name}"]`) ||
    scope.querySelector(`input[aria-label="${name}"]`) ||
    scope.querySelector(`input[name="${name.toLowerCase()}"]`)
  );
}

async function handleClick(e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const label = (btn.innerText || btn.textContent || "").trim().toLowerCase();
  if (label !== "buy" && label !== "sell") return;

  const box =
    btn.closest(".order-form, form, .card, .panel, .col-md-3, .col, div") || document;

  const priceEl = pickInput(box, "Price")  || pickInput(box, "price");
  const amountEl = pickInput(box, "Amount")|| pickInput(box, "amount");

  const price = priceEl && priceEl.value ? Number(priceEl.value) : undefined;
  const quantity = amountEl && amountEl.value ? Number(amountEl.value) : undefined;

  const symbol = getCurrentPair();
  const side = label === "buy" ? "BUY" : "SELL";

  const payload = { symbol, side, type: "LIMIT", price, quantity };

  try {
    if (!quantity || (payload.type === "LIMIT" && !price)) {
      alert("Please enter a valid Price and Amount.");
      return;
    }
    await api.post("/api/orders", payload);
    // optional: show a tiny success note
    console.log("Order OK:", payload);
  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.error || err.message);
  }
}

export function initOrderBridge() {
  document.addEventListener("click", handleClick);
  startSymbolObserver();
}

if (typeof window !== "undefined") {
  initOrderBridge();
}
