/* =========================================================
   EV Charge Simulator
   Lógica de cálculo + idioma (PT/EN) + moeda (€/£/$)
   ========================================================= */

// ---------- Dicionário de traduções ----------
const I18N = {
  pt: {
    lang: "pt",
    docLang: "pt",
    "hero-title": "Quanto tenho de carregar?",
    "hero-sub":
      "Indique a bateria e a carga atual para saber os <strong>kWh até 80%</strong> — o ideal para a longevidade da bateria.",
    "tab-timecost": "⏱ Tempo & Custo",
    "tab-conv": "🔄 kWh ↔ %",
    "batt.label": "Tamanho da bateria",
    "cur.label": "Carga atual",
    "pow.label": "Potência do carregador",
    "price.label": "Preço por kWh",
    "result.label": "kWh necessários",
    result_pct: "+{pct} % até {target}%",
    "legend.cur": "atual {pct}%",
    "legend.target": "meta {target}%",
    stat_time: "Tempo estimado",
    stat_cost: "Custo (~{p}/kWh)",
    "time.label": "Tempo (% tempo)",
    "target.label": "Objetivo",
    "eff.label": "Eficiência de carga",
    time_result: "Resultado",
    tc_kwh: "Energia necessária",
    tc_pct: "% a carregar",
    tc_time: "Tempo de carga",
    tc_cost: "Custo estimado",
    tc_tip: "Carregar rotineiramente a 80% prolonga a vida útil da bateria.",
    "conv.label": "% → kWh",
    "conv-label": "kWh ↔ %",
    kwh_to_pct: "{kwh} kWh → {pct} %",
    pct_to_kwh: "{pct} % → {kwh} kWh",
    conv_note: "Com bateria de {size} kWh.",
    conv_note_full: "Com bateria de {size} kWh, esse valor corresponde a {pct} % da bateria.",
    foot_note:
      "Simulador para fins estimativos. 100% <strong>gratuito</strong> · roda no seu navegador · nenhum dado é enviado.",
    kWh: "kWh",
    "%": "%",
  },
  en: {
    lang: "en",
    docLang: "en",
    "hero-title": "How much do I need to charge?",
    "hero-sub":
      "Enter your battery size and current level to get the <strong>kWh to 80%</strong> — ideal for battery longevity.",
    "tab-to80": "🔋 To 80%",
    "tab-timecost": "⏱ Time & Cost",
    "tab-conv": "🔄 kWh ↔ %",
    "batt.label": "Battery size",
    "cur.label": "Current level",
    "pow.label": "Charger power",
    "price.label": "Price per kWh",
    "result.label": "kWh required",
    result_pct: "up {pct}% to {target}%",
    "legend.cur": "now {pct}%",
    "legend.target": "target {target}%",
    stat_time: "Estimated time",
    stat_cost: "Cost (~{p}/kWh)",
    "time.label": "Time (% time)",
    "target.label": "Target",
    "eff.label": "Charging efficiency",
    time_result: "Result",
    tc_kwh: "Energy needed",
    tc_pct: "% to charge",
    tc_time: "Charging time",
    tc_cost: "Estimated cost",
    tc_tip: "Routinely charging to 80% extends your battery life.",
    "conv.label": "% → kWh",
    "conv-label": "kWh ↔ %",
    kwh_to_pct: "{kwh} kWh → {pct} %",
    pct_to_kwh: "{pct} % → {kwh} kWh",
    conv_note: "With a {size} kWh battery.",
    conv_note_full: "With a {size} kWh battery, that equals {pct}% of the battery.",
    foot_note:
      "Estimates only. 100% <strong>free</strong> · runs in your browser · no data is sent.",
    kWh: "kWh",
    "%": "%",
  },
};

// ---------- Configuração de moeda ----------
const CURRENCY = {
  EUR: { symbol: "€", locale: "de-DE", name: "Euro" },
  GBP: { symbol: "£", locale: "en-GB", name: "Pound" },
  USD: { symbol: "$", locale: "en-US", name: "Dollar" },
};

const $ = (id) => document.getElementById(id);

let lang = "pt";
let cur = "EUR";

