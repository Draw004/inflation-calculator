(function () {
  "use strict";
  document.querySelectorAll("[data-current-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Analytics is handled only by analytics.js so consent and privacy rules
  // cannot be bypassed by a repository-specific legacy loader.
})();
