/* Module: custom visualisations for the Premium package.
   Waterfall, profit radial, and emissions pathway. */
(function () {
  "use strict";

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var waterfallRoot = document.querySelector("[data-waterfall]");
  if (waterfallRoot) {
    var steps = [
      { label: "2024", value: 791.8, total: true, note: "The year opened at £791.8 million of revenue." },
      { label: "Building", value: 28.4, note: "Envelope and facade volume added £28.4 million, mostly on UK frameworks." },
      { label: "Water", value: 18.6, note: "Framework lots and the Reading outage added £18.6 million." },
      { label: "Workplace", value: 9.2, note: "The remaining Workplace book added £9.2 million." },
      { label: "Price", value: 11.4, note: "Price and mix contributed £11.4 million." },
      { label: "Sheffield", value: -16.8, note: "Disposing of the Sheffield depot removed £16.8 million of revenue." },
      { label: "2025", value: 842.6, total: true, note: "The year closed at £842.6 million." }
    ];
    var floor = 760;
    var ceiling = 880;
    var running = 0;
    var note = document.querySelector("[data-waterfall-note]");
    steps.forEach(function (step) {
      var y0;
      var y1;
      if (step.total) {
        y0 = floor;
        y1 = step.value;
        running = step.value;
      } else {
        y0 = running;
        y1 = running + step.value;
        running = y1;
      }
      var low = Math.min(y0, y1);
      var high = Math.max(y0, y1);
      var bottom = ((low - floor) / (ceiling - floor)) * 100;
      var height = ((high - low) / (ceiling - floor)) * 100;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "wf-col" + (step.total ? " is-total" : step.value < 0 ? " is-down" : "");
      button.setAttribute("aria-pressed", "false");
      var plot = document.createElement("span");
      plot.className = "wf-plot";
      var bar = document.createElement("span");
      bar.className = "wf-bar";
      bar.style.bottom = bottom + "%";
      bar.style.height = height + "%";
      plot.appendChild(bar);
      var label = document.createElement("span");
      label.className = "wf-label";
      label.textContent = step.label;
      var value = document.createElement("span");
      value.className = "wf-value";
      var sign = step.total ? "£" : step.value > 0 ? "+£" : "−£";
      value.textContent = sign + Math.abs(step.value).toFixed(1) + "m";
      button.append(plot, label, value);
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(waterfallRoot.querySelectorAll(".wf-col"), function (other) {
          other.setAttribute("aria-pressed", other === button ? "true" : "false");
        });
        if (note) note.textContent = step.note;
      });
      waterfallRoot.appendChild(button);
    });
    if (note) note.textContent = "Select a column. The scale starts at £760 million so the year’s movements stay readable.";
    function arm() {
      waterfallRoot.classList.add("is-on");
    }
    if (reduced() || !("IntersectionObserver" in window)) arm();
    else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          arm();
          observer.disconnect();
        });
      }, { threshold: 0.3 });
      observer.observe(waterfallRoot);
    }
  }

  var radialRoot = document.querySelector("[data-radial]");
  if (radialRoot) {
    var parts = [
      { name: "Building Systems", value: 54.2, color: "#8d6434" },
      { name: "Water Infrastructure", value: 28.7, color: "#3d4f48" },
      { name: "Workplace Services", value: 13.4, color: "#c2654a" }
    ];
    var total = parts.reduce(function (sum, part) { return sum + part.value; }, 0);
    var svg = radialRoot.querySelector("svg");
    var legend = radialRoot.querySelector(".radial-legend");
    var radialNote = document.querySelector("[data-radial-note]");
    var angle = 0;
    parts.forEach(function (part, index) {
      var sweep = (part.value / total) * 360;
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", donut(160, 160, 58, 96, angle, angle + sweep - 1.2));
      path.setAttribute("fill", part.color);
      path.setAttribute("data-index", String(index));
      svg.appendChild(path);
      angle += sweep;
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.textContent = part.name + " · £" + part.value.toFixed(1) + "m";
      button.addEventListener("click", function () {
        var on = button.getAttribute("aria-pressed") === "true";
        Array.prototype.forEach.call(legend.querySelectorAll("button"), function (other) {
          other.setAttribute("aria-pressed", "false");
        });
        Array.prototype.forEach.call(svg.querySelectorAll("path"), function (other) {
          other.style.opacity = "1";
        });
        if (!on) {
          button.setAttribute("aria-pressed", "true");
          Array.prototype.forEach.call(svg.querySelectorAll("path"), function (other) {
            other.style.opacity = other.getAttribute("data-index") === String(index) ? "1" : "0.25";
          });
          if (radialNote) {
            radialNote.textContent = part.name + " contributed £" + part.value.toFixed(1) + " million of underlying operating profit.";
          }
        } else if (radialNote) {
          radialNote.textContent = "Underlying operating profit was £96.3 million, shared across the three divisions.";
        }
      });
      legend.appendChild(button);
    });
  }

  var pathway = document.querySelector("[data-pathway]");
  if (pathway) {
    var years = [2019, 2021, 2022, 2023, 2024, 2025, 2030];
    var actual = [48.2, 44.1, 40.6, 36.9, 32.4, 26.0, null];
    var plan = [48.2, 42.8, 38.6, 34.2, 30.0, 26.2, 14.5];
    var svg = pathway.querySelector("svg");
    var input = pathway.querySelector("input");
    var readout = pathway.querySelector("[data-pathway-readout]");
    var width = 640;
    var height = 320;
    var pad = { l: 44, r: 16, t: 20, b: 36 };
    var min = 10;
    var max = 54;
    function x(index) {
      return pad.l + ((width - pad.l - pad.r) * index) / (years.length - 1);
    }
    function y(value) {
      return pad.t + (height - pad.t - pad.b) * (1 - (value - min) / (max - min));
    }
    function line(series, dashed) {
      var d = "";
      series.forEach(function (value, index) {
        if (value == null) return;
        d += (d ? " L " : "M ") + x(index) + " " + y(value);
      });
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", dashed ? "#a68456" : "#1a1814");
      path.setAttribute("stroke-width", "3");
      path.setAttribute("stroke-linejoin", "round");
      if (dashed) path.setAttribute("stroke-dasharray", "6 6");
      svg.appendChild(path);
      return path;
    }
    line(plan, true);
    var actualPath = line(actual, false);
    var marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    marker.setAttribute("r", "7");
    marker.setAttribute("fill", "#c2654a");
    svg.appendChild(marker);
    years.forEach(function (year, index) {
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(x(index)));
      text.setAttribute("y", String(height - 10));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "#5c564c");
      text.textContent = String(year);
      svg.appendChild(text);
    });
    if (!reduced()) {
      requestAnimationFrame(function () {
        var length = actualPath.getTotalLength();
        if (!length) return;
        actualPath.style.strokeDasharray = String(length);
        actualPath.style.strokeDashoffset = String(length);
        actualPath.getBoundingClientRect();
        actualPath.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)";
        requestAnimationFrame(function () {
          actualPath.style.strokeDashoffset = "0";
        });
      });
    }
    function show(index) {
      var value = actual[index] != null ? actual[index] : plan[index];
      marker.setAttribute("cx", String(x(index)));
      marker.setAttribute("cy", String(y(value)));
      var kind = actual[index] != null ? "actual" : "pathway";
      if (readout) {
        readout.textContent = years[index] + " · " + value.toFixed(1) + " thousand tonnes, " + kind + ".";
      }
    }
    show(5);
    input.addEventListener("input", function () {
      show(parseInt(input.value, 10));
    });
  }

  function polar(cx, cy, radius, degrees) {
    var radians = ((degrees - 90) * Math.PI) / 180;
    return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
  }

  function donut(cx, cy, inner, outer, start, end) {
    var large = end - start > 180 ? 1 : 0;
    var outerStart = polar(cx, cy, outer, start);
    var outerEnd = polar(cx, cy, outer, end);
    var innerEnd = polar(cx, cy, inner, end);
    var innerStart = polar(cx, cy, inner, start);
    return [
      "M", outerStart[0], outerStart[1],
      "A", outer, outer, 0, large, 1, outerEnd[0], outerEnd[1],
      "L", innerEnd[0], innerEnd[1],
      "A", inner, inner, 0, large, 0, innerStart[0], innerStart[1],
      "Z"
    ].join(" ");
  }
})();
