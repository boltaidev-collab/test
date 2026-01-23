/* global L */

const LOCATION_DATA = [
  {
    id: "selwood-head-office",
    name: "Selwood Head Office",
    type: "head-office",
    city: "Chandlers Ford",
    postcode: "SO53 3SA",
    lat: 50.98327,
    lng: -1.3567,
    address: ["Harbour Road", "Chandlers Ford", "Hampshire", "SO53 3SA"],
    phone: "+44 1962 872123",
    website: "https://www.selwood.co.uk",
    contact: [
      { label: "Sales", value: "sales@selwood.co.uk" },
      { label: "Support", value: "support@selwood.co.uk" },
    ],
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "selwood-london",
    name: "Selwood London Depot",
    type: "depot",
    city: "London",
    postcode: "SE1 9SG",
    lat: 51.5055,
    lng: -0.09,
    address: ["Dock Street", "London", "SE1 9SG"],
    phone: "+44 20 7946 0958",
    website: "https://www.selwood.co.uk/depot/london",
    contact: [{ label: "Depot", value: "+44 20 7946 0958" }],
  },
  {
    id: "selwood-bristol",
    name: "Selwood Bristol Depot",
    type: "depot",
    city: "Bristol",
    postcode: "BS1 4DJ",
    lat: 51.4545,
    lng: -2.5879,
    address: ["Harbourside", "Bristol", "BS1 4DJ"],
    phone: "+44 117 496 0113",
    contact: [{ label: "Depot", value: "+44 117 496 0113" }],
  },
  {
    id: "selwood-manchester",
    name: "Selwood Manchester Depot",
    type: "depot",
    city: "Manchester",
    postcode: "M1 4ET",
    lat: 53.4782,
    lng: -2.2427,
    address: ["Ancoats", "Manchester", "M1 4ET"],
    phone: "+44 161 503 1502",
  },
  {
    id: "holland-houston",
    name: "Holland Pump Houston",
    type: "branch",
    city: "Houston",
    postcode: "TX 77002",
    lat: 29.7604,
    lng: -95.3698,
    address: ["Downtown", "Houston, TX 77002"],
    phone: "+1 713 555 0182",
    website: "https://www.hollandpump.com/locations/houston",
  },
  {
    id: "holland-miami",
    name: "Holland Pump Miami",
    type: "branch",
    city: "Miami",
    postcode: "FL 33101",
    lat: 25.7617,
    lng: -80.1918,
    address: ["Brickell", "Miami, FL 33101"],
    phone: "+1 305 555 0111",
  },
  {
    id: "workdry-oslo",
    name: "Workdry Oslo",
    type: "service",
    city: "Oslo",
    postcode: "0150",
    lat: 59.9139,
    lng: 10.7522,
    address: ["Karl Johans gate 1", "0150 Oslo"],
    phone: "+47 22 00 44 22",
  },
  {
    id: "workdry-sydney",
    name: "Workdry Sydney",
    type: "service",
    city: "Sydney",
    postcode: "2000",
    lat: -33.8688,
    lng: 151.2093,
    address: ["George Street", "Sydney NSW 2000"],
    phone: "+61 2 9001 0020",
  },
];

const TYPE_LABELS = {
  "head-office": "Head office",
  depot: "Depot",
  branch: "Branch",
  service: "Service centre",
};

let map;
let markers = [];
let clusterer;
let searchResultLayer;
let searchRequestId = 0;

function initMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    return;
  }

  map = L.map(mapElement, {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([54.5, -2.5], 5);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution:
        "Map data (c) OpenStreetMap contributors, tiles by CARTO",
      maxZoom: 19,
    }
  ).addTo(map);

  clusterer = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 48,
  });

  searchResultLayer = L.layerGroup().addTo(map);

  markers = LOCATION_DATA.map((location) => {
    const marker = L.marker([location.lat, location.lng], {
      title: location.name,
      icon: getMarkerIcon(location.type),
    });

    marker.on("click", () => {
      openInfoWindow(location, marker);
      updatePanel(location);
    });

    return { marker, location };
  });

  clusterer.addLayers(markers.map((item) => item.marker));
  map.addLayer(clusterer);

  wireControls();
  syncResults();
}

function wireControls() {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const filterSelect = document.getElementById("filter-select");

  if (!searchInput || !searchButton || !filterSelect) {
    return;
  }

  const runSearch = () => {
    executeSearch(searchInput.value.trim(), filterSelect.value);
  };

  searchButton.addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runSearch();
    }
  });
  filterSelect.addEventListener("change", runSearch);
}

