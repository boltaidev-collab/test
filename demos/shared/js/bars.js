/* Module: horizontal bar chart. Rows grow when the chart enters view. */
(function (global) {
  "use strict";

  function reduced() {
    return global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function paint(root) {
    var rows = root.querySelectorAll("[data-bar]");
    var max = 0;
    Array.prototype.forEach.call(rows, function (row) {
      if (row.hidden) return;
      var value = parseFloat(row.getAttribute("data-value"));
      if (value > max) max = value;
    });
    var cap = parseFloat(root.getAttribute("data-max"));
    if (!cap || cap < max) cap = max * 1.12 || 1;

    Array.prototype.forEach.call(rows, function (row, index) {
      var fill = row.querySelector(".hbar-fill");
      if (!fill || row.hidden) return;
      var value = parseFloat(row.getAttribute("data-value")) || 0;
      var pct = Math.max(0, Math.min(100, (value / cap) * 100));
      fill.style.transition = "none";
      fill.style.width = "0%";
      if (reduced()) {
        fill.style.width = pct + "%";
        return;
      }
      global.requestAnimationFrame(function () {
        fill.style.transition =
          "width 0.9s cubic-bezier(0.22, 1, 0.36, 1) " + index * 70 + "ms";
        fill.style.width = pct + "%";
      });
    });
  }

  function bindTip(root) {
    var tip = root.querySelector("[data-chart-tip]");
    if (!tip) return;
    function show(row) {
      tip.hidden = false;
      tip.replaceChildren();
      var title = document.createElement("strong");
      title.textContent = row.getAttribute("data-label") || "";
      var value = document.createElement("b");
      value.textContent = row.getAttribute("data-display") || "";
      tip.append(title, value);
      var parent = root.getBoundingClientRect();
      var rect = row.getBoundingClientRect();
      tip.style.left = Math.max(8, rect.left - parent.left + 16) + "px";
      tip.style.top = Math.max(4, rect.top - parent.top - 6) + "px";
    }
    function hide() {
      tip.hidden = true;
    }
    Array.prototype.forEach.call(root.querySelectorAll("[data-bar]"), function (row) {
      row.tabIndex = 0;
      row.addEventListener("mouseenter", function () { show(row); });
      row.addEventListener("focus", function () { show(row); });
      row.addEventListener("mouseleave", hide);
      row.addEventListener("blur", hide);
    });
  }

  function mount(root) {
    bindTip(root);
    function run() { paint(root); }
    if (reduced() || !("IntersectionObserver" in global)) {
      run();
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run();
          observer.disconnect();
        });
      }, { threshold: 0.25 });
      observer.observe(root);
    }
    root._repaint = run;
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-bars]"), mount);
  }

  global.DAR = global.DAR || {};
  global.DAR.bars = {
    refresh: function (root) {
      if (root && root._repaint) root._repaint();
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
