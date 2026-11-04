/* Module: counter. Animates [data-counter] from zero to data-to when visible. */
(function () {
  "use strict";

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function format(value, decimals) {
    return value.toLocaleString("en-GB", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function paint(el, value) {
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    el.textContent = prefix + format(value, decimals) + suffix;
  }

  function animate(el) {
    var target = parseFloat(el.getAttribute("data-to"));
    if (isNaN(target)) return;
    if (reduced()) {
      paint(el, target);
      return;
    }

    var duration = parseInt(el.getAttribute("data-duration") || "1200", 10);
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var progress = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      paint(el, target * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function init() {
    var nodes = document.querySelectorAll("[data-counter]");
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
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
