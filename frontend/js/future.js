// ============================================================
// ONGOING & FUTURE MISSIONS (Deep Space Horizon Explorer)
// ============================================================

(function () {
  let missionsData = [];
  let activeMissionId = null;
  let activeCategoryFilter = "all";
  let activeDestFilter = "all";
  let searchQuery = "";
  let clockInterval = null;

  // DOM Elements
  const missionListEl = document.getElementById("missionListContainer");
  const detailPanelEl = document.getElementById("missionDetailPanel");
  const searchInputEl = document.getElementById("missionSearchInput");
  const categoryFilters = document.querySelectorAll("[data-cat-filter]");
  const destFilters = document.querySelectorAll("[data-dest-filter]");
  const resultsCountEl = document.getElementById("resultsCount");

  // Load Mission Bank
  async function loadMissions() {
    try {
      const response = await fetch("data/future-missions.json");
      if (response.ok) {
        missionsData = await response.json();
      } else {
        throw new Error("Local fetch fallback");
      }
    } catch (e) {
      console.warn("Using embedded fallback mission data");
      missionsData = getFallbackMissions();
    }

    init();
  }

  function init() {
    setupEventListeners();
    applyFilters();

    // Select first mission by default if available
    if (missionsData.length > 0) {
      selectMission(missionsData[0].id);
    }
  }

  function setupEventListeners() {
    // Category Tabs
    categoryFilters.forEach((btn) => {
      btn.addEventListener("click", () => {
        categoryFilters.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeCategoryFilter = btn.dataset.catFilter;
        applyFilters();
      });
    });

    // Destination Filter Pills
    destFilters.forEach((btn) => {
      btn.addEventListener("click", () => {
        destFilters.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeDestFilter = btn.dataset.destFilter;
        applyFilters();
      });
    });

    // Search Input
    if (searchInputEl) {
      searchInputEl.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        applyFilters();
      });
    }
  }

  function applyFilters() {
    const filtered = missionsData.filter((m) => {
      // Category check
      if (activeCategoryFilter !== "all" && m.category !== activeCategoryFilter) {
        return false;
      }
      // Destination check
      if (activeDestFilter !== "all" && m.destinationType !== activeDestFilter) {
        return false;
      }
      // Search check
      if (searchQuery) {
        const fullText = `${m.name} ${m.agency} ${m.target} ${m.summary} ${m.status}`.toLowerCase();
        if (!fullText.includes(searchQuery)) {
          return false;
        }
      }
      return true;
    });

    renderList(filtered);

    if (resultsCountEl) {
      resultsCountEl.textContent = `${filtered.length} MISSIONS`;
    }

    // Keep active selection valid
    if (filtered.length > 0) {
      const stillThere = filtered.find((m) => m.id === activeMissionId);
      if (!stillThere) {
        selectMission(filtered[0].id);
      }
    } else {
      renderEmptyState();
    }
  }

  function renderList(list) {
    if (!missionListEl) return;
    missionListEl.innerHTML = "";

    if (list.length === 0) {
      missionListEl.innerHTML = `
        <div class="empty-search-state">
          <p>No missions match your filter criteria.</p>
          <button class="button button-quiet" id="clearFiltersBtn" type="button">Reset Filters</button>
        </div>
      `;
      const clearBtn = document.getElementById("clearFiltersBtn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          activeCategoryFilter = "all";
          activeDestFilter = "all";
          searchQuery = "";
          if (searchInputEl) searchInputEl.value = "";
          categoryFilters.forEach((b, i) => b.classList.toggle("is-active", i === 0));
          destFilters.forEach((b, i) => b.classList.toggle("is-active", i === 0));
          applyFilters();
        });
      }
      return;
    }

    list.forEach((m) => {
      const card = document.createElement("article");
      card.className = `future-mission-card ${m.id === activeMissionId ? "is-selected" : ""}`;
      card.dataset.id = m.id;
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-pressed", m.id === activeMissionId ? "true" : "false");

      const badgeColor =
        m.statusClass === "crewed"
          ? "badge-crewed"
          : m.statusClass === "active"
            ? "badge-ongoing"
            : "badge-future";

      card.innerHTML = `
        <div class="fmc-head">
          <span class="fmc-badge ${badgeColor}">${m.statusBadge}</span>
          <span class="fmc-agency">${m.agency}</span>
        </div>
        <h3 class="fmc-title">${m.name}</h3>
        <p class="fmc-target">🎯 <strong>Target:</strong> ${m.target}</p>
        <p class="fmc-summary">${m.summary}</p>
        <div class="fmc-foot">
          <span class="fmc-date">🚀 ${m.category === "ongoing" ? "Launched" : "Launch window"}: <strong>${m.launchDate}</strong></span>
          <span class="fmc-arrow">→</span>
        </div>
      `;

      card.addEventListener("click", () => selectMission(m.id));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectMission(m.id);
        }
      });

      missionListEl.appendChild(card);
    });
  }

  function selectMission(missionId) {
    activeMissionId = missionId;

    // Update active highlight in DOM
    const cards = document.querySelectorAll(".future-mission-card");
    cards.forEach((c) => {
      const isCurrent = c.dataset.id === missionId;
      c.classList.toggle("is-selected", isCurrent);
      c.setAttribute("aria-pressed", isCurrent ? "true" : "false");
    });

    const mission = missionsData.find((m) => m.id === missionId);
    if (mission) {
      renderDetail(mission);
    }
  }

  function renderDetail(m) {
    if (!detailPanelEl) return;

    if (clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }

    const isOngoing = m.category === "ongoing";
    const badgeColor =
      m.statusClass === "crewed"
        ? "badge-crewed"
        : m.statusClass === "active"
          ? "badge-ongoing"
          : "badge-future";

    // Build timeline items HTML
    let timelineHtml = "";
    if (m.timeline && m.timeline.length > 0) {
      timelineHtml = `
        <div class="detail-section">
          <div class="detail-section-title">MISSION FLIGHT TRAJECTORY</div>
          <div class="timeline-stepper">
            ${m.timeline
              .map(
                (step, idx) => `
              <div class="timeline-step">
                <div class="step-marker">
                  <span class="step-num">${idx + 1}</span>
                </div>
                <div class="step-content">
                  <div class="step-phase-row">
                    <span class="step-phase">${step.phase}</span>
                    <span class="step-date">${step.date}</span>
                  </div>
                  <p class="step-detail">${step.detail}</p>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
    }

    // Build specs HTML
    let specsHtml = "";
    if (m.specs) {
      specsHtml = `
        <div class="detail-section">
          <div class="detail-section-title">TECHNICAL ARCHITECTURE & PAYLOAD</div>
          <div class="dossier-specs-grid" style="margin-top: 0.5rem;">
            ${Object.entries(m.specs)
              .map(
                ([key, val]) => `
              <div class="spec-cell">
                <span class="spec-lbl">${formatCamelCase(key)}</span>
                <div class="spec-val">${val}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
    }

    detailPanelEl.innerHTML = `
      <div class="detail-sticky-wrap">
        <div class="detail-top-bar">
          <span class="fmc-badge ${badgeColor}">${m.statusBadge}</span>
          <span class="detail-agency-pill">${m.agency} · ${m.status}</span>
        </div>

        <h2 class="detail-title">${m.name}</h2>
        <div class="detail-destination-bar">
          <span class="dest-target">🎯 ${m.target}</span>
          <span class="dest-launch">🚀 ${isOngoing ? "Launched" : "Scheduled"}: ${m.launchDate}</span>
        </div>

        <!-- Dynamic Clock Widget -->
        <div class="mission-clock-widget" id="missionClock">
          <div class="clock-label">
            <span class="live-dot" style="${isOngoing ? "" : "background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"}"></span>
            ${isOngoing ? "MISSION ELAPSED FLIGHT TIME" : "ESTIMATED LAUNCH WINDOW COUNTDOWN"}
          </div>
          <div class="clock-digits" id="clockDigits">Calculating telemetry…</div>
        </div>

        <div class="dossier-quote-block">
          <p class="dossier-quote">${m.quote}</p>
          <cite class="dossier-cite">${m.cite}</cite>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">MISSION OVERVIEW</div>
          <p class="detail-prose">${m.description}</p>
        </div>

        ${timelineHtml}
        ${specsHtml}

        <div class="detail-action-footer">
          <a href="${m.externalUrl}" target="_blank" rel="noreferrer" class="button button-primary">
            Explore Official NASA / Agency Dossier ↗
          </a>
          <a href="ask.html" class="button button-quiet">
            Ask Machine AI About ${m.name} ↗
          </a>
        </div>
      </div>
    `;

    // Initialize the live clock
    updateMissionClock(m);
    clockInterval = setInterval(() => updateMissionClock(m), 1000);
  }

  function updateMissionClock(m) {
    const clockDigitsEl = document.getElementById("clockDigits");
    if (!clockDigitsEl) return;

    const isOngoing = m.category === "ongoing";
    const dateStr = m.launchDate;
    const targetDate = new Date(dateStr);

    if (isNaN(targetDate.getTime())) {
      // If approximate date like "September 2026"
      clockDigitsEl.textContent = `${m.launchDate} · In Active Flight Operations`;
      return;
    }

    const now = new Date();
    const diffMs = isOngoing ? now - targetDate : targetDate - now;

    if (diffMs <= 0 && !isOngoing) {
      clockDigitsEl.textContent = "LAUNCH WINDOW ACTIVE";
      return;
    }

    const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, "0");
    const prefix = isOngoing ? "T+" : "T-";

    clockDigitsEl.innerHTML = `
      <span class="clock-unit-group"><span class="clock-num">${days}</span><span class="clock-sub">DAYS</span></span>
      <span class="clock-sep">:</span>
      <span class="clock-unit-group"><span class="clock-num">${pad(hours)}</span><span class="clock-sub">HRS</span></span>
      <span class="clock-sep">:</span>
      <span class="clock-unit-group"><span class="clock-num">${pad(minutes)}</span><span class="clock-sub">MIN</span></span>
      <span class="clock-sep">:</span>
      <span class="clock-unit-group"><span class="clock-num">${pad(seconds)}</span><span class="clock-sub">SEC</span></span>
    `;
  }

  function renderEmptyState() {
    if (!detailPanelEl) return;
    detailPanelEl.innerHTML = `
      <div class="empty-search-state" style="padding: 4rem 2rem;">
        <h3>No Mission Selected</h3>
        <p>Select a mission from the list to inspect its flight timeline, technical payload, and telemetry.</p>
      </div>
    `;
  }

  function formatCamelCase(str) {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }

  function getFallbackMissions() {
    return [
      {
        id: "europa-clipper",
        name: "Europa Clipper",
        agency: "NASA",
        category: "ongoing",
        target: "Jupiter's Moon Europa",
        destinationType: "ocean-worlds",
        launchDate: "October 14, 2024",
        status: "In Transit to Jupiter",
        statusBadge: "ONGOING IN TRANSIT",
        statusClass: "active",
        summary: "Investigating whether Europa's subsurface global ocean could harbor life.",
        quote: "“We are voyagers across the dark, seeking an ocean beneath the ice.”",
        cite: "— Engraved on the spacecraft vault",
        description: "Equipped with ice-penetrating radar and mass spectrometers to survey Europa's ice shell and potential water plumes across 49 precision flybys.",
        specs: {
          launchVehicle: "SpaceX Falcon Heavy",
          powerSource: "Massive 30.5m Solar Arrays",
          arrival: "April 2030"
        },
        timeline: [
          { phase: "Launch", date: "Oct 2024", detail: "Successful liftoff from Florida" },
          { phase: "Jupiter Arrival", date: "Apr 2030", detail: "Jupiter Orbit Insertion" }
        ],
        externalUrl: "https://europa.nasa.gov/"
      }
    ];
  }

  // Load when DOM is ready
  document.addEventListener("DOMContentLoaded", loadMissions);
})();
