(function () {
  "use strict";

  const STORAGE_REGION = "carrowmont_region_v1";
  const STORAGE_CURRENCY = "carrowmont_currency_v1";

  const regions = {
    IN: { label: "India", locale: "en-IN", currency: "INR" },
    US: { label: "United States", locale: "en-US", currency: "USD" },
    CA: { label: "Canada", locale: "en-CA", currency: "CAD" },
    GB: { label: "United Kingdom", locale: "en-GB", currency: "GBP" },
    AU: { label: "Australia", locale: "en-AU", currency: "AUD" },
    NZ: { label: "New Zealand", locale: "en-NZ", currency: "NZD" },
    OTHER: { label: "Other / International", locale: "en-US", currency: "USD" }
  };

  const currencies = {
    INR: { label: "Indian Rupee", symbol: "₹" },
    USD: { label: "US Dollar", symbol: "$" },
    CAD: { label: "Canadian Dollar", symbol: "C$" },
    GBP: { label: "British Pound", symbol: "£" },
    AUD: { label: "Australian Dollar", symbol: "A$" },
    NZD: { label: "New Zealand Dollar", symbol: "NZ$" },
    EUR: { label: "Euro", symbol: "€" },
    SGD: { label: "Singapore Dollar", symbol: "S$" },
    AED: { label: "UAE Dirham", symbol: "AED" }
  };

  function detectRegion() {
    const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en-US"])
      .map(String);
    for (const lang of langs) {
      const upper = lang.toUpperCase();
      if (upper.endsWith("-IN")) return "IN";
      if (upper.endsWith("-US")) return "US";
      if (upper.endsWith("-CA")) return "CA";
      if (upper.endsWith("-GB") || upper.endsWith("-UK")) return "GB";
      if (upper.endsWith("-AU")) return "AU";
      if (upper.endsWith("-NZ")) return "NZ";
    }
    return "OTHER";
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  let regionCode = safeGet(STORAGE_REGION);
  if (!regions[regionCode]) regionCode = detectRegion();

  let currencyCode = safeGet(STORAGE_CURRENCY);
  if (!currencies[currencyCode]) currencyCode = regions[regionCode].currency;

  function getRegion() { return regionCode; }
  function getCurrency() { return currencyCode; }
  function getProfile() { return regions[regionCode] || regions.OTHER; }
  function getLocale() { return getProfile().locale; }

  function setRegion(code, opts = {}) {
    if (!regions[code]) return;
    regionCode = code;
    safeSet(STORAGE_REGION, regionCode);
    if (opts.syncCurrency !== false) {
      currencyCode = regions[code].currency;
      safeSet(STORAGE_CURRENCY, currencyCode);
    }
    emitChange();
  }

  function setCurrency(code) {
    if (!currencies[code]) return;
    currencyCode = code;
    safeSet(STORAGE_CURRENCY, currencyCode);
    emitChange();
  }

  function emitChange() {
    window.dispatchEvent(new CustomEvent("carrowmont:localechange", {
      detail: { region: regionCode, currency: currencyCode }
    }));
  }

  function formatMoney(value, options = {}) {
    const n = Number(value) || 0;
    const currency = options.currency || currencyCode;
    const locale = options.locale || getLocale();
    const maximumFractionDigits = options.maximumFractionDigits ?? 0;
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits,
        minimumFractionDigits: options.minimumFractionDigits ?? 0
      }).format(n);
    } catch (_) {
      return `${currencies[currency]?.symbol || currency} ${Math.round(n).toLocaleString(locale)}`;
    }
  }

  function formatCompactMoney(value, options = {}) {
    const n = Number(value) || 0;
    const currency = options.currency || currencyCode;
    const locale = options.locale || getLocale();
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: options.maximumFractionDigits ?? 2
      }).format(n);
    } catch (_) {
      return formatMoney(n, { currency, locale });
    }
  }

  function formatNumber(value, options = {}) {
    const n = Number(value) || 0;
    return new Intl.NumberFormat(options.locale || getLocale(), {
      maximumFractionDigits: options.maximumFractionDigits ?? 0
    }).format(n);
  }

  function currencySymbol(code = currencyCode) {
    return currencies[code]?.symbol || code;
  }

  window.CarrowmontLocale = {
    regions,
    currencies,
    getRegion,
    getCurrency,
    getProfile,
    getLocale,
    setRegion,
    setCurrency,
    formatMoney,
    formatCompactMoney,
    formatNumber,
    currencySymbol
  };
})();
