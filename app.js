(function () {
  "use strict";

  const L = window.CarrowmontLocale;
  if (!L) return;

  const $ = id => document.getElementById(id);
  const els = {
    localeMenu: $("localeMenu"), localeSummary: $("localeSummary"), localeCurrent: $("localeCurrent"), regionSelect: $("regionSelect"), currencySelect: $("currencySelect"), localeDoneBtn: $("localeDoneBtn"),
    currencyPrefix: $("currencyPrefix"), amountInput: $("amountInput"), amountType: $("amountType"), yearsInput: $("yearsInput"), inflationInput: $("inflationInput"),
    futureLabel: $("futureLabel"), futureValue: $("futureValue"), futureSub: $("futureSub"), increasePct: $("increasePct"), multiplier: $("multiplier"), sameNominalPower: $("sameNominalPower"), sameNominalToday: $("sameNominalToday"), purchasingPowerLoss: $("purchasingPowerLoss"),
    insightIncrease: $("insightIncrease"), insightIncreaseText: $("insightIncreaseText"), insightPower: $("insightPower"), insightDouble: $("insightDouble"), insightExtra: $("insightExtra"), insightExtraText: $("insightExtraText"),
    heroExampleToday: $("heroExampleToday"), heroExampleFuture: $("heroExampleFuture"),
    legendLow: $("legendLow"), legendBase: $("legendBase"), legendHigh: $("legendHigh"), chart: $("inflationChart"), chartWrap: $("chartWrap"), chartTooltip: $("chartTooltip"),
    lowScenarioRate: $("lowScenarioRate"), lowScenarioValue: $("lowScenarioValue"), lowScenarioText: $("lowScenarioText"), baseScenarioRate: $("baseScenarioRate"), baseScenarioValue: $("baseScenarioValue"), highScenarioRate: $("highScenarioRate"), highScenarioValue: $("highScenarioValue"), highScenarioText: $("highScenarioText"),
    milestoneBody: $("milestoneBody"), copySummaryBtn: $("copySummaryBtn"), printReportBtn: $("printReportBtn"), printReport: $("printReport"), resetBtn: $("resetBtn")
  };

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function num(el, fallback = 0) {
    const raw = String(el.value ?? "").trim();
    if (raw === "") return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  function futureValue(amount, ratePct, years) { return amount * Math.pow(1 + ratePct / 100, years); }
  function presentEquivalent(amount, ratePct, years) { return amount / Math.pow(1 + ratePct / 100, years); }
  function pct(value, digits = 0) { return `${Number(value).toFixed(digits)}%`; }
  function amountSuffix() { const t = els.amountType.value; return t === "monthly" ? "/mo" : t === "annual" ? "/yr" : ""; }
  function amountTypeLabel() { const t = els.amountType.value; return t === "monthly" ? "monthly spending" : t === "annual" ? "annual spending" : "amount"; }
  function fm(v) { return L.formatMoney(v); }
  function fmc(v) { return L.formatCompactMoney(v); }

  function populateLocaleControls() {
    const regionEntries = Object.entries(L.regions).sort(([codeA, a], [codeB, b]) => {
      if (codeA === "OTHER") return 1;
      if (codeB === "OTHER") return -1;
      return a.label.localeCompare(b.label, "en", { sensitivity: "base" });
    });
    els.regionSelect.innerHTML = regionEntries.map(([code, p]) => `<option value="${code}">${p.label}</option>`).join("");
    els.currencySelect.innerHTML = Object.entries(L.currencies).map(([code, c]) => `<option value="${code}">${code} — ${c.label}</option>`).join("");
    syncLocaleUI();
  }

  function syncLocaleUI() {
    const region = L.getProfile();
    const currency = L.getCurrency();
    els.regionSelect.value = L.getRegion();
    els.currencySelect.value = currency;
    if (els.localeCurrent) els.localeCurrent.textContent = `${region.label} · ${currency}`; else els.localeSummary.textContent = `${region.label} · ${currency}`;
    els.currencyPrefix.textContent = L.currencySymbol(currency);
    els.heroExampleToday.textContent = fm(100000);
    els.heroExampleFuture.textContent = fm(futureValue(100000, 5, 20));
  }

  function getState() {
    return {
      amount: clamp(num(els.amountInput, 100000), 0, 1e15),
      years: clamp(Math.round(num(els.yearsInput, 20)), 1, 60),
      rate: clamp(num(els.inflationInput, 5), 0, 30)
    };
  }

  function compute() {
    const s = getState();
    const factor = Math.pow(1 + s.rate / 100, s.years);
    const future = s.amount * factor;
    const sameNominalToday = presentEquivalent(s.amount, s.rate, s.years);
    const increase = (factor - 1) * 100;
    const remaining = factor === 0 ? 100 : (1 / factor) * 100;
    const loss = 100 - remaining;
    const extra = future - s.amount;
    const suffix = amountSuffix();
    const type = amountTypeLabel();

    els.futureLabel.textContent = `To buy what ${fm(s.amount)}${suffix} buys today, you may need`;
    els.futureValue.textContent = `${fm(future)}${suffix}`;
    els.futureSub.textContent = `after ${s.years} years at ${s.rate.toFixed(1)}% annual inflation`;
    els.increasePct.textContent = pct(increase, increase < 10 ? 1 : 0);
    els.multiplier.textContent = `${factor.toFixed(2)}×`;
    els.sameNominalPower.textContent = pct(remaining, 0);
    els.sameNominalToday.textContent = `${fm(sameNominalToday)}${suffix}`;
    els.purchasingPowerLoss.textContent = `About ${Math.round(loss)}% less purchasing power`;

    els.insightIncrease.textContent = `+${pct(increase, increase < 10 ? 1 : 0)}`;
    els.insightIncreaseText.textContent = `for the same ${type}`;
    els.insightPower.textContent = pct(remaining, 0);
    els.insightDouble.textContent = s.rate > 0 ? `${(Math.log(2) / Math.log(1 + s.rate / 100)).toFixed(1)} years` : "No doubling";
    els.insightExtra.textContent = `${fm(extra)}${suffix}`;
    els.insightExtraText.textContent = `additional ${type} after ${s.years} years`;

    const lowRate = Math.max(0, s.rate - 2);
    const highRate = s.rate + 2;
    const lowFuture = futureValue(s.amount, lowRate, s.years);
    const highFuture = futureValue(s.amount, highRate, s.years);
    els.legendLow.textContent = `Lower · ${lowRate.toFixed(1)}%`;
    els.legendBase.textContent = `Your assumption · ${s.rate.toFixed(1)}%`;
    els.legendHigh.textContent = `Higher · ${highRate.toFixed(1)}%`;
    els.lowScenarioRate.textContent = `${lowRate.toFixed(1)}% inflation`;
    els.lowScenarioValue.textContent = `${fmc(lowFuture)}${suffix}`;
    els.lowScenarioText.textContent = `${fm(lowFuture)}${suffix} after ${s.years} years`;
    els.baseScenarioRate.textContent = `${s.rate.toFixed(1)}% inflation`;
    els.baseScenarioValue.textContent = `${fmc(future)}${suffix}`;
    els.highScenarioRate.textContent = `${highRate.toFixed(1)}% inflation`;
    els.highScenarioValue.textContent = `${fmc(highFuture)}${suffix}`;
    els.highScenarioText.textContent = `${fm(highFuture)}${suffix} after ${s.years} years`;

    renderMilestones(s);
    renderChart(s, lowRate, highRate);
    buildPrintReport(s, future, increase, remaining, sameNominalToday, lowRate, lowFuture, highRate, highFuture);
  }

  function milestoneYears(maxYears) {
    const set = new Set([0, maxYears]);
    for (let y = 5; y < maxYears; y += 5) set.add(y);
    if (maxYears < 5) for (let y = 1; y < maxYears; y++) set.add(y);
    return [...set].sort((a,b) => a-b);
  }

  function renderMilestones(s) {
    const suffix = amountSuffix();
    els.milestoneBody.innerHTML = milestoneYears(s.years).map(y => {
      const fv = futureValue(s.amount, s.rate, y);
      const factor = Math.pow(1 + s.rate / 100, y);
      const inc = (factor - 1) * 100;
      const power = 100 / factor;
      return `<tr><td><strong>${y === 0 ? "Today" : `Year ${y}`}</strong></td><td>${fm(fv)}${suffix}</td><td>${y === 0 ? "—" : `+${Math.round(inc)}%`}</td><td>${Math.round(power)}%</td></tr>`;
    }).join("");
  }

  function niceMax(value) {
    if (value <= 0) return 1;
    const power = Math.pow(10, Math.floor(Math.log10(value)));
    const n = value / power;
    let nice;
    if (n <= 1) nice = 1;
    else if (n <= 2) nice = 2;
    else if (n <= 2.5) nice = 2.5;
    else if (n <= 5) nice = 5;
    else nice = 10;
    return nice * power;
  }

  function renderChart(s, lowRate, highRate) {
    const svg = els.chart;
    const W = 1000, H = 350, left = 92, right = 26, top = 76, bottom = 52;
    const iw = W - left - right, ih = H - top - bottom;
    const points = [];
    const steps = Math.max(20, s.years * 2);
    for (let i = 0; i <= steps; i++) {
      const year = s.years * i / steps;
      points.push({
        year,
        low: futureValue(s.amount, lowRate, year),
        base: futureValue(s.amount, s.rate, year),
        high: futureValue(s.amount, highRate, year)
      });
    }
    const maxVal = niceMax(Math.max(...points.map(p => p.high)) * 1.05);
    const x = y => left + (y / s.years) * iw;
    const yy = v => top + ih - (v / maxVal) * ih;
    const path = key => points.map((p,i) => `${i ? "L" : "M"}${x(p.year).toFixed(2)},${yy(p[key]).toFixed(2)}`).join(" ");
    const ticks = 4;
    let html = "";
    for (let i = 0; i <= ticks; i++) {
      const v = maxVal * i / ticks;
      const py = yy(v);
      html += `<line class="chart-gridline" x1="${left}" y1="${py}" x2="${W-right}" y2="${py}"/><text class="chart-axis-label" x="${left-12}" y="${py+4}" text-anchor="end">${fmc(v)}</text>`;
    }
    const xTicks = [0, Math.round(s.years/2), s.years];
    xTicks.forEach(v => { html += `<text class="chart-axis-label" x="${x(v)}" y="${H-18}" text-anchor="middle">${v === 0 ? "Today" : `Year ${v}`}</text>`; });
    const finalValues=[
      {label:`Lower (${lowRate.toFixed(1)}%)`,value:futureValue(s.amount,lowRate,s.years),color:'#91a3b5'},
      {label:`Your assumption (${s.rate.toFixed(1)}%)`,value:futureValue(s.amount,s.rate,s.years),color:'#0e827a'},
      {label:`Higher (${highRate.toFixed(1)}%)`,value:futureValue(s.amount,highRate,s.years),color:'#173d5c'}
    ];
    const bw=272,bh=48,by=10;
    finalValues.forEach((item,i)=>{
      const bx=i===0?left:(i===1?left+(iw-bw)/2:W-right-bw);
      html+=`<g class="chart-static-value"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="#fff" stroke="#c9d9e2"/><line x1="${bx+12}" x2="${bx+34}" y1="${by+17}" y2="${by+17}" stroke="${item.color}" stroke-width="4"/><text x="${bx+42}" y="${by+20}" font-size="11" font-weight="800" fill="#102945">${item.label}</text><text x="${bx+12}" y="${by+39}" font-size="10.5" font-weight="700" fill="#405b75">Year ${s.years}: ${fmc(item.value)}</text></g>`;
    });
    html += `<path class="chart-line-low" d="${path("low")}"/><path class="chart-line-base" d="${path("base")}"/><path class="chart-line-high" d="${path("high")}"/>`;
    const midYear=Math.round(s.years/2),midValue=futureValue(s.amount,s.rate,midYear),mx=x(midYear),my=yy(midValue);
    html += `<circle cx="${mx}" cy="${my}" r="5" fill="#0e827a" stroke="#fff" stroke-width="2"/><rect x="${mx-57}" y="${Math.max(top+5,my-31)}" width="114" height="22" rx="7" fill="#fff" stroke="#b8d9d5"/><text x="${mx}" y="${Math.max(top+20,my-16)}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#08756d">Year ${midYear}: ${fmc(midValue)}</text>`;
    html += `<g id="hoverLayer"><line id="hoverGuide" class="chart-guide" x1="${left}" y1="${top}" x2="${left}" y2="${top+ih}" visibility="hidden"/><circle id="hoverLow" class="chart-point" r="5" fill="#91a3b5" visibility="hidden"/><circle id="hoverBase" class="chart-point" r="5.5" fill="#0e827a" visibility="hidden"/><circle id="hoverHigh" class="chart-point" r="5" fill="#173d5c" visibility="hidden"/></g>`;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = html;

    const guide = svg.querySelector("#hoverGuide"), pLow = svg.querySelector("#hoverLow"), pBase = svg.querySelector("#hoverBase"), pHigh = svg.querySelector("#hoverHigh");
    function move(ev) {
      const rect = svg.getBoundingClientRect();
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const px = clamp(((clientX - rect.left) / rect.width) * W, left, W-right);
      const year = clamp(((px - left) / iw) * s.years, 0, s.years);
      const low = futureValue(s.amount, lowRate, year), base = futureValue(s.amount, s.rate, year), high = futureValue(s.amount, highRate, year);
      guide.setAttribute("x1", x(year)); guide.setAttribute("x2", x(year)); guide.setAttribute("visibility","visible");
      [[pLow,low],[pBase,base],[pHigh,high]].forEach(([p,v]) => { p.setAttribute("cx",x(year)); p.setAttribute("cy",yy(v)); p.setAttribute("visibility","visible"); });
      els.chartTooltip.innerHTML = `<strong>${year < .05 ? "Today" : `Year ${year.toFixed(year < 10 ? 1 : 0)}`}</strong><div>Lower (${lowRate.toFixed(1)}%): ${fm(low)}${amountSuffix()}</div><div>Your assumption (${s.rate.toFixed(1)}%): ${fm(base)}${amountSuffix()}</div><div>Higher (${highRate.toFixed(1)}%): ${fm(high)}${amountSuffix()}</div>`;
      const wrapperRect = els.chartWrap.getBoundingClientRect();
      const relativeX = (x(year) / W) * wrapperRect.width;
      const relativeY = (yy(base) / H) * wrapperRect.height;
      els.chartTooltip.style.left = `${clamp(relativeX, 115, wrapperRect.width-115)}px`;
      els.chartTooltip.style.top = `${Math.max(90, relativeY)}px`;
      els.chartTooltip.classList.remove("hidden");
    }
    function leave() { [guide,pLow,pBase,pHigh].forEach(e => e && e.setAttribute("visibility","hidden")); els.chartTooltip.classList.add("hidden"); }
    svg.onmousemove = move; svg.onmouseleave = leave; svg.ontouchmove = move; svg.ontouchend = leave;
  }

  function resetToDefaults() {
    els.amountInput.value = 100000;
    els.amountType.value = 'monthly';
    els.yearsInput.value = 20;
    els.inflationInput.value = 5;
    compute();
  }

  async function copySummary() {
    const s = getState();
    const factor = Math.pow(1 + s.rate/100, s.years);
    const future = s.amount * factor;
    const remaining = 100/factor;
    const text = [
      "CARROWMONT INFLATION CALCULATOR SUMMARY",
      "",
      `Country / region: ${L.getProfile().label}`,
      `Currency: ${L.getCurrency()}`,
      `Amount today: ${fm(s.amount)}${amountSuffix()}`,
      `Time horizon: ${s.years} years`,
      `Inflation assumption: ${s.rate.toFixed(1)}% per year`,
      "",
      `Future equivalent: ${fm(future)}${amountSuffix()}`,
      `Total price increase: ${Math.round((factor-1)*100)}%`,
      `Same nominal amount's purchasing power remaining: ${Math.round(remaining)}%`,
      "",
      "Educational illustration only. Inflation is an assumption entered by the user and actual outcomes may differ.",
      "carrowmont.com"
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      const old = els.copySummaryBtn.textContent;
      els.copySummaryBtn.textContent = "Copied";
      setTimeout(() => els.copySummaryBtn.textContent = old, 1500);
    } catch (_) {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
  }

  function buildPrintReport(s, future, increase, remaining, sameNominalToday, lowRate, lowFuture, highRate, highFuture) {
    const suffix = amountSuffix();
    const milestones = milestoneYears(s.years).map(y => {
      const fv = futureValue(s.amount, s.rate, y); const factor = Math.pow(1+s.rate/100,y); return `<tr><td>${y===0?"Today":`Year ${y}`}</td><td>${fm(fv)}${suffix}</td><td>${y===0?"—":`+${Math.round((factor-1)*100)}%`}</td><td>${Math.round(100/factor)}%</td></tr>`;
    }).join("");
    els.printReport.innerHTML = `<div class="report-brand">CARROWMONT</div><h1>Inflation Planning Report</h1><div class="report-meta">Generated ${new Date().toLocaleDateString(L.getLocale())} · ${L.getProfile().label} · ${L.getCurrency()}</div><div class="report-hero"><span>Future equivalent of ${fm(s.amount)}${suffix}</span><strong>${fm(future)}${suffix}</strong><span>after ${s.years} years at ${s.rate.toFixed(1)}% annual inflation</span></div><h2>Summary</h2><table><tbody><tr><td>Amount today</td><td>${fm(s.amount)}${suffix}</td></tr><tr><td>Inflation assumption</td><td>${s.rate.toFixed(1)}%</td></tr><tr><td>Total price increase</td><td>${Math.round(increase)}%</td></tr><tr><td>Same nominal amount's purchasing power remaining</td><td>${Math.round(remaining)}%</td></tr><tr><td>Today's-equivalent purchasing power of the same nominal amount</td><td>${fm(sameNominalToday)}${suffix}</td></tr></tbody></table><h2>Scenario comparison</h2><table><thead><tr><th>Scenario</th><th>Inflation</th><th>Future equivalent</th></tr></thead><tbody><tr><td>Lower</td><td>${lowRate.toFixed(1)}%</td><td>${fm(lowFuture)}${suffix}</td></tr><tr><td>Your assumption</td><td>${s.rate.toFixed(1)}%</td><td>${fm(future)}${suffix}</td></tr><tr><td>Higher</td><td>${highRate.toFixed(1)}%</td><td>${fm(highFuture)}${suffix}</td></tr></tbody></table><div class="page-break"></div><h2>Future cost checkpoints</h2><table><thead><tr><th>Year</th><th>Future cost</th><th>Increase</th><th>Purchasing power remaining</th></tr></thead><tbody>${milestones}</tbody></table><h2>Methodology</h2><p>Future cost = amount today × (1 + inflation rate)<sup>years</sup>. Country selection controls formatting and default currency only. The calculator does not perform foreign-exchange conversion or provide a forecast of future inflation.</p><div class="report-note"><strong>Important:</strong> This report is an educational illustration based on the assumptions entered. Inflation varies over time and between households, goods and services. This is not individualized financial, tax, legal or investment advice.</div>`;
  }

  async function generateInflationReport() {
    const status=document.getElementById('reportDownloadStatus');
    if(!window.CarrowmontPdfExport || !window.CarrowmontInflationPdfRenderer){
      if(status)status.textContent='The report could not be generated. Please refresh the page and try again.';
      return;
    }
    const s=getState(),factor=Math.pow(1+s.rate/100,s.years),future=s.amount*factor,sameNominalToday=presentEquivalent(s.amount,s.rate,s.years),increase=(factor-1)*100,remaining=100/factor;
    const lowRate=Math.max(0,s.rate-2),highRate=s.rate+2,lowFuture=futureValue(s.amount,lowRate,s.years),highFuture=futureValue(s.amount,highRate,s.years),suffix=amountSuffix();
    const milestones=milestoneYears(s.years).map(y=>{const f=futureValue(s.amount,s.rate,y),fac=Math.pow(1+s.rate/100,y);return{label:y===0?'Today':`Year ${y}`,future:f,increase:y===0?'—':`+${Math.round((fac-1)*100)}%`,power:`${Math.round(100/fac)}%`};});
    const model={state:s,future,sameNominalToday,increase,remaining,lowRate,highRate,lowFuture,highFuture,suffix,milestones};
    els.printReportBtn.disabled=true;els.printReportBtn.setAttribute('aria-busy','true');
    if(status)status.textContent='Preparing your report...';
    try{
      const canvases=await window.CarrowmontInflationPdfRenderer.render(model),d=new Date(),yyyy=d.getFullYear(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
      await window.CarrowmontPdfExport.downloadCanvases(canvases,{filename:`inflation-planning-report-${yyyy}-${mm}-${dd}.pdf`,quality:.95});
      if(status)status.textContent='Report has been downloaded.';
    }catch(err){
      console.error('Inflation report PDF generation failed',err);
      if(status)status.textContent='The report could not be generated. Please refresh the page and try again.';
    }finally{
      els.printReportBtn.disabled=false;els.printReportBtn.removeAttribute('aria-busy');
    }
  }

  els.regionSelect.addEventListener("change", e => L.setRegion(e.target.value, { syncCurrency: true }));
  els.currencySelect.addEventListener("change", e => L.setCurrency(e.target.value));

  function closeLocaleMenu() {
    if (els.localeMenu) els.localeMenu.open = false;
  }
  if (els.localeDoneBtn) els.localeDoneBtn.addEventListener("click", closeLocaleMenu);

  document.addEventListener("pointerdown", event => {
    if (els.localeMenu && els.localeMenu.open && !els.localeMenu.contains(event.target)) closeLocaleMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && els.localeMenu && els.localeMenu.open) {
      closeLocaleMenu();
      els.localeSummary?.focus();
    }
  });
  window.addEventListener("carrowmont:localechange", () => { syncLocaleUI(); compute(); });
  [els.amountInput, els.amountType, els.yearsInput, els.inflationInput].forEach(el => el.addEventListener("input", compute));

  // Do not rewrite number fields while the user is typing. In particular, keeping a transient value
  // such as "5." intact allows the next keystroke to become "5.5" instead of being forced back to "5".
  function normalizeNumericInputs() {
    const s = getState();
    if (String(els.amountInput.value).trim() === "") els.amountInput.value = s.amount;
    els.yearsInput.value = s.years;
    els.inflationInput.value = Number(s.rate.toFixed(2)).toString();
    compute();
  }
  [els.yearsInput, els.inflationInput].forEach(el => el.addEventListener("change", normalizeNumericInputs));

  els.copySummaryBtn.addEventListener("click", copySummary);
  els.printReportBtn.addEventListener("click", generateInflationReport);
  if (els.resetBtn) els.resetBtn.addEventListener("click", resetToDefaults);

  populateLocaleControls();
  compute();
})();
