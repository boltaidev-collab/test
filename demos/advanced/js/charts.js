/* Module: interactive charts. Three charts, each with a tooltip and a filter. */
(function () {
  "use strict";

  if (!window.DAR) return;

  var revenueYears = ["2021", "2022", "2023", "2024", "2025"];
  var revenueValues = [690.2, 724.5, 761.0, 791.8, 842.6];

  var divisionYears = {
    "2023": [372.0, 241.0, 148.0],
    "2024": [390.0, 252.0, 149.8],
    "2025": [412.4, 267.8, 162.4]
  };

  var region = {
    revenue: [71, 21, 8],
    people: [76.8, 18.7, 4.5]
  };

  function bindFilters(group, onPick) {
    var buttons = group.querySelectorAll("button");
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons, function (other) {
          other.setAttribute("aria-pressed", other === button ? "true" : "false");
        });
        onPick(button);
      });
    });
  }

  var revenueBars = document.getElementById("revenue-bars");
  if (revenueBars && window.DAR.bars) {
    var revenueStatus = document.getElementById("revenue-status");
    bindFilters(document.getElementById("revenue-filters"), function (button) {
      var span = button.getAttribute("data-span");
      var rows = revenueBars.querySelectorAll("[data-bar]");
      Array.prototype.forEach.call(rows, function (row, index) {
        row.hidden = span === "3" && index < 2;
      });
      window.DAR.bars.refresh(revenueBars);
      revenueStatus.textContent = span === "3"
        ? "Showing the latest three years of group revenue."
        : "Showing five years of group revenue.";
    });
  }

  var revenueCanvas = document.getElementById("revenue-chart");
  if (revenueCanvas) {
    var revenueChart = window.DAR.chart(revenueCanvas, {
      type: "line",
      labels: revenueYears,
      series: [{ name: "Revenue", values: revenueValues, color: "#0c5c68" }],
      valuePrefix: "£",
      valueSuffix: "m",
      decimals: 1,
      axisDecimals: 0,
      muted: "#3e5164",
      grid: "rgba(16, 32, 51, 0.12)"
    });
    var revenueStatus = document.getElementById("revenue-status");
    bindFilters(document.getElementById("revenue-filters"), function (button) {
      var span = button.getAttribute("data-span");
      if (span === "3") {
        revenueChart.update({
          labels: revenueYears.slice(2),
          series: [{ name: "Revenue", values: revenueValues.slice(2), color: "#0c5c68" }]
        });
        revenueStatus.textContent = "Showing the latest three years of group revenue.";
      } else {
        revenueChart.update({
          labels: revenueYears,
          series: [{ name: "Revenue", values: revenueValues, color: "#0c5c68" }]
        });
        revenueStatus.textContent = "Showing five years of group revenue.";
      }
    });
  }

  var divisionCanvas = document.getElementById("division-chart");
  if (divisionCanvas) {
    var divisionColours = ["#0c5c68", "#102033", "#a56722"];
    var divisionChart = window.DAR.chart(divisionCanvas, {
      type: "bar",
      labels: ["Building", "Water", "Workplace"],
      series: [{
        name: "2025 revenue",
        values: divisionYears["2025"],
        color: "#0c5c68",
        colors: divisionColours
      }],
      valuePrefix: "£",
      valueSuffix: "m",
      decimals: 1,
      axisDecimals: 0,
      muted: "#3e5164",
      grid: "rgba(16, 32, 51, 0.12)"
    });
    var divisionStatus = document.getElementById("division-status");
    bindFilters(document.getElementById("division-filters"), function (button) {
      var year = button.getAttribute("data-year");
      divisionChart.update({
        series: [{
          name: year + " revenue",
          values: divisionYears[year],
          color: "#0c5c68",
          colors: divisionColours
        }]
      });
      divisionStatus.textContent = "Showing divisional revenue for " + year + ".";
    });
  }

  var regionCanvas = document.getElementById("region-chart");
  if (regionCanvas) {
    function regionSeries(mode) {
      if (mode === "people") {
        return [{ name: "People share", values: region.people, color: "#a56722" }];
      }
      if (mode === "both") {
        return [
          { name: "Revenue share", values: region.revenue, color: "#0c5c68" },
          { name: "People share", values: region.people, color: "#a56722" }
        ];
      }
      return [{ name: "Revenue share", values: region.revenue, color: "#0c5c68" }];
    }

    var regionChart = window.DAR.chart(regionCanvas, {
      type: "bar",
      labels: ["UK", "Europe", "Other"],
      series: regionSeries("revenue"),
      valueSuffix: "%",
      decimals: 1,
      axisDecimals: 0,
      yMax: 100,
      muted: "#3e5164",
      grid: "rgba(16, 32, 51, 0.12)"
    });
    var regionStatus = document.getElementById("region-status");
    bindFilters(document.getElementById("region-filters"), function (button) {
      var mode = button.getAttribute("data-measure");
      regionChart.update({ series: regionSeries(mode) });
      var label = mode === "both" ? "revenue and people" : mode;
      regionStatus.textContent = "Showing " + label + " share by region.";
    });
  }
})();
