// ============================================================
// 3D ORBITAL GRAVEYARD & SOLAR SYSTEM MAP (Three.js Engine)
// ============================================================

(function () {
  const container = document.getElementById("graveyardContainer");
  if (!container) return;

  // Spacecraft Catalog
  const FLEET = [
    {
      id: "voyager1",
      name: "Voyager 1",
      status: "monument",
      statusLabel: "SILENT INTERSTELLAR MONUMENT",
      era: "Launched 1977 · Interstellar Space",
      distanceAu: 163.2,
      distanceKm: "24.4 billion km",
      orbitType: "Hyperbolic Interstellar Escape",
      lastContact: "Active Telemetry Carrier · Power dying ~2025-2028",
      quote: "“The pale blue dot: that's here, that's home, that's us.”",
      cite: "— Carl Sagan on Voyager 1's portrait of Earth",
      description: "Humanity's most distant human-made artifact. Having explored Jupiter and Saturn, it crossed the heliopause in 2012 into interstellar space, carrying the Golden Record.",
      color: 0xf87171,
      orbitRadius: 95,
      angle: 0.85,
      speed: 0.0001
    },
    {
      id: "voyager2",
      name: "Voyager 2",
      status: "monument",
      statusLabel: "SILENT INTERSTELLAR MONUMENT",
      era: "Launched 1977 · Interstellar Space",
      distanceAu: 136.5,
      distanceKm: "20.4 billion km",
      orbitType: "Hyperbolic Interstellar Escape (Southern)",
      lastContact: "Periodic Engineering Beacon",
      quote: "“The only spacecraft to explore Neptune, Uranus, Saturn, and Jupiter.”",
      cite: "— NASA JPL Grand Tour mission debrief",
      description: "Carried out humanity's historic 'Grand Tour' of all four outer gas and ice giants before piercing the southern heliosphere boundary into the galactic void.",
      color: 0xf87171,
      orbitRadius: 82,
      angle: 3.4,
      speed: 0.0001
    },
    {
      id: "new_horizons",
      name: "New Horizons",
      status: "monument",
      statusLabel: "DEEP KUIPER BELT DRIFTER",
      era: "Launched 2006 · Kuiper Belt",
      distanceAu: 58.4,
      distanceKm: "8.7 billion km",
      orbitType: "Solar Escape Trajectory",
      lastContact: "Kuiper Belt Extended Science Campaign",
      quote: "“Pluto was not a cold dead ball—it had a beating nitrogen ice heart.”",
      cite: "— Alan Stern, New Horizons Principal Investigator",
      description: "The fastest spacecraft at launch. Captured the first high-resolution portraits of Pluto and Charon in 2015, followed by contact binary Arrokoth, now coasting toward interstellar space.",
      color: 0xf87171,
      orbitRadius: 68,
      angle: 1.95,
      speed: 0.0003
    },
    {
      id: "kepler",
      name: "Kepler Space Telescope",
      status: "monument",
      statusLabel: "EARTH-TRAILING DRIFTING MONUMENT",
      era: "2009 — 2018 · Heliocentric Orbit",
      distanceAu: 1.05,
      distanceKm: "157 million km",
      orbitType: "Earth-Trailing Heliocentric Orbit",
      lastContact: "October 30, 2018 (Hydrazine exhausted)",
      quote: "“Goodnight, planet hunter. You showed us the sky is full of worlds.”",
      cite: "— NASA Astrophysics retirement broadcast",
      description: "Kepler stared at 150,000 stars, discovering 2,662 confirmed exoplanets and proving that planets outnumber stars in the Milky Way. It now drifts silently in solar orbit forever.",
      color: 0xf87171,
      orbitRadius: 26,
      angle: 4.8,
      speed: 0.0016
    },
    {
      id: "spitzer",
      name: "Spitzer Space Telescope",
      status: "monument",
      statusLabel: "SILENT INFRARED SENTINEL",
      era: "2003 — 2020 · Heliocentric Orbit",
      distanceAu: 1.82,
      distanceKm: "272 million km",
      orbitType: "Earth-Trailing Solar Orbit",
      lastContact: "January 30, 2020 (Decommissioning signal sent)",
      quote: "“Revealing the cold, dusty, hidden infrared universe for 16 years.”",
      cite: "— NASA Jet Propulsion Laboratory",
      description: "Discovered the TRAPPIST-1 system of seven Earth-sized exoplanets and peered through dust clouds to watch baby stars form. Drifts silently behind Earth, falling further behind each year.",
      color: 0xf87171,
      orbitRadius: 28,
      angle: 5.4,
      speed: 0.0014
    },
    {
      id: "dawn",
      name: "Dawn",
      status: "monument",
      statusLabel: "PERMANENT ORBITAL MONUMENT AT CERES",
      era: "2007 — 2018 · Main Asteroid Belt",
      distanceAu: 2.77,
      distanceKm: "414 million km",
      orbitType: "Ceres Gravitational Capture",
      lastContact: "October 31, 2018 (Hydrazine depletion)",
      quote: "“A silent satellite around Ceres for decades to come.”",
      cite: "— NASA Planetary Science Division",
      description: "The first spacecraft to orbit two separate extraterrestrial bodies (giant asteroid Vesta and dwarf planet Ceres). Now a permanent derelict satellite around Ceres.",
      color: 0xf87171,
      orbitRadius: 36,
      angle: 2.3,
      speed: 0.0011
    },
    {
      id: "rosetta",
      name: "Rosetta & Philae",
      status: "monument",
      statusLabel: "COMET GRAVEYARD RESIDENT",
      era: "2004 — 2016 · Comet 67P / Churyumov–Gerasimenko",
      distanceAu: 3.5,
      distanceKm: "523 million km",
      orbitType: "Comet 67P Surface Resting Place",
      lastContact: "September 30, 2016 (Controlled descent into comet)",
      quote: "“Sleep tight, Philae. Sleep tight, Rosetta. You made history.”",
      cite: "— European Space Agency (ESA) Flight Control",
      description: "First mission to escort a comet around the Sun and land a module (Philae) on its surface. Rosetta concluded its journey by descending onto the comet itself, where both now ride through eternity.",
      color: 0xf87171,
      orbitRadius: 42,
      angle: 0.45,
      speed: 0.0009
    },
    {
      id: "cassini",
      name: "Cassini-Huygens",
      status: "monument",
      statusLabel: "VAPORIZED INTO SATURN · ATOMIC LEGACY",
      era: "1997 — 2017 · Saturn Atmosphere",
      distanceAu: 9.58,
      distanceKm: "1.43 billion km",
      orbitType: "Atmospheric Disposal (Preserving Enceladus)",
      lastContact: "September 15, 2017 (Grand Finale plunge)",
      quote: "“To protect pristine icy worlds, we became part of Saturn forever.”",
      cite: "— Cassini Grand Finale memorial plaque",
      description: "Discovered ocean geysers erupting from Enceladus and methane seas on Titan. Intentionally dived into Saturn's atmosphere to protect potential extraterrestrial microbes, becoming part of the planet.",
      color: 0xf87171,
      orbitRadius: 56,
      angle: 1.1,
      speed: 0.0004
    },
    {
      id: "opportunity",
      name: "Opportunity Rover (MER-B)",
      status: "monument",
      statusLabel: "MARS SURFACE MONUMENT",
      era: "2004 — 2018 · Meridiani Planum, Mars",
      distanceAu: 1.52,
      distanceKm: "228 million km",
      orbitType: "Mars Surface Ground Station",
      lastContact: "June 10, 2018 (Martian planet-encircling dust storm)",
      quote: "“My battery is low and it's getting dark.”",
      cite: "— Rover final status summary by Jacob Margolis",
      description: "Built for 90 days; drove for 14.8 years across 45 kilometers of Martian sand and craters, discovering proof of ancient liquid water.",
      color: 0xf87171,
      orbitRadius: 31,
      angle: 3.1,
      speed: 0.0013
    },
    // Active Sentinels
    {
      id: "jwst",
      name: "James Webb Space Telescope (JWST)",
      status: "active",
      statusLabel: "ACTIVE FLAGSHIP OBSERVATORY",
      era: "Launched Dec 2021 · Sun-Earth L2 Lagrange",
      distanceAu: 1.01,
      distanceKm: "1.5 million km from Earth",
      orbitType: "Halo Orbit around Sun-Earth L2",
      lastContact: "Actively Transmitting · Deep Space Network",
      quote: "“Unfolding the infrared dawn of the universe.”",
      cite: "— NASA / ESA / CSA joint astrophysics mission",
      description: "The premier space science observatory. Operating with a 6.5-meter beryllium primary mirror and tennis-court sized sunshield, peering back 13.5 billion years to the first galaxies.",
      color: 0xd2f843,
      orbitRadius: 25.5,
      angle: 2.1,
      speed: 0.0017
    },
    {
      id: "perseverance",
      name: "Perseverance Rover & Ingenuity",
      status: "active",
      statusLabel: "ACTIVE MARS EXPLORER",
      era: "Landed Feb 2021 · Jezero Crater, Mars",
      distanceAu: 1.52,
      distanceKm: "228 million km",
      orbitType: "Mars Surface Exploration",
      lastContact: "Daily UHF relay via Mars Reconnaissance Orbiter",
      quote: "“Dare mighty things.”",
      cite: "— Binary message encoded in parachute",
      description: "Drilling ancient river delta sediments in Jezero crater, packaging core samples for Mars Sample Return, and deployed the Ingenuity helicopter for 72 flights.",
      color: 0xd2f843,
      orbitRadius: 31,
      angle: 2.9,
      speed: 0.0013
    },
    {
      id: "curiosity",
      name: "Curiosity Rover (MSL)",
      status: "active",
      statusLabel: "ACTIVE MARS LABORATORY",
      era: "Landed Aug 2012 · Gale Crater, Mars",
      distanceAu: 1.52,
      distanceKm: "228 million km",
      orbitType: "Mars Surface Exploration",
      lastContact: "Actively Transmitting",
      quote: "“Climbing Mount Sharp, reading rocks layer by layer.”",
      cite: "— Curiosity Science Operations team",
      description: "Powered by a nuclear RTG, Curiosity has been exploring Gale Crater for over 12 years, confirming ancient fresh-water lake beds and organic building blocks.",
      color: 0xd2f843,
      orbitRadius: 31,
      angle: 3.3,
      speed: 0.0013
    },
    {
      id: "parker",
      name: "Parker Solar Probe",
      status: "active",
      statusLabel: "ACTIVE SOLAR CORONAL EXPLORER",
      era: "Launched 2018 · Inner Heliosphere",
      distanceAu: 0.05,
      distanceKm: "7.2 million km from Sun",
      orbitType: "Perihelion Coronal Dives (Record Speed: 690,000 km/h)",
      lastContact: "Actively Transmitting",
      quote: "“Touching the Sun: plunging through temperatures exceeding 1,000,000°C.”",
      cite: "— Johns Hopkins Applied Physics Laboratory",
      description: "Humanity's fastest moving vehicle. Repeatedly dives directly into the Sun's corona to solve the mystery of why the solar corona is hundreds of times hotter than the surface.",
      color: 0xd2f843,
      orbitRadius: 8,
      angle: 1.4,
      speed: 0.0045
    },
    {
      id: "osiris_apex",
      name: "OSIRIS-APEX",
      status: "active",
      statusLabel: "ACTIVE ASTEROID INTERCEPTOR",
      era: "Extended Mission · Heliocentric Transit",
      distanceAu: 1.15,
      distanceKm: "172 million km",
      orbitType: "Apophis Intercept Trajectory",
      lastContact: "Actively Transmitting",
      quote: "“Sample returned from Bennu; next stop: Asteroid 99942 Apophis.”",
      cite: "— NASA Goddard Space Flight Center",
      description: "After returning 250 grams of pristine asteroid Bennu rocks to Earth in 2023, the spacecraft was redirected to intercept massive near-Earth asteroid Apophis during its 2029 close approach.",
      color: 0xd2f843,
      orbitRadius: 27,
      angle: 0.9,
      speed: 0.0015
    },
    {
      id: "bepicolombo",
      name: "BepiColombo",
      status: "active",
      statusLabel: "ACTIVE EN ROUTE TO MERCURY",
      era: "Launched 2018 · Inner Solar System",
      distanceAu: 0.45,
      distanceKm: "67 million km",
      orbitType: "Gravity Assist Trajectory to Mercury Orbit",
      lastContact: "Actively Transmitting (ESA / JAXA)",
      quote: "“Using planetary flybys to brake into Mercury's intense gravity well.”",
      cite: "— ESA Operations Centre (ESOC)",
      description: "Joint European-Japanese mission carrying two scientific orbiters to unravel Mercury's core, magnetic dynamo, and mysterious polar ice craters.",
      color: 0xd2f843,
      orbitRadius: 14,
      angle: 4.1,
      speed: 0.0028
    }
  ];

  // Planets for background context
  const PLANETS = [
    { name: "Sun", r: 0, size: 2.8, color: 0xffe066, glow: 0xffaa00 },
    { name: "Mercury", r: 12, size: 0.6, color: 0xa8a8a8, speed: 0.0035 },
    { name: "Venus", r: 18, size: 0.9, color: 0xe3bb76, speed: 0.0025 },
    { name: "Earth", r: 25, size: 1.0, color: 0x4da6ff, speed: 0.0018 },
    { name: "Mars", r: 31, size: 0.75, color: 0xdf5a3c, speed: 0.0013 },
    { name: "Jupiter", r: 48, size: 2.0, color: 0xdca876, speed: 0.0006 },
    { name: "Saturn", r: 60, size: 1.7, color: 0xf5dfa0, rings: true, speed: 0.0004 },
    { name: "Heliopause", r: 90, isRingOnly: true, color: 0x38bdf8 }
  ];

  // Three.js State
  let scene, camera, renderer, controls;
  let craftMeshes = [];
  let planetMeshes = [];
  let orbitLines = [];
  let simSpeed = 1;
  let activeFilter = "all";
  let selectedCraft = null;
  let isAudioPlaying = false;
  let audioContext = null;
  let synthGain = null;
  let synthOsc = null;

  // DOM Elements
  const dossierCard = document.getElementById("spacecraftDossier");
  const dossierCloseBtn = document.getElementById("dossierCloseBtn");
  const rosterListEl = document.getElementById("rosterList");
  const hudTargetEl = document.getElementById("hudTargetName");
  const hudSubEl = document.getElementById("hudTargetSub");
  const audioBtn = document.getElementById("audioToggleBtn");
  const countMonumentsEl = document.getElementById("countMonuments");
  const countActiveEl = document.getElementById("countActive");

  // Check if THREE is loaded
  if (typeof THREE === "undefined") {
    container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--muted);">Loading 3D Engine...</div>`;
    return;
  }

  function initThree() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020409, 0.004);

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    camera.position.set(0, 110, 150);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    if (typeof THREE.OrbitControls !== "undefined") {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxDistance = 450;
      controls.minDistance = 15;
      controls.maxPolarAngle = Math.PI / 2 + 0.15;
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0x223355, 1.2);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xfff6dd, 2.5, 350);
    scene.add(sunPointLight);

    buildStarfield();
    buildPlanets();
    buildSpacecraft();
    buildRoster();
    updateStatCounts();

    // Event Listeners
    window.addEventListener("resize", onWindowResize);
    renderer.domElement.addEventListener("click", onCanvasClick);

    setupFilters();
    setupSpeedControls();
    setupAudioSynth();

    animate();
  }

  // Starfield
  function buildStarfield() {
    const starCount = 2800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 400 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);

      const tone = Math.random();
      if (tone > 0.8) {
        colors[i] = 0.85; colors[i + 1] = 0.95; colors[i + 2] = 1.0; // Cool white/blue
      } else if (tone > 0.6) {
        colors[i] = 1.0; colors[i + 1] = 0.85; colors[i + 2] = 0.6; // Amber
      } else {
        colors[i] = 0.8; colors[i + 1] = 0.8; colors[i + 2] = 0.8; // White
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starMesh = new THREE.Points(geometry, material);
    scene.add(starMesh);
  }

  // Planetary Bodies & Orbit Rings
  function buildPlanets() {
    PLANETS.forEach((p) => {
      // Orbit Ring
      if (p.r > 0) {
        const ringGeo = new THREE.BufferGeometry();
        const segments = 128;
        const positions = new Float32Array((segments + 1) * 3);

        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          positions[i * 3] = Math.cos(theta) * p.r;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = Math.sin(theta) * p.r;
        }
        ringGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const isHeliopause = p.isRingOnly;
        const ringMat = new THREE.LineBasicMaterial({
          color: isHeliopause ? 0x38bdf8 : 0xffffff,
          transparent: true,
          opacity: isHeliopause ? 0.35 : 0.08,
          linewidth: 1
        });

        const orbitLine = new THREE.Line(ringGeo, ringMat);
        scene.add(orbitLine);
        orbitLines.push(orbitLine);
      }

      if (p.isRingOnly) return;

      // Planet Mesh
      const sphereGeo = new THREE.SphereGeometry(p.size, 24, 24);
      let mat;

      if (p.r === 0) {
        // Sun
        mat = new THREE.MeshBasicMaterial({ color: p.color });
        // Sun Glow
        const glowGeo = new THREE.SphereGeometry(p.size * 1.45, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color: p.glow,
          transparent: true,
          opacity: 0.35
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        scene.add(glowMesh);
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: 0.8,
          metalness: 0.1
        });
      }

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(p.r, 0, 0);
      mesh.userData = { ...p, currentAngle: Math.random() * Math.PI * 2 };
      scene.add(mesh);
      planetMeshes.push(mesh);

      // Saturn Rings
      if (p.rings) {
        const satRingGeo = new THREE.RingGeometry(p.size * 1.4, p.size * 2.3, 32);
        const satRingMat = new THREE.MeshBasicMaterial({
          color: 0xc8b482,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5
        });
        const satRing = new THREE.Mesh(satRingGeo, satRingMat);
        satRing.rotation.x = Math.PI / 2.3;
        mesh.add(satRing);
      }
    });
  }

  // Spacecraft Fleet (Beacons & Trajectories)
  function buildSpacecraft() {
    FLEET.forEach((craft) => {
      const group = new THREE.Group();

      // Core Marker
      const coreGeo = new THREE.SphereGeometry(0.85, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: craft.color });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // Glowing Halo Ring
      const haloGeo = new THREE.RingGeometry(1.2, 1.6, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: craft.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      group.add(haloMesh);

      // Set position along orbit
      const posX = Math.cos(craft.angle) * craft.orbitRadius;
      const posZ = Math.sin(craft.angle) * craft.orbitRadius;
      const posY = (Math.random() - 0.5) * 4; // Slight 3D inclination

      group.position.set(posX, posY, posZ);
      group.userData = { ...craft, currentAngle: craft.angle, haloMesh };

      scene.add(group);
      craftMeshes.push(group);

      // Subtly trace custom flight path for escape craft
      if (craft.distanceAu > 50) {
        const pathGeo = new THREE.BufferGeometry();
        const pts = [];
        const startX = Math.cos(craft.angle) * 25;
        const startZ = Math.sin(craft.angle) * 25;
        pts.push(new THREE.Vector3(startX, 0, startZ));
        pts.push(new THREE.Vector3(posX, posY, posZ));
        pathGeo.setFromPoints(pts);

        const pathMat = new THREE.LineDashedMaterial({
          color: craft.color,
          dashSize: 1.5,
          gapSize: 1.5,
          transparent: true,
          opacity: 0.35
        });
        const pathLine = new THREE.Line(pathGeo, pathMat);
        pathLine.computeLineDistances();
        scene.add(pathLine);
      }
    });
  }

  // Filter Spacecraft Visibility
  function setupFilters() {
    const filterBtns = document.querySelectorAll(".gy-filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        activeFilter = btn.dataset.filter;
        applyFilter();
      });
    });
  }

  function applyFilter() {
    craftMeshes.forEach((mesh) => {
      const isMonument = mesh.userData.status === "monument";
      const isActive = mesh.userData.status === "active";

      if (activeFilter === "all") {
        mesh.visible = true;
      } else if (activeFilter === "monuments") {
        mesh.visible = isMonument;
      } else if (activeFilter === "active") {
        mesh.visible = isActive;
      }
    });

    // Update roster active items
    const rosterItems = document.querySelectorAll(".roster-item");
    rosterItems.forEach((item) => {
      const craftId = item.dataset.id;
      const data = FLEET.find((f) => f.id === craftId);
      if (!data) return;

      if (activeFilter === "all") {
        item.style.display = "flex";
      } else if (activeFilter === "monuments") {
        item.style.display = data.status === "monument" ? "flex" : "none";
      } else if (activeFilter === "active") {
        item.style.display = data.status === "active" ? "flex" : "none";
      }
    });
  }

  // Build Right-Side Roster
  function buildRoster() {
    if (!rosterListEl) return;
    rosterListEl.innerHTML = "";

    FLEET.forEach((craft) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "roster-item";
      item.dataset.id = craft.id;

      const dotClass = craft.status === "monument" ? "dot-monument" : "dot-active";

      item.innerHTML = `
        <div>
          <span class="roster-name">${craft.name}</span>
          <span class="roster-dest">${craft.distanceAu} AU · ${craft.orbitType.split(" ")[0]}</span>
        </div>
        <span class="roster-status-dot ${dotClass}"></span>
      `;

      item.addEventListener("click", () => {
        focusOnCraft(craft.id);
      });

      rosterListEl.appendChild(item);
    });
  }

  function updateStatCounts() {
    const monuments = FLEET.filter((f) => f.status === "monument").length;
    const active = FLEET.filter((f) => f.status === "active").length;
    if (countMonumentsEl) countMonumentsEl.textContent = String(monuments).padStart(2, "0");
    if (countActiveEl) countActiveEl.textContent = String(active).padStart(2, "0");
  }

  // Focus and Zoom Camera onto Selected Spacecraft
  function focusOnCraft(craftId) {
    const targetMesh = craftMeshes.find((m) => m.userData.id === craftId);
    if (!targetMesh) return;

    selectedCraft = targetMesh.userData;

    // Highlight in roster
    document.querySelectorAll(".roster-item").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.id === craftId);
    });

    // Update HUD
    if (hudTargetEl) hudTargetEl.textContent = selectedCraft.name;
    if (hudSubEl) hudSubEl.textContent = `${selectedCraft.distanceAu} AU (${selectedCraft.distanceKm}) · ${selectedCraft.statusLabel}`;

    // Smooth camera target reposition
    if (controls) {
      const targetPos = targetMesh.position;
      controls.target.set(targetPos.x, targetPos.y, targetPos.z);
      camera.position.set(targetPos.x + 8, targetPos.y + 10, targetPos.z + 14);
      controls.update();
    }

    openDossier(selectedCraft);
  }

  // Open Spacecraft Dossier Modal Card
  function openDossier(craft) {
    if (!dossierCard) return;

    const isMonument = craft.status === "monument";
    const badgeText = isMonument ? "SILENT MONUMENT" : "ACTIVE SENTINEL";
    const badgeStyle = isMonument
      ? "border-color: #f87171; color: #f87171; background: rgba(248, 113, 113, 0.1);"
      : "border-color: var(--accent); color: var(--accent); background: rgba(210, 248, 67, 0.1);";

    document.getElementById("dossierEyebrow").textContent = craft.era;
    const badgeEl = document.getElementById("dossierBadge");
    badgeEl.textContent = badgeText;
    badgeEl.style.cssText = badgeStyle;

    document.getElementById("dossierTitle").textContent = craft.name;
    document.getElementById("dossierDesc").textContent = craft.description;
    document.getElementById("dossierQuote").textContent = craft.quote;
    document.getElementById("dossierCite").textContent = craft.cite;

    document.getElementById("specDistanceAu").textContent = `${craft.distanceAu} AU`;
    document.getElementById("specDistanceKm").textContent = craft.distanceKm;
    document.getElementById("specOrbitType").textContent = craft.orbitType;
    document.getElementById("specLastContact").textContent = craft.lastContact;

    dossierCard.classList.add("is-open");
  }

  if (dossierCloseBtn) {
    dossierCloseBtn.addEventListener("click", () => {
      dossierCard.classList.remove("is-open");
    });
  }

  // Raycast Clicks on Canvas
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onCanvasClick(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check spacecraft hits
    const interactiveObjects = [];
    craftMeshes.forEach((g) => {
      if (g.visible) {
        g.children.forEach((c) => interactiveObjects.push(c));
      }
    });

    const intersects = raycaster.intersectObjects(interactiveObjects, false);
    if (intersects.length > 0) {
      const hitGroup = intersects[0].object.parent;
      if (hitGroup && hitGroup.userData && hitGroup.userData.id) {
        focusOnCraft(hitGroup.userData.id);
      }
    }
  }

  // Speed Controls
  function setupSpeedControls() {
    const speedChips = document.querySelectorAll(".speed-chip");
    speedChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        speedChips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        simSpeed = Number(chip.dataset.speed) || 1;
      });
    });

    // Reset Camera Button
    const resetBtn = document.getElementById("resetCamBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (controls) {
          controls.target.set(0, 0, 0);
          camera.position.set(0, 110, 150);
          controls.update();
        }
        if (hudTargetEl) hudTargetEl.textContent = "Solar System (Sun Centered)";
        if (hudSubEl) hudSubEl.textContent = "Viewing 15 landmark probes & silent monuments";
        dossierCard.classList.remove("is-open");
        document.querySelectorAll(".roster-item").forEach((el) => el.classList.remove("is-selected"));
      });
    }
  }

  // Web Audio Deep-Space Ambient Drone Sonification
  function setupAudioSynth() {
    if (!audioBtn) return;

    audioBtn.addEventListener("click", () => {
      if (!isAudioPlaying) {
        startSpaceAudio();
        audioBtn.classList.add("active-audio");
        audioBtn.innerHTML = `<span>🔊</span> <span>Sonification: ON</span>`;
        isAudioPlaying = true;
      } else {
        stopSpaceAudio();
        audioBtn.classList.remove("active-audio");
        audioBtn.innerHTML = `<span>🔇</span> <span>Sonification: OFF</span>`;
        isAudioPlaying = false;
      }
    });
  }

  function startSpaceAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();

      // Master Gain
      synthGain = audioContext.createGain();
      synthGain.gain.setValueAtTime(0.08, audioContext.currentTime);

      // Low Celestial Drone (55 Hz base root frequency)
      synthOsc = audioContext.createOscillator();
      synthOsc.type = "sine";
      synthOsc.frequency.setValueAtTime(55, audioContext.currentTime);

      // Sub-harmonic oscillator for deep space warmth
      const subOsc = audioContext.createOscillator();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(110, audioContext.currentTime);

      // Subtle frequency modulation
      const lfo = audioContext.createOscillator();
      lfo.frequency.setValueAtTime(0.2, audioContext.currentTime);
      const lfoGain = audioContext.createGain();
      lfoGain.gain.setValueAtTime(4, audioContext.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(synthOsc.frequency);

      synthOsc.connect(synthGain);
      subOsc.connect(synthGain);
      synthGain.connect(audioContext.destination);

      synthOsc.start();
      subOsc.start();
      lfo.start();
    } catch (e) {
      console.warn("Web Audio could not initialize:", e);
    }
  }

  function stopSpaceAudio() {
    if (audioContext && audioContext.state !== "closed") {
      audioContext.close();
      audioContext = null;
    }
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Orbit planetary bodies
    planetMeshes.forEach((mesh) => {
      if (mesh.userData.r > 0 && mesh.userData.speed) {
        mesh.userData.currentAngle += mesh.userData.speed * simSpeed;
        mesh.position.x = Math.cos(mesh.userData.currentAngle) * mesh.userData.r;
        mesh.position.z = Math.sin(mesh.userData.currentAngle) * mesh.userData.r;
      }
      mesh.rotation.y += 0.01;
    });

    // Orbit Spacecraft & Pulse Halos
    const time = clock.getElapsedTime();
    craftMeshes.forEach((g) => {
      if (g.userData.speed) {
        g.userData.currentAngle += g.userData.speed * simSpeed;
        g.position.x = Math.cos(g.userData.currentAngle) * g.userData.orbitRadius;
        g.position.z = Math.sin(g.userData.currentAngle) * g.userData.orbitRadius;
      }

      // Gentle pulsing on halo
      if (g.userData.haloMesh) {
        const pulse = 1 + Math.sin(time * 3 + g.userData.currentAngle) * 0.25;
        g.userData.haloMesh.scale.set(pulse, pulse, 1);
      }
    });

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  // Start initialization
  initThree();
})();
