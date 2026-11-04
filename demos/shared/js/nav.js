/* Module: nav. Opens and closes [data-nav-toggle] menus on small screens. */
(function () {
  "use strict";

  function init() {
    var buttons = document.querySelectorAll("[data-nav-toggle]");
    Array.prototype.forEach.call(buttons, function (button) {
      var nav = document.getElementById(button.getAttribute("aria-controls"));
      if (!nav) return;
      button.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