async function executeSearch(searchText, filterValue) {
  const requestId = ++searchRequestId;
  const filtered = syncResults(searchText, filterValue);

  if (!searchText || filtered.length > 0) {
    clearSearchResult();
    return;
  }

  const geocoded = await geocodeQuery(searchText);
  if (requestId !== searchRequestId) {
    return;
  }

  if (geocoded) {
    showSearchResult(geocoded);
  } else {
    clearSearchResult();
  }
}

function syncResults(searchText = "", filterValue = "all") {
  const normalized = searchText.toLowerCase();

  const filtered = LOCATION_DATA.filter((location) => {
    const matchesFilter =
      filterValue === "all" || location.type === filterValue;

    if (!matchesFilter) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = [
      location.name,
      location.city,
      location.postcode,
      location.address?.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  updateMarkers(filtered);
  updateResultsList(filtered);
  updateResultsSummary(filtered, searchText, filterValue);

  return filtered;
}

function updateMarkers(filteredLocations) {
  const filteredIds = new Set(filteredLocations.map((location) => location.id));
  const visibleMarkers = [];

  markers.forEach(({ marker, location }) => {
    if (filteredIds.has(location.id)) {
      visibleMarkers.push(marker);
    }
  });

  clusterer.clearLayers();
  if (visibleMarkers.length) {
    clusterer.addLayers(visibleMarkers);
    const bounds = L.featureGroup(visibleMarkers).getBounds();
    map.fitBounds(bounds, { padding: [70, 70] });
  } else {
    map.setView([20, 0], 2);
  }

  map.closePopup();
}

function updateResultsSummary(filtered, searchText, filterValue) {
  const summary = document.getElementById("results-summary");
  if (!summary) {
    return;
  }

  const filterLabel =
    filterValue === "all"
      ? "all locations"
      : TYPE_LABELS[filterValue] || "locations";

  if (!filtered.length) {
    summary.textContent = "No locations match your search.";
    return;
  }

  if (searchText) {
    summary.textContent = `Showing ${filtered.length} ${filterLabel} matching "${searchText}".`;
  } else {
    summary.textContent = `Showing ${filtered.length} ${filterLabel}.`;
  }
}

function updateResultsList(filtered) {
  const list = document.getElementById("results-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";

  filtered.forEach((location) => {
    const item = document.createElement("li");
    item.className = "results-list__item";
    item.innerHTML = `
      <strong>${escapeHtml(location.name)}</strong>
      <span>${escapeHtml(location.city || "")} ${escapeHtml(
      location.postcode || ""
    )}</span>
    `;

    item.addEventListener("click", () => {
      const markerEntry = markers.find(
        (markerItem) => markerItem.location.id === location.id
      );
      if (markerEntry) {
        map.setView(markerEntry.marker.getLatLng(), 12);
        openInfoWindow(location, markerEntry.marker);
        updatePanel(location);
      }
    });

    list.appendChild(item);
  });
}

function openInfoWindow(location, marker) {
  const content = renderInfoWindowContent(location);
  if (marker.getPopup()) {
    marker.setPopupContent(content);
  } else {
    marker.bindPopup(content, {
      closeButton: true,
      className: "info-popup",
      maxWidth: 280,
    });
  }
  marker.openPopup();
}

function updatePanel(location) {
  const details = document.getElementById("panel-details");
  const emptyState = document.getElementById("panel-empty");
  if (!details || !emptyState) {
    return;
  }

  emptyState.hidden = true;
  details.hidden = false;

  details.innerHTML = `
    <div class="panel-details__name">${escapeHtml(location.name)}</div>
    <div class="panel-details__meta">${escapeHtml(
      TYPE_LABELS[location.type] || "Location"
    )}</div>
    <div class="panel-details__meta">${formatAddress(location.address)}</div>
    <div class="panel-details__meta">${formatContact(location)}</div>
    ${location.website ? formatWebsite(location.website) : ""}
  `;
}

function renderInfoWindowContent(location) {
  return `
    <div class="popup-card">
      ${renderPopupImage(location)}
      <div class="popup-card__body">
        <div class="popup-card__title">${escapeHtml(location.name)}</div>
        ${renderAddressBlock(location.address)}
        ${renderContactRows(location)}
        ${
          location.website
            ? `<a class="popup-card__button" href="${escapeHtml(
                location.website
              )}" target="_blank" rel="noreferrer">Find out more</a>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderPopupImage(location) {
  if (location.image) {
    return `
      <div class="popup-card__image">
        <img src="${escapeHtml(location.image)}" alt="${escapeHtml(
      location.name
    )}" />
      </div>
    `;
  }

  return `
    <div class="popup-card__image popup-card__image--placeholder">
      <span>Location</span>
    </div>
  `;
}

function renderAddressLines(addressLines) {
  if (!addressLines || !addressLines.length) {
    return "";
  }

  return addressLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
}

function renderAddressBlock(addressLines) {
  if (!addressLines || !addressLines.length) {
    return "";
  }

  return `<div class="popup-card__address">${renderAddressLines(
    addressLines
  )}</div>`;
}

function getMarkerIcon(type) {
  const colorMap = {
    "head-office": "#1d4ed8",
    depot: "#2563eb",
    branch: "#0f766e",
    service: "#7c3aed",
    search: "#2563eb",
  };

  const fill = colorMap[type] || "#2563eb";

  const svg = `
    <svg width="28" height="36" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7.58 2 4 5.58 4 10c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="${fill}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="10" r="3.2" fill="#ffffff"/>
    </svg>
  `.trim();

  return L.divIcon({
    className: "custom-marker",
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });
}

function renderContactRows(location) {
  const entries = getContactEntries(location);
  if (!entries.length) {
    return "";
  }

  return `
    <div class="popup-card__contact">
      ${entries.map(renderContactRow).join("")}
    </div>
  `;
}

function getContactEntries(location) {
  const entries = [];

  if (location.phone) {
    entries.push({
      type: "phone",
      label: location.phone,
      href: `tel:${String(location.phone).replace(/[^+\d]/g, "")}`,
    });
  }

  const emailEntry = (location.contact || []).find(
    (entry) => entry.value && entry.value.includes("@")
  );

  if (emailEntry) {
    entries.push({
      type: "email",
      label: emailEntry.value,
      href: `mailto:${emailEntry.value}`,
    });
  }

  return entries;
}

function renderContactRow(entry) {
  const icon =
    entry.type === "phone"
      ? `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 3.5C6 9 11 14 16.5 15.5L14.5 17.5C13.5 18.5 12 18.5 11 17.5C6.5 13 4 10.5 2.5 6C2 4.5 2.5 3 3.5 2L4.5 3.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`
      : `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6.5L10 11L17 6.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/></svg>`;

  return `
    <div class="popup-card__contact-row">
      <span class="popup-card__icon" aria-hidden="true">${icon}</span>
      <a href="${escapeHtml(entry.href)}">${escapeHtml(entry.label)}</a>
    </div>
  `;
}

async function geocodeQuery(query) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("q", query);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const results = await response.json();
    if (!results.length) {
      return null;
    }

    const result = results[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address || {},
    };
  } catch (error) {
    return null;
  }
}

