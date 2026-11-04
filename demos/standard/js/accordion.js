/* Module: accordion. One open-or-closed disclosure per button. */
(function () {
  "use strict";

  var buttons = document.querySelectorAll("[data-accordion-button]");
  Array.prototype.forEach.call(buttons, function (button) {
    var panel = document.getElementById(button.getAttribute("aria-controls"));
    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", open ? "false" : "true");
      if (panel) panel.hidden = open;
    });
  });
})();
