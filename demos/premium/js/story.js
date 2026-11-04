/* Module: chapter progress. A thin bar tracks how far the page has been read. */
(function () {
  "use strict";

  var bar = document.querySelector("[data-progress]");
  if (!bar) return;

  function paint() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = "scaleX(" + Math.max(0, Math.min(1, progress)) + ")";
  }

  paint();
  window.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("resize", paint);
})();
