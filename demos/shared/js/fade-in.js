/* Module: fade-in. Reveals [data-reveal] elements as they enter the viewport. */
(function () {
  "use strict";

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;

    if (reduced() || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (node) {
        node.classList.add("is-revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    Array.prototype.forEach.call(nodes, function (node) {
      observer.observe(node);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