function showSearchResult(result) {
  if (!searchResultLayer) {
    return;
  }

  const popupData = buildSearchPopupData(result);
  const marker = L.marker([result.lat, result.lng], {
    title: popupData.title,
    icon: getMarkerIcon("search"),
  });

  marker.bindPopup(renderSearchResultContent(popupData), {
    closeButton: true,
    className: "info-popup",
    maxWidth: 280,
  });

  searchResultLayer.clearLayers();
  searchResultLayer.addLayer(marker);
  map.setView([result.lat, result.lng], 11);
  marker.openPopup();
}

function clearSearchResult() {
  if (searchResultLayer) {
    searchResultLayer.clearLayers();
  }
}

function buildSearchPopupData(result) {
  const address = result.address || {};
  const title =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    result.displayName.split(",")[0];

  const rawLines = [
    address.road,
    address.suburb,
    address.city || address.town || address.village || address.county,
    address.state,
    address.postcode,
    address.country,
  ].filter(Boolean);

  const uniqueLines = Array.from(new Set(rawLines));

  return {
    title,
    lines: uniqueLines,
  };
}

function renderSearchResultContent(data) {
  const lines = data.lines.length
    ? data.lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")
    : `<span>${escapeHtml(data.title)}</span>`;

  return `
    <div class="popup-card">
      <div class="popup-card__image popup-card__image--placeholder">
        <span>Search result</span>
      </div>
      <div class="popup-card__body">
        <div class="popup-card__title">${escapeHtml(data.title)}</div>
        <div class="popup-card__address">${lines}</div>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

document.addEventListener("DOMContentLoaded", initMap);
