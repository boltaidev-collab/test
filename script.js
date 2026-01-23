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
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
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
    syncResults(searchInput.value.trim(), filterSelect.value);
  };

  searchButton.addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runSearch();
    }
  });
  filterSelect.addEventListener("change", runSearch);
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
  const imageSection = location.image
    ? `<img src="${escapeHtml(location.image)}" alt="${escapeHtml(
        location.name
      )}" class="info-window__image" />`
    : "";

  return `
    <div class="info-window">
      ${imageSection}
      <div class="info-window__content">
        <strong class="info-window__title">${escapeHtml(
          location.name
        )}</strong>
        <div class="info-window__text">${escapeHtml(
          TYPE_LABELS[location.type] || "Location"
        )}</div>
        <div class="info-window__text">${formatAddress(location.address)}</div>
        <div class="info-window__text">${formatContact(location)}</div>
        ${
          location.website
            ? `<a class="info-window__link" href="${escapeHtml(
                location.website
              )}" target="_blank" rel="noreferrer">Visit location</a>`
            : ""
        }
      </div>
    </div>
  `;
}

function formatAddress(addressLines) {
  if (!addressLines || !addressLines.length) {
    return "Address available on request.";
  }
  return addressLines.map((line) => escapeHtml(line)).join("<br />");
}

function formatContact(location) {
  const contactItems = [];

  if (location.phone) {
    contactItems.push(`Phone: ${escapeHtml(location.phone)}`);
  }

  if (location.contact && location.contact.length) {
    location.contact.forEach((entry) => {
      contactItems.push(
        `${escapeHtml(entry.label)}: ${escapeHtml(entry.value)}`
      );
    });
  }

  if (!contactItems.length) {
    return "Contact details available on request.";
  }

  return contactItems.join("<br />");
}

function formatWebsite(website) {
  return `<a class="panel-details__link" href="${escapeHtml(
    website
  )}" target="_blank" rel="noreferrer">Visit website</a>`;
}

function getMarkerIcon(type) {
  const colorMap = {
    "head-office": "#1d4ed8",
    depot: "#2563eb",
    branch: "#0f766e",
    service: "#7c3aed",
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