// ---------- Utilidades de formatação ----------
function fmtKWh(v) {
  return v.toLocaleString(I18N[lang].lang === "pt" ? "pt-PT" : "en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}
function fmtInt(v) {
  return v.toLocaleString(I18N[lang].docLang === "pt" ? "pt-PT" : "en-US");
}
function fmtMoney(v) {
  return v.toLocaleString(CURRENCY[cur].locale, {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}
function fmtTime(minutes) {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${m} min`;
  if (rest === 0) return `${h} h`;
  return `${h}h ${rest}m`;
}
function t(key, vars) {
  let s = I18N[lang][key] ?? key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}

// ---------- Dados de estado ----------
const U = {
  batt80: 60, cur80: 30, target80: 80, pow80: 11, price80: 0.4,
  battTC: 60, curTC: 20, targetTC: 80, powTC: 11, effTC: 90, priceTC: 0.4,
  battC: 60, kwhC: 30, pctC: 50, convDir: "pct",
};

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $("panel-" + btn.dataset.tab).classList.add("active");
  });
});

// ---------- Idioma / Moeda ----------
document.getElementById("langSeg").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  lang = btn.dataset.lang;
  document.querySelectorAll("#langSeg .seg-btn").forEach((b) => b.classList.toggle("active", b === btn));
  document.documentElement.lang = I18N[lang].docLang;
  applyTranslations();
  computeAll();
});
document.getElementById("curSeg").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  cur = btn.dataset.cur;
  document.querySelectorAll("#curSeg .seg-btn").forEach((b) => b.classList.toggle("active", b === btn));
  computeAll();
});

// ---------- Traduções estáticas ----------
function applyTranslations() {
  document.getElementById("hero-title").textContent = t("hero-title");
  document.getElementById("hero-sub").innerHTML = t("hero-sub");
  $("tab-to80").textContent = t("tab-to80");
  $("tab-timecost").textContent = t("tab-timecost");
  $("tab-conv").textContent = t("tab-conv");
  // Rótulos com data-label reutilizados via data-k
  document.querySelectorAll("[data-k]").forEach((el) => {
    el.textContent = t(el.dataset.k);
  });
  $("conv_note").textContent = "";
}

// ---------- Ligações de sliders ----------
const bind = (id, cb) => {
  const el = $(id);
  const apply = () => cb(el);
  el.addEventListener("input", apply);
  return el;
};

// ---------- Bateria visual ----------
function updateBattBar(el, curPct, targetPct) {
  el.style.setProperty("--w", `${targetPct}%`);
  el.style.setProperty("--mask", `${curPct}%`);
}

// ---------- ABA 1: Até 80% ----------
function computeTo80() {
  const kWh = U.batt80;
  const curr = U.cur80;
  const power = U.pow80;
  const price = U.price80;
  const target = U.target80;

  const pctGain = Math.max(0, target - curr);
  const needed = Math.max(0, kWh * (target - curr) / 100);
  // tempo em horas = energia / potência
  const hours = needed / power;
  const cost = needed * price;

  $("to80_result").textContent = fmtKWh(needed);
  $("to80_pct").textContent = t("result_pct", { pct: fmtInt(pctGain), target: fmtInt(target) });
  $("to80_time").textContent = fmtTime(hours * 60);
  $("to80_cost").textContent = fmtMoney(cost);

  $("to80_bat").style.setProperty("--w", `${target}%`);
  $("to80_bat").style.setProperty("--mask", `${Math.min(curr, target)}%`);

  const legendLabels = document.querySelectorAll("#panel-to80 .legend span");
  legendLabels[0].innerHTML = `<i class="dot cur"></i>` + t("legend.cur", { pct: fmtInt(curr) });
  legendLabels[1].innerHTML = `<i class="dot target"></i>` + t("legend.target", { target: fmtInt(target) });

  // atualiza texto de custo
  const costLabel = document.getElementById("panel-to80").querySelector(".stat-l:last-child");
  if (costLabel) costLabel.textContent = t("stat_cost", { p: fmtMoney(price) });
}

// ---------- ABA 2: Tempo & Custo ----------
function computeTimeCost() {
  const kWh = U.battTC;
  const curr = U.curTC;
  const target = U.targetTC;
  const power = U.powTC;
  const eff = U.effTC / 100;
  const price = U.priceTC;

  const pctNeed = target - curr;
  const energy = kWh * pctNeed / 100;
  // energia retirada da rede (considera eficiência)
  const energyFromGrid = energy / eff;
  const hours = energyFromGrid / power;
  const cost = energyFromGrid * price;

  $("tc_kwh").textContent = fmtKWh(energy) + " kWh";
  $("tc_pct").textContent = fmtInt(pctNeed) + " %";
  $("tc_time").textContent = fmtTime(hours * 60);
  $("tc_cost").textContent = fmtMoney(cost);
  $("tc_tip").textContent = t("tc_tip");
}

// ---------- ABA 3: Conversões ----------
function round1(v) { return Math.round(v * 10) / 10; }

function computeConv() {
  const kWh = U.battC;
  $("conv-a-label").textContent = t("conv-label");
  $("conv_a").textContent = fmtKWh(U.kwhC);
  $("conv_b").textContent = fmtKWh(U.pctC);
  $("conv_bar").style.width = Math.max(0, Math.min(100, U.pctC)) + "%";
  $("conv_note").textContent = t("conv_note", { size: fmtKWh(kWh) });
}

function recomputeConvFromSource() {
  // recalcula o valor "passivo" a partir do campo que foi editado por último
  if (U.convDir === "pct") {
    U.kwhC = round1((U.pctC / 100) * U.battC);
    $("kwhC").value = U.kwhC;
  } else {
    U.pctC = round1((U.kwhC / U.battC) * 100);
    if (U.pctC > 100) U.pctC = 100;
    if (U.pctC < 0) U.pctC = 0;
    $("pctC").value = U.pctC;
  }
}

function computeAll() {
  computeTo80();
  computeTimeCost();
  computeConv();
}

// ---------- Ligar sliders ----------
// Aba 1
bind("batt80", (el) => { U.batt80 = +el.value; $("batt80val").textContent = fmtKWh(+el.value) + " kWh"; computeTo80(); });
bind("cur80", (el) => {
  const v = +el.value;
  U.cur80 = v;
  $("cur80val").textContent = fmtInt(v) + " %";
  computeTo80();
});
function setTarget80(v) {
  U.target80 = v;
  $("target80").value = v;
  $("target80val").textContent = fmtInt(v) + " %";
  document.querySelectorAll("#panel-to80 .targetchip").forEach((c) => c.classList.toggle("active", Math.abs(+c.dataset.t - v) < 1));
  computeTo80();
}
bind("target80", (el) => setTarget80(+el.value));
document.querySelectorAll("#panel-to80 .targetchip").forEach((c) => c.addEventListener("click", () => setTarget80(+c.dataset.t)));
function setPow80(v) {
  // aceita vírgula ou ponto como separador decimal (ex: "4,5" ou "4.5")
  const normalized = String(v).trim().replace(/,/g, ".");
  const val = Math.max(0, parseFloat(normalized) || 0);
  U.pow80 = val;
  $("pow80").value = Math.min(150, Math.max(1, val));
  $("pow80num").value = round1(val);
  document.querySelectorAll("#panel-to80 .chip[data-c]").forEach((c) => c.classList.toggle("active", Math.abs(+c.dataset.c - val) < 0.05));
  computeTo80();
}
bind("pow80", (el) => setPow80(+el.value));
bind("pow80num", (el) => setPow80(el.value));
document.querySelectorAll("#panel-to80 .chip[data-c]").forEach((c) => c.addEventListener("click", () => setPow80(c.dataset.c)));
bind("price80", (el) => { U.price80 = +el.value; $("price80val").textContent = fmtMoney(+el.value); computeTo80(); });

// Aba 2
bind("battTC", (el) => { U.battTC = +el.value; $("battTCval").textContent = fmtKWh(+el.value) + " kWh"; computeTimeCost(); });
bind("curTC", (el) => { U.curTC = +el.value; $("curTCval").textContent = fmtInt(+el.value) + " %"; computeTimeCost(); });
bind("targetTC", (el) => { U.targetTC = +el.value; $("targetTCval").textContent = fmtInt(+el.value) + " %"; computeTimeCost(); });
bind("powTC", (el) => { U.powTC = +el.value; $("powTCval").textContent = fmtKWh(+el.value) + " kW"; computeTimeCost(); });
bind("effTC", (el) => { U.effTC = +el.value; $("effTCval").textContent = fmtInt(+el.value) + " %"; computeTimeCost(); });
bind("priceTC", (el) => { U.priceTC = +el.value; $("priceTCval").textContent = fmtMoney(+el.value); computeTimeCost(); });

// Aba 3
bind("battC", (el) => {
  U.battC = +el.value;
  $("battCval").textContent = fmtKWh(U.battC) + " kWh";
  recomputeConvFromSource();
  computeConv();
});
$("kwhC").addEventListener("input", () => {
  U.convDir = "kwh";
  U.kwhC = Math.max(0, +$("kwhC").value || 0);
  recomputeConvFromSource();
  computeConv();
});
$("pctC").addEventListener("input", () => {
  U.convDir = "pct";
  U.pctC = Math.max(0, Math.min(100, +$("pctC").value || 0));
  recomputeConvFromSource();
  computeConv();
});
$("swapBtn").addEventListener("click", () => {
  // troca a direção: editar passa a ser o outro campo
  U.convDir = U.convDir === "pct" ? "kwh" : "pct";
  recomputeConvFromSource();
  computeConv();
});

// ---------- Barra da bateria (desktop fallback) ----------
function initLabels() {
  // Adiciona data-k aos rótulos de campo para tradução fácil
  const map = [
    ["#panel-to80 label[for=batt80]", "batt.label"],
    ["#panel-to80 label[for=cur80]", "cur.label"],
    ["#panel-to80 label[for=target80]", "target.label"],
    ["#panel-to80 label[for=pow80]", "pow.label"],
    ["#panel-to80 label[for=price80]", "price.label"],
    ["#panel-timecost label[for=battTC]", "batt.label"],
    ["#panel-timecost label[for=curTC]", "cur.label"],
    ["#panel-timecost label[for=targetTC]", "target.label"],
    ["#panel-timecost label[for=powTC]", "pow.label"],
    ["#panel-timecost label[for=effTC]", "eff.label"],
    ["#panel-timecost label[for=priceTC]", "price.label"],
  ];
  for (const [sel, key] of map) document.querySelector(sel)?.setAttribute("data-k", key);
}

initLabels();
applyTranslations();
computeAll();