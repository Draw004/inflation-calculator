(function () {
  "use strict";
  document.querySelectorAll("[data-current-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const config = window.CARROWMONT_INFLATION_CONFIG || {};
  if (config.GA_MEASUREMENT_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.GA_MEASUREMENT_ID)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", config.GA_MEASUREMENT_ID);
  }
})();
