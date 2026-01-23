/* global google, markerClusterer */

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

const MAP_STYLES = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#d7e3f3" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#334155" }],
  },
];

let map;
let infoWindow;
let markers = [];
let clusterer;

function initMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    return;
  }

  map = new google.maps.Map(mapElement, {
    center: { lat: 54.5, lng: -2.5 },
    zoom: 5,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: MAP_STYLES,
  });

  infoWindow = new google.maps.InfoWindow();

  markers = LOCATION_DATA.map((location) => {
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      title: location.name,
      icon: getMarkerIcon(location.type),
    });

    marker.addListener("click", () => {
      openInfoWindow(location, marker);
      updatePanel(location);
    });

    return { marker, location };
  });

  clusterer = new markerClusterer.MarkerClusterer({
    map,
    markers: markers.map((item) => item.marker),
  });

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
      marker.setMap(map);
      visibleMarkers.push(marker);
    } else {
      marker.setMap(null);
    }
  });

  clusterer.clearMarkers();
  if (visibleMarkers.length) {
    clusterer.addMarkers(visibleMarkers);
    const bounds = new google.maps.LatLngBounds();
    visibleMarkers.forEach((marker) => bounds.extend(marker.getPosition()));
    map.fitBounds(bounds, 70);
  } else {
    map.setCenter({ lat: 20, lng: 0 });
    map.setZoom(2);
  }
}

function updateResultsSummary(filtered, searchText, filterValue) {
  const summary = document.getElementById("results-summary");
  if (!summary) {
    return;
  }

  const filterLabel =
    filterValue === "all" ? "all locations" : TYPE_LABELS[filterValue];

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
        map.panTo(markerEntry.marker.getPosition());
        map.setZoom(12);
        openInfoWindow(location, markerEntry.marker);
        updatePanel(location);
      }
    });

    list.appendChild(item);
  });
}

function openInfoWindow(location, marker) {
  infoWindow.setContent(renderInfoWindowContent(location));
  infoWindow.open({ map, anchor: marker });
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

  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z",
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 1.5,
    scale: 1.5,
    anchor: new google.maps.Point(12, 22),
  };
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

window.initMap = initMap;
