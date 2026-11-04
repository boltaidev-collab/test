/* Module: chart. Canvas bar, line, and area charts with tooltip and keyboard readout.
   Page scripts call DAR.chart(canvas, config). No external library. */
(function (global) {
  "use strict";

  function reduced() {
    return global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function niceCeil(value) {
    if (value <= 0) return 1;
    var exponent = Math.floor(Math.log10(value));
    var pow = Math.pow(10, exponent);
    var fraction = value / pow;
    var nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
    return nice * pow;
  }

  function format(value, decimals) {
    return Number(value).toLocaleString("en-GB", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function hexAlpha(hex, alpha) {
    var raw = String(hex).replace("#", "");
    if (raw.length === 3) {
      raw = raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2];
    }
    var number = parseInt(raw, 16);
    if (isNaN(number)) return hex;
    var red = (number >> 16) & 255;
    var green = (number >> 8) & 255;
    var blue = number & 255;
    return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
  }

  function roundRect(ctx, x, y, w, h, radius) {
    if (h < 0) {
      y += h;
      h = Math.abs(h);
    }
    if (w <= 0 || h <= 0) return;
    var r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function mount(canvas, config) {
    var parent = canvas.parentElement;
    var tip = parent.querySelector("[data-chart-tip]");
    var ctx = canvas.getContext("2d");
    var state = {
      config: config,
      progress: 0,
      width: 0,
      height: 0,
      hits: [],
      active: -1,
      raf: 0
    };

    function palette() {
      var style = getComputedStyle(canvas);
      return {
        muted: config.muted || "#5c6560",
        grid: config.grid || "rgba(28, 36, 31, 0.12)",
        font: style.fontFamily || "sans-serif",
        dot: config.dot || "#ffffff"
      };
    }

    function layout() {
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      var rect = canvas.getBoundingClientRect();
      var width = rect.width;
      var height = rect.height;
      if (width < 2 || height < 2) return false;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.width = width;
      state.height = height;
      return true;
    }

    function bounds(cfg) {
      var max = 0;
      var min = 0;
      cfg.series.forEach(function (series) {
        series.values.forEach(function (value) {
          if (value > max) max = value;
          if (value < min) min = value;
        });
      });
      return { max: max, min: min };
    }

    function draw(progress) {
      var cfg = state.config;
      var width = state.width;
      var height = state.height;
      if (!width || !height) return;
      var colours = palette();
      ctx.clearRect(0, 0, width, height);

      var pad = { l: cfg.padLeft || 52, r: 12, t: 16, b: 32 };
      var plotW = width - pad.l - pad.r;
      var plotH = height - pad.t - pad.b;
      var found = bounds(cfg);
      var yMin = cfg.yMin != null ? cfg.yMin : Math.min(0, found.min);
      var yMax = cfg.yMax != null ? cfg.yMax : niceCeil(found.max * 1.08);
      if (yMax <= yMin) yMax = yMin + 1;

      function yOf(value) {
        return pad.t + (1 - (value - yMin) / (yMax - yMin)) * plotH;
      }

      var count = cfg.labels.length;
      function xSlot(index) {
        return pad.l + (plotW / count) * (index + 0.5);
      }

      ctx.font = "12px sans-serif";
      ctx.lineWidth = 1;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      var axisDecimals = cfg.axisDecimals != null ? cfg.axisDecimals : (yMax - yMin < 20 ? 1 : 0);

      for (var tick = 0; tick <= 4; tick += 1) {
        var tickValue = yMin + ((yMax - yMin) * tick) / 4;
        var y = yOf(tickValue);
        ctx.strokeStyle = colours.grid;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(width - pad.r, y);
        ctx.stroke();
        ctx.fillStyle = colours.muted;
        ctx.fillText(format(tickValue, axisDecimals), pad.l - 8, y);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      cfg.labels.forEach(function (label, index) {
        ctx.fillStyle = colours.muted;
        ctx.fillText(String(label), xSlot(index), height - pad.b + 10);
      });

      state.hits = [];
      var seriesCount = cfg.series.length;

      if (cfg.type === "bar") {
        var slot = plotW / count;
        var groupGap = slot * 0.22;
        var inner = slot - groupGap;
        var barGap = seriesCount > 1 ? 4 : 0;
        var barW = (inner - barGap * (seriesCount - 1)) / seriesCount;

        cfg.labels.forEach(function (label, index) {
          cfg.series.forEach(function (series, seriesIndex) {
            var value = series.values[index] || 0;
            var fullTop = yOf(value);
            var base = yOf(yMin);
            var fullH = base - fullTop;
            var drawn = fullH * progress;
            var x = pad.l + index * slot + groupGap / 2 + seriesIndex * (barW + barGap);
            var y = base - drawn;
            var colour = (series.colors && series.colors[index]) || series.color;
            ctx.fillStyle = colour;
            roundRect(ctx, x, y, Math.max(0, barW), drawn, 3);
            ctx.fill();
            state.hits.push({
              x: x,
              y: Math.min(fullTop, base),
              w: Math.max(0, barW),
              h: Math.abs(fullH),
              cx: x + barW / 2,
              cy: fullTop,
              label: label,
              name: series.name,
              value: value,
              color: colour
            });
          });
        });
        return;
      }

      cfg.series.forEach(function (series) {
        var points = series.values.map(function (value, index) {
          var shown = yMin + ((value || 0) - yMin) * progress;
          return { x: xSlot(index), y: yOf(shown), value: value || 0 };
        });

        if (cfg.type === "area" && points.length) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, yOf(yMin));
          points.forEach(function (point) {
            ctx.lineTo(point.x, point.y);
          });
          ctx.lineTo(points[points.length - 1].x, yOf(yMin));
          ctx.closePath();
          ctx.fillStyle = series.fill || hexAlpha(series.color, 0.16);
          ctx.fill();
        }

        ctx.beginPath();
        points.forEach(function (point, index) {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = series.color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        points.forEach(function (point, index) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = colours.dot;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = series.color;
          ctx.stroke();
          state.hits.push({
            x: point.x - 16,
            y: point.y - 16,
            w: 32,
            h: 32,
            cx: point.x,
            cy: point.y,
            label: cfg.labels[index],
            name: series.name,
            value: point.value,
            color: series.color
          });
        });
      });
    }

    function showTip(hit, clientX, clientY) {
      if (!tip) return;
      if (!hit) {
        tip.hidden = true;
        return;
      }
      var decimals = state.config.decimals != null ? state.config.decimals : 1;
      var prefix = state.config.valuePrefix || "";
      var suffix = state.config.valueSuffix || "";
      tip.hidden = false;
      tip.replaceChildren();
      var title = document.createElement("strong");
      title.textContent = hit.label;
      var name = document.createElement("span");
      name.textContent = hit.name;
      var value = document.createElement("b");
      value.textContent = prefix + format(hit.value, decimals) + suffix;
      tip.append(title, name, value);

      var canvasRect = canvas.getBoundingClientRect();
      var parentRect = parent.getBoundingClientRect();
      var localX;
      var localY;
      if (clientX != null) {
        localX = clientX - parentRect.left;
        localY = clientY - parentRect.top;
      } else {
        localX = hit.cx + (canvasRect.left - parentRect.left);
        localY = hit.cy + (canvasRect.top - parentRect.top);
      }
      var left = localX + 14;
      var top = localY - 28;
      if (left > parentRect.width - 130) left = localX - 140;
      if (top < 4) top = localY + 16;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }

    function hitTest(x, y) {
      var index;
      for (index = state.hits.length - 1; index >= 0; index -= 1) {
        var hit = state.hits[index];
        if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h) return hit;
      }
      if (state.config.type === "bar") return null;
      var best = null;
      var bestDistance = 26;
      state.hits.forEach(function (hit) {
        var dx = hit.cx - x;
        var dy = hit.cy - y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = hit;
        }
      });
      return best;
    }

    canvas.addEventListener("mousemove", function (event) {
      var rect = canvas.getBoundingClientRect();
      var hit = hitTest(event.clientX - rect.left, event.clientY - rect.top);
      canvas.style.cursor = hit ? "crosshair" : "default";
      showTip(hit, event.clientX, event.clientY);
    });

    canvas.addEventListener("mouseleave", function () {
      if (tip) tip.hidden = true;
      canvas.style.cursor = "default";
    });

    canvas.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (tip) tip.hidden = true;
        return;
      }
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      if (!state.hits.length) return;
      event.preventDefault();
      if (event.key === "ArrowRight") {
        state.active = (state.active + 1) % state.hits.length;
      } else {
        state.active = (state.active - 1 + state.hits.length) % state.hits.length;
      }
      showTip(state.hits[state.active], null, null);
    });

    function animate() {
      cancelAnimationFrame(state.raf);
      if (!layout()) return;
      if (reduced() || state.config.animate === false) {
        state.progress = 1;
        draw(1);
        return;
      }
      var start = null;
      var duration = state.config.duration || 900;
      function frame(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        state.progress = 1 - Math.pow(1 - t, 3);
        draw(state.progress);
        if (t < 1) state.raf = requestAnimationFrame(frame);
      }
      state.raf = requestAnimationFrame(frame);
    }

    var tries = 0;
    function whenReady(callback) {
      if (layout()) {
        callback();
        return;
      }
      if (tries < 30) {
        tries += 1;
        requestAnimationFrame(function () {
          whenReady(callback);
        });
      }
    }

    whenReady(function () {
      if (reduced()) {
        state.progress = 1;
        draw(1);
        return;
      }
      draw(0);
      if (!("IntersectionObserver" in global)) {
        animate();
        return;
      }
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            animate();
            observer.disconnect();
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(canvas);
    });

    global.addEventListener("resize", function () {
      if (!layout()) return;
      draw(state.progress || 1);
    });

    return {
      update: function (partial) {
        state.config = Object.assign({}, state.config, partial);
        state.active = -1;
        if (tip) tip.hidden = true;
        animate();
      }
    };
  }

  global.DAR = global.DAR || {};
  global.DAR.chart = mount;
})(window);
