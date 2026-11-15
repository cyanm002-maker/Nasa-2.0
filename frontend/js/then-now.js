// ============================================================
// TIME-SCRUBBING DECAY VISUALIZER & COMPARISON ENGINE
// ============================================================

(function () {
  // Current Visualizer Mode: "decay" (Physics Simulation) or "photos" (Archival Slider)
  let currentMode = "decay";
  let activeEnv = "mars";
  let scrubProgress = 0.64; // Default to the historic 2018 dust storm
  let isPlaying = false;
  let playAnimId = null;

  // Environment Physics Models
  const ENV_MODELS = {
    mars: {
      name: "Mars: Opportunity Rover (MER-B)",
      startYear: 2004,
      endYear: 2026,
      startLabel: "Sol 1 (Jan 2004)",
      endLabel: "Sol 8,112 (Nov 2026)",
      milestones: [
        { label: "2004: Touchdown", pos: 0.0 },
        { label: "2005: Dust Devil Cleaning", pos: 0.08 },
        { label: "2007: First Great Storm", pos: 0.16 },
        { label: "2011: Endeavour Crater", pos: 0.35 },
        { label: "2018: The Final Storm", pos: 0.64 },
        { label: "2026: Frozen Monument", pos: 1.0 }
      ],
      calculate(t) {
        const year = 2004 + t * 22;
        const sol = Math.round(1 + t * 8111);

        let tau = 0.6 + Math.sin(t * 14) * 0.15; // baseline dust opacity
        let power = 920 - t * 450; // baseline power degradation
        let dustCover = Math.min(98, t * 105);

        // 2005 cleaning event
        if (t >= 0.06 && t <= 0.1) {
          power += 140;
          dustCover = Math.max(15, dustCover - 25);
        }

        // 2007 global dust storm
        if (t >= 0.14 && t <= 0.18) {
          const stormPeak = Math.sin(((t - 0.14) / 0.04) * Math.PI);
          tau += stormPeak * 3.6;
          power -= stormPeak * 380;
        }

        // Historic 2018 Planet-Encircling Dust Storm (Sol 5,111 / June 2018)
        let isStormActive = false;
        if (t >= 0.62 && t <= 0.67) {
          isStormActive = true;
          const peak = Math.sin(((t - 0.62) / 0.05) * Math.PI);
          tau = 0.8 + peak * 10.2; // Spikes to real recorded 10.8 Tau
          power = Math.max(22, 920 - peak * 898);
          dustCover = Math.min(99, 75 + peak * 24);
        } else if (t > 0.67) {
          // After 2018: Rover frozen forever
          tau = 0.8;
          power = 0;
          dustCover = 98.5;
        }

        return {
          year: year.toFixed(1),
          sol: `Sol ${sol.toLocaleString()}`,
          param1Label: "Atmospheric Tau (Opacity)",
          param1Val: tau.toFixed(2),
          param1Unit: "τ",
          param1Pct: Math.min(100, (tau / 11) * 100),
          param2Label: "Solar Power Generation",
          param2Val: Math.max(0, Math.round(power)),
          param2Unit: "Wh/sol",
          param2Pct: Math.max(0, (power / 950) * 100),
          param3Label: "Array Dust Accumulation",
          param3Val: Math.round(dustCover),
          param3Unit: "%",
          param3Pct: dustCover,
          param4Label: "Thermal Core Temp",
          param4Val: t > 0.67 ? "-96" : "-42",
          param4Unit: "°C",
          param4Pct: t > 0.67 ? 12 : 55,
          isAlert: isStormActive,
          alertText: "⚠️ HISTORIC GLOBAL DUST STORM (TAU 10.8) — SKY BLOTTED OUT"
        };
      }
    },
    moon: {
      name: "The Moon: Apollo 11 / 15 Lunar Module & Rover",
      startYear: 1969,
      endYear: 2026,
      startLabel: "July 1969 (Day 1)",
      endLabel: "Nov 2026 (Day 20,950)",
      milestones: [
        { label: "1969: Touchdown", pos: 0.0 },
        { label: "1975: 75 Lunar Cycles", pos: 0.1 },
        { label: "1985: Foil Delamination", pos: 0.28 },
        { label: "2000: Radiation Bleach", pos: 0.54 },
        { label: "2026: 57 Years Exposed", pos: 1.0 }
      ],
      calculate(t) {
        const year = 1969 + t * 57;
        const cycles = Math.round(t * 685);
        const uvBleach = Math.min(100, t * 115);
        const microCraters = Math.round(t * 1420);
        const radDose = (t * 850).toFixed(1);

        return {
          year: year.toFixed(0),
          sol: `${cycles} Lunar Days / Nights`,
          param1Label: "Day/Night Thermal Cycles",
          param1Val: cycles.toLocaleString(),
          param1Unit: "cycles (-130°C ↔ +120°C)",
          param1Pct: (cycles / 685) * 100,
          param2Label: "Solar UV Bleach & Oxidation",
          param2Val: Math.round(uvBleach),
          param2Unit: "% (Flag Bleached White)",
          param2Pct: uvBleach,
          param3Label: "Micrometeorite Pitting",
          param3Val: microCraters.toLocaleString(),
          param3Unit: "impacts/m²",
          param3Pct: (microCraters / 1420) * 100,
          param4Label: "Cumulative Cosmic Ray Dose",
          param4Val: radDose,
          param4Unit: "krad",
          param4Pct: t * 100,
          isAlert: t > 0.45,
          alertText: "☀️ VACUUM SOLAR ULTRAVIOLET HAS STRIPPED ALL NYLON COLOR PIGMENTS"
        };
      }
    },
    voyager: {
      name: "Interstellar: Voyager 1 Spacecraft",
      startYear: 1977,
      endYear: 2026,
      startLabel: "Sept 1977 (0 AU)",
      endLabel: "Nov 2026 (163.2 AU)",
      milestones: [
        { label: "1977: Liftoff", pos: 0.0 },
        { label: "1990: Pale Blue Dot", pos: 0.26 },
        { label: "2012: Heliopause Crossing", pos: 0.71 },
        { label: "2020: Heater Consolidations", pos: 0.88 },
        { label: "2026: Farthest Vanguard", pos: 1.0 }
      ],
      calculate(t) {
        const year = 1977 + t * 49;
        const distanceAu = (1 + t * 162.2).toFixed(1);
        const distanceKm = ((1.5e8 + t * 24.3e9) / 1e9).toFixed(1);

        // Pu-238 radioactive half-life decay (half-life = 87.7 years)
        const elapsedYears = t * 49;
        const rtgPower = Math.round(470 * Math.pow(0.5, elapsedYears / 87.7));
        const solarLux = (1360 / Math.pow(Math.max(1, distanceAu), 2)).toFixed(3);
        const activeInst = t > 0.7 ? "4 of 10" : t > 0.26 ? "6 of 10" : "10 of 10";

        return {
          year: year.toFixed(0),
          sol: `${distanceAu} AU (${distanceKm}B km)`,
          param1Label: "Nuclear RTG Thermal Power",
          param1Val: rtgPower,
          param1Unit: "Watts (Plutonium Decay)",
          param1Pct: (rtgPower / 470) * 100,
          param2Label: "Solar Light Intensity",
          param2Val: solarLux,
          param2Unit: "W/m² (Near Absolute Void)",
          param2Pct: Math.max(0, 100 - t * 99),
          param3Label: "Operational Instruments",
          param3Val: activeInst,
          param3Unit: "Payload Status",
          param3Pct: (rtgPower / 470) * 100,
          param4Label: "Galactic Cosmic Ray Flux",
          param4Val: t > 0.71 ? "HIGH (INTERSTELLAR)" : "SOLAR SHIELDED",
          param4Unit: "",
          param4Pct: t > 0.71 ? 95 : 30,
          isAlert: t >= 0.71,
          alertText: "🌌 HELIOPAUSE BREACHED — IMMERSED IN GALACTIC COSMIC RAY STREAM"
        };
      }
    }
  };

  // Canvas context & dimensions
  let decayCanvas, decayCtx;
  let graphCanvas, graphCtx;

  // DOM Elements
  const masterRange = document.getElementById("masterDecayRange");
  const yearText = document.getElementById("scrubberYear");
  const solText = document.getElementById("scrubberSol");
  const playBtn = document.getElementById("playTimelapseBtn");
  const milestonesTrack = document.getElementById("milestonesTrack");
  const badgeNameEl = document.getElementById("decayBadgeName");
  const stormAlertEl = document.getElementById("decayStormAlert");

  // HUD Elements
  const dt1Label = document.getElementById("dt1Label");
  const dt1Val = document.getElementById("dt1Val");
  const dt1Unit = document.getElementById("dt1Unit");
  const dt1Fill = document.getElementById("dt1Fill");

  const dt2Label = document.getElementById("dt2Label");
  const dt2Val = document.getElementById("dt2Val");
  const dt2Unit = document.getElementById("dt2Unit");
  const dt2Fill = document.getElementById("dt2Fill");

  const dt3Label = document.getElementById("dt3Label");
  const dt3Val = document.getElementById("dt3Val");
  const dt3Unit = document.getElementById("dt3Unit");
  const dt3Fill = document.getElementById("dt3Fill");

  const dt4Label = document.getElementById("dt4Label");
  const dt4Val = document.getElementById("dt4Val");
  const dt4Unit = document.getElementById("dt4Unit");
  const dt4Fill = document.getElementById("dt4Fill");

  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    decayCanvas = document.getElementById("decaySimulationCanvas");
    if (decayCanvas) decayCtx = decayCanvas.getContext("2d");

    graphCanvas = document.getElementById("decayCurveCanvas");
    if (graphCanvas) graphCtx = graphCanvas.getContext("2d");

    setupViewSwitcher();
    setupEnvSelector();
    setupScrubber();
    setupPhotoSlider();

    resizeCanvases();
    window.addEventListener("resize", () => {
      resizeCanvases();
      renderSimulation();
      renderGraph();
    });

    setEnvironment("mars");
  }

  function resizeCanvases() {
    if (decayCanvas) {
      decayCanvas.width = decayCanvas.parentElement.clientWidth;
      decayCanvas.height = decayCanvas.parentElement.clientHeight;
    }
    if (graphCanvas) {
      graphCanvas.width = graphCanvas.parentElement.clientWidth;
      graphCanvas.height = 140;
    }
  }

  // Switch between Time-Scrubbing Decay Visualizer & Photo Comparison
  function setupViewSwitcher() {
    const tabDecay = document.getElementById("tabViewDecay");
    const tabPhotos = document.getElementById("tabViewPhotos");
    const decaySection = document.getElementById("decayVisualizerSection");
    const photosSection = document.getElementById("photoComparisonSection");

    if (tabDecay && tabPhotos) {
      tabDecay.addEventListener("click", () => {
        currentMode = "decay";
        tabDecay.classList.add("is-active");
        tabPhotos.classList.remove("is-active");
        if (decaySection) decaySection.style.display = "block";
        if (photosSection) photosSection.style.display = "none";
        resizeCanvases();
        renderSimulation();
        renderGraph();
      });

      tabPhotos.addEventListener("click", () => {
        currentMode = "photos";
        tabPhotos.classList.add("is-active");
        tabDecay.classList.remove("is-active");
        if (decaySection) decaySection.style.display = "none";
        if (photosSection) photosSection.style.display = "block";
      });
    }
  }

  // Select Environment (Mars, Moon, Voyager)
  function setupEnvSelector() {
    const envBtns = document.querySelectorAll("[data-env]");
    envBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        envBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        setEnvironment(btn.dataset.env);
      });
    });
  }

  function setEnvironment(envKey) {
    if (!ENV_MODELS[envKey]) return;
    activeEnv = envKey;
    const model = ENV_MODELS[envKey];

    if (badgeNameEl) badgeNameEl.textContent = model.name;

    // Render Milestone Buttons
    if (milestonesTrack) {
      milestonesTrack.innerHTML = "";
      model.milestones.forEach((m) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "milestone-marker";
        btn.textContent = m.label;
        btn.addEventListener("click", () => {
          setScrubberProgress(m.pos);
        });
        milestonesTrack.appendChild(btn);
      });
    }

    setScrubberProgress(activeEnv === "mars" ? 0.64 : 0.5);
  }

  // Master Scrubber Controls
  function setupScrubber() {
    if (masterRange) {
      masterRange.addEventListener("input", (e) => {
        if (isPlaying) stopPlayback();
        setScrubberProgress(Number(e.target.value) / 100);
      });
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (isPlaying) {
          stopPlayback();
        } else {
          startPlayback();
        }
      });
    }
  }

  function setScrubberProgress(progress) {
    scrubProgress = Math.max(0, Math.min(1, progress));
    if (masterRange) masterRange.value = scrubProgress * 100;

    const model = ENV_MODELS[activeEnv];
    const data = model.calculate(scrubProgress);

    if (yearText) yearText.textContent = data.year;
    if (solText) solText.textContent = data.sol;

    // Update Telemetry HUD
    if (dt1Label) dt1Label.textContent = data.param1Label;
    if (dt1Val) dt1Val.textContent = data.param1Val;
    if (dt1Unit) dt1Unit.textContent = data.param1Unit;
    if (dt1Fill) dt1Fill.style.width = `${data.param1Pct}%`;

    if (dt2Label) dt2Label.textContent = data.param2Label;
    if (dt2Val) dt2Val.textContent = data.param2Val;
    if (dt2Unit) dt2Unit.textContent = data.param2Unit;
    if (dt2Fill) dt2Fill.style.width = `${data.param2Pct}%`;

    if (dt3Label) dt3Label.textContent = data.param3Label;
    if (dt3Val) dt3Val.textContent = data.param3Val;
    if (dt3Unit) dt3Unit.textContent = data.param3Unit;
    if (dt3Fill) dt3Fill.style.width = `${data.param3Pct}%`;

    if (dt4Label) dt4Label.textContent = data.param4Label;
    if (dt4Val) dt4Val.textContent = data.param4Val;
    if (dt4Unit) dt4Unit.textContent = data.param4Unit;
    if (dt4Fill) dt4Fill.style.width = `${data.param4Pct}%`;

    // Alert Banner
    if (stormAlertEl) {
      if (data.isAlert) {
        stormAlertEl.style.opacity = "1";
        stormAlertEl.textContent = data.alertText;
      } else {
        stormAlertEl.style.opacity = "0";
      }
    }

    renderSimulation();
    renderGraph();
  }

  // Play / Timelapse Loop
  function startPlayback() {
    isPlaying = true;
    if (playBtn) playBtn.innerHTML = `<span>⏸</span> <span>Pause</span>`;

    function step() {
      if (!isPlaying) return;
      let nextPos = scrubProgress + 0.003;
      if (nextPos > 1) nextPos = 0;
      setScrubberProgress(nextPos);
      playAnimId = requestAnimationFrame(step);
    }
    playAnimId = requestAnimationFrame(step);
  }

  function stopPlayback() {
    isPlaying = false;
    if (playAnimId) cancelAnimationFrame(playAnimId);
    if (playBtn) playBtn.innerHTML = `<span>▶</span> <span>Play Time-Lapse</span>`;
  }

  // ============================================================
  // PHYSICS SIMULATION CANVAS RENDERING
  // ============================================================
  function renderSimulation() {
    if (!decayCtx || !decayCanvas) return;
    const w = decayCanvas.width;
    const h = decayCanvas.height;
    decayCtx.clearRect(0, 0, w, h);

    if (activeEnv === "mars") {
      renderMarsSimulation(w, h);
    } else if (activeEnv === "moon") {
      renderMoonSimulation(w, h);
    } else if (activeEnv === "voyager") {
      renderVoyagerSimulation(w, h);
    }
  }

  // 1. MARS ENVIRONMENT: Dust storms, atmospheric Tau, solar panel dust accumulation
  function renderMarsSimulation(w, h) {
    const data = ENV_MODELS.mars.calculate(scrubProgress);
    const tau = parseFloat(data.param1Val);
    const dustRatio = data.param3Pct / 100;

    // Atmospheric Sky Gradient
    // Normal sky: salmon-pink / butterscotch (#d78458)
    // High Tau (storm): dark chocolate / murky darkness (#0f0603)
    const skyDarkness = Math.min(1, (tau - 0.6) / 8.5);
    const r1 = Math.round(215 * (1 - skyDarkness * 0.92));
    const g1 = Math.round(135 * (1 - skyDarkness * 0.95));
    const b1 = Math.round(95 * (1 - skyDarkness * 0.96));

    const r2 = Math.round(160 * (1 - skyDarkness * 0.9));
    const g2 = Math.round(85 * (1 - skyDarkness * 0.92));
    const b2 = Math.round(55 * (1 - skyDarkness * 0.94));

    const skyGrad = decayCtx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
    skyGrad.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);
    decayCtx.fillStyle = skyGrad;
    decayCtx.fillRect(0, 0, w, h * 0.65);

    // Dim Martian Sun (fading into complete darkness during the storm)
    const sunAlpha = Math.max(0, 1 - skyDarkness * 1.2);
    if (sunAlpha > 0) {
      decayCtx.save();
      decayCtx.globalAlpha = sunAlpha;
      const sunGrad = decayCtx.createRadialGradient(w * 0.72, h * 0.22, 2, w * 0.72, h * 0.22, 45);
      sunGrad.addColorStop(0, "rgba(255, 245, 220, 0.95)");
      sunGrad.addColorStop(0.3, "rgba(220, 150, 100, 0.4)");
      sunGrad.addColorStop(1, "rgba(220, 150, 100, 0)");
      decayCtx.fillStyle = sunGrad;
      decayCtx.beginPath();
      decayCtx.arc(w * 0.72, h * 0.22, 45, 0, Math.PI * 2);
      decayCtx.fill();
      decayCtx.restore();
    }

    // Distant Martian crater rims / ridge-line
    decayCtx.fillStyle = `rgb(${Math.round(130 * (1 - skyDarkness * 0.85))}, ${Math.round(55 * (1 - skyDarkness * 0.85))}, ${Math.round(35 * (1 - skyDarkness * 0.85))})`;
    decayCtx.beginPath();
    decayCtx.moveTo(0, h * 0.55);
    decayCtx.lineTo(w * 0.25, h * 0.51);
    decayCtx.lineTo(w * 0.5, h * 0.54);
    decayCtx.lineTo(w * 0.75, h * 0.49);
    decayCtx.lineTo(w, h * 0.53);
    decayCtx.lineTo(w, h);
    decayCtx.lineTo(0, h);
    decayCtx.fill();

    // Sandy Martian Ground Terrain
    const groundGrad = decayCtx.createLinearGradient(0, h * 0.53, 0, h);
    groundGrad.addColorStop(0, `rgb(${Math.round(180 * (1 - skyDarkness * 0.8))}, ${Math.round(85 * (1 - skyDarkness * 0.8))}, ${Math.round(45 * (1 - skyDarkness * 0.8))})`);
    groundGrad.addColorStop(1, `rgb(${Math.round(110 * (1 - skyDarkness * 0.85))}, ${Math.round(45 * (1 - skyDarkness * 0.85))}, ${Math.round(25 * (1 - skyDarkness * 0.85))})`);
    decayCtx.fillStyle = groundGrad;
    decayCtx.fillRect(0, h * 0.53, w, h * 0.47);

    // Opportunity Rover Hardware Geometry (Center stage)
    const cx = w * 0.5;
    const cy = h * 0.68;

    decayCtx.save();
    // Shadow under rover
    decayCtx.fillStyle = "rgba(10, 5, 2, 0.45)";
    decayCtx.beginPath();
    decayCtx.ellipse(cx, cy + 45, 120, 22, 0, 0, Math.PI * 2);
    decayCtx.fill();

    // Rover Rocker-Bogie Wheels (6 wheels)
    decayCtx.fillStyle = "#2d2d30";
    [-90, -50, -10, 30, 70, 95].forEach((wx, i) => {
      decayCtx.fillRect(cx + wx, cy + 30 + (i % 2) * 5, 16, 20);
      decayCtx.strokeStyle = "#1a1a1a";
      decayCtx.strokeRect(cx + wx, cy + 30 + (i % 2) * 5, 16, 20);
    });

    // Rover Chassis Body
    decayCtx.fillStyle = "#94a3b8";
    decayCtx.fillRect(cx - 65, cy - 5, 130, 38);

    // Mastcam Neck & Camera Head
    decayCtx.strokeStyle = "#64748b";
    decayCtx.lineWidth = 4;
    decayCtx.beginPath();
    decayCtx.moveTo(cx - 30, cy - 5);
    decayCtx.lineTo(cx - 40, cy - 65);
    decayCtx.stroke();

    decayCtx.fillStyle = "#475569";
    decayCtx.fillRect(cx - 52, cy - 75, 24, 14);
    decayCtx.fillStyle = "#38bdf8"; // camera stereo lenses
    decayCtx.beginPath();
    decayCtx.arc(cx - 46, cy - 68, 3, 0, Math.PI * 2);
    decayCtx.arc(cx - 35, cy - 68, 3, 0, Math.PI * 2);
    decayCtx.fill();

    // High Gain Antenna Dish
    decayCtx.fillStyle = "#cbd5e1";
    decayCtx.beginPath();
    decayCtx.ellipse(cx + 35, cy - 25, 18, 14, -0.3, 0, Math.PI * 2);
    decayCtx.fill();

    // ==========================================
    // SOLAR PANELS: GALLIUM ARSENIDE BLUE CELLS
    // ==========================================
    decayCtx.fillStyle = "#1e3a8a"; // Pristine photovoltaic dark blue
    decayCtx.beginPath();
    decayCtx.moveTo(cx - 95, cy - 10);
    decayCtx.lineTo(cx + 95, cy - 10);
    decayCtx.lineTo(cx + 80, cy + 12);
    decayCtx.lineTo(cx - 80, cy + 12);
    decayCtx.closePath();
    decayCtx.fill();
    decayCtx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    decayCtx.lineWidth = 1;
    decayCtx.stroke();

    // Panel grid lines
    decayCtx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    for (let gx = -70; gx <= 70; gx += 20) {
      decayCtx.beginPath();
      decayCtx.moveTo(cx + gx, cy - 10);
      decayCtx.lineTo(cx + gx * 0.85, cy + 12);
      decayCtx.stroke();
    }

    // ==========================================
    // DECAY ACCUMULATION: MARTIAN IRON OXIDE DUST
    // ==========================================
    if (dustRatio > 0) {
      // Dust coating layer on panels
      decayCtx.fillStyle = `rgba(185, 75, 30, ${dustRatio * 0.94})`;
      decayCtx.beginPath();
      decayCtx.moveTo(cx - 95, cy - 10);
      decayCtx.lineTo(cx + 95, cy - 10);
      decayCtx.lineTo(cx + 80, cy + 12);
      decayCtx.lineTo(cx - 80, cy + 12);
      decayCtx.closePath();
      decayCtx.fill();

      // Dust coating across chassis and camera neck
      decayCtx.fillStyle = `rgba(170, 70, 25, ${dustRatio * 0.75})`;
      decayCtx.fillRect(cx - 65, cy - 5, 130, 38);
      decayCtx.fillRect(cx - 52, cy - 75, 24, 14);

      // Procedural dust clumps / wind ripples
      decayCtx.fillStyle = `rgba(215, 95, 45, ${dustRatio * 0.6})`;
      for (let i = 0; i < 25; i++) {
        const dx = cx - 75 + ((i * 19) % 150);
        const dy = cy - 8 + ((i * 7) % 18);
        decayCtx.beginPath();
        decayCtx.arc(dx, dy, 2 + (i % 3), 0, Math.PI * 2);
        decayCtx.fill();
      }
    }

    decayCtx.restore();

    // Active Blowing Dust Particles during storms
    if (tau > 1.2) {
      const particleCount = Math.min(180, Math.round(tau * 18));
      decayCtx.fillStyle = "rgba(220, 110, 50, 0.55)";
      for (let p = 0; p < particleCount; p++) {
        const px = (Date.now() * 0.2 + p * 37) % w;
        const py = (p * 53) % h;
        const pSize = 1.5 + (p % 3);
        decayCtx.fillRect(px, py, pSize * 2, pSize);
      }
    }
  }

  // 2. MOON ENVIRONMENT: Thermal radiation cycles, UV bleaching, micrometeorite cratering
  function renderMoonSimulation(w, h) {
    const data = ENV_MODELS.moon.calculate(scrubProgress);
    const uvBleach = data.param2Pct / 100;
    const craterCount = Math.round(data.param3Pct * 0.6);

    // Deep Black Cosmic Sky with Stars
    decayCtx.fillStyle = "#020409";
    decayCtx.fillRect(0, 0, w, h);

    // Distant Earth in lunar sky
    decayCtx.save();
    const earthGrad = decayCtx.createRadialGradient(w * 0.8, h * 0.18, 5, w * 0.8, h * 0.18, 22);
    earthGrad.addColorStop(0, "#4da6ff");
    earthGrad.addColorStop(0.7, "#1d4ed8");
    earthGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
    decayCtx.fillStyle = earthGrad;
    decayCtx.beginPath();
    decayCtx.arc(w * 0.8, h * 0.18, 22, 0, Math.PI * 2);
    decayCtx.fill();
    decayCtx.restore();

    // Lunar Ground Regolith
    const moonGrad = decayCtx.createLinearGradient(0, h * 0.55, 0, h);
    moonGrad.addColorStop(0, "#475569");
    moonGrad.addColorStop(1, "#1e293b");
    decayCtx.fillStyle = moonGrad;
    decayCtx.fillRect(0, h * 0.55, w, h * 0.45);

    // Apollo Lunar Module Descent Stage (Center)
    const cx = w * 0.5;
    const cy = h * 0.68;

    decayCtx.save();
    // Harsh lunar shadow
    decayCtx.fillStyle = "rgba(0, 0, 0, 0.85)";
    decayCtx.beginPath();
    decayCtx.moveTo(cx - 70, cy + 35);
    decayCtx.lineTo(cx - 160, cy + 65);
    decayCtx.lineTo(cx + 80, cy + 65);
    decayCtx.lineTo(cx + 70, cy + 35);
    decayCtx.fill();

    // Quad Descent Landing Legs & Footpads
    decayCtx.strokeStyle = "#94a3b8";
    decayCtx.lineWidth = 4;
    [
      [-65, 30, -95, 50],
      [65, 30, 95, 50],
      [-30, 30, -45, 50],
      [30, 30, 45, 50]
    ].forEach(([x1, y1, x2, y2]) => {
      decayCtx.beginPath();
      decayCtx.moveTo(cx + x1, cy + y1);
      decayCtx.lineTo(cx + x2, cy + y2);
      decayCtx.stroke();
      decayCtx.fillStyle = "#cbd5e1";
      decayCtx.fillRect(cx + x2 - 8, cy + y2 - 2, 16, 6);
    });

    // Descent Stage Octagonal Body
    // Gold Kapton Foil (shifts to faded oxidized brass as UV bleach increases)
    const goldR = Math.round(234 * (1 - uvBleach * 0.4) + 160 * (uvBleach * 0.4));
    const goldG = Math.round(179 * (1 - uvBleach * 0.4) + 160 * (uvBleach * 0.4));
    const goldB = Math.round(8 * (1 - uvBleach * 0.4) + 160 * (uvBleach * 0.4));
    decayCtx.fillStyle = `rgb(${goldR}, ${goldG}, ${goldB})`;
    decayCtx.fillRect(cx - 55, cy - 25, 110, 55);

    // Foil crinkle details
    decayCtx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    decayCtx.lineWidth = 1;
    for (let f = -40; f <= 40; f += 20) {
      decayCtx.strokeRect(cx + f, cy - 20, 16, 45);
    }

    // Engine Bell Nozzle
    decayCtx.fillStyle = "#1e293b";
    decayCtx.beginPath();
    decayCtx.moveTo(cx - 14, cy + 30);
    decayCtx.lineTo(cx + 14, cy + 30);
    decayCtx.lineTo(cx + 24, cy + 50);
    decayCtx.lineTo(cx - 24, cy + 50);
    decayCtx.closePath();
    decayCtx.fill();

    // ==========================================
    // AMERICAN FLAG: BLEACHING FROM UV EXPOSURE
    // ==========================================
    const flagX = cx + 80;
    const flagY = cy - 20;

    // Flagpole
    decayCtx.strokeStyle = "#e2e8f0";
    decayCtx.lineWidth = 2;
    decayCtx.beginPath();
    decayCtx.moveTo(flagX, flagY + 45);
    decayCtx.lineTo(flagX, flagY - 20);
    decayCtx.lineTo(flagX + 32, flagY - 20);
    decayCtx.stroke();

    // Flag Cloth (red/blue fade into pure white under unshielded vacuum UV)
    const flagR = Math.round(220 + (255 - 220) * uvBleach);
    const flagG = Math.round(50 + (255 - 50) * uvBleach);
    const flagB = Math.round(50 + (255 - 50) * uvBleach);

    decayCtx.fillStyle = `rgb(${flagR}, ${flagG}, ${flagB})`;
    decayCtx.fillRect(flagX + 2, flagY - 18, 30, 20);

    decayCtx.restore();

    // ==========================================
    // MICROMETEORITE IMPACT PITS ON REGOLITH
    // ==========================================
    decayCtx.save();
    for (let c = 0; c < craterCount; c++) {
      const mx = (c * 67 + 31) % w;
      const my = h * 0.58 + ((c * 41) % (h * 0.38));
      const mRad = 1.5 + (c % 4);

      // Crater bowl
      decayCtx.fillStyle = "rgba(15, 23, 42, 0.8)";
      decayCtx.beginPath();
      decayCtx.arc(mx, my, mRad, 0, Math.PI * 2);
      decayCtx.fill();

      // White ejecta splash ring
      decayCtx.strokeStyle = "rgba(241, 245, 249, 0.4)";
      decayCtx.lineWidth = 1;
      decayCtx.stroke();
    }
    decayCtx.restore();
  }

  // 3. VOYAGER ENVIRONMENT: Plutonium RTG nuclear decay, fading Sun, interstellar medium
  function renderVoyagerSimulation(w, h) {
    const data = ENV_MODELS.voyager.calculate(scrubProgress);
    const rtgWatts = parseFloat(data.param1Val);
    const distAu = parseFloat(data.sol);

    // Deep Void Background
    decayCtx.fillStyle = "#010204";
    decayCtx.fillRect(0, 0, w, h);

    // Interstellar Medium Plasma Glow (if beyond Heliopause 121 AU)
    if (distAu > 120) {
      const plasmaAlpha = Math.min(0.25, (distAu - 120) / 40);
      const plasmaGrad = decayCtx.createLinearGradient(0, 0, w, h);
      plasmaGrad.addColorStop(0, `rgba(56, 189, 248, ${plasmaAlpha})`);
      plasmaGrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
      plasmaGrad.addColorStop(1, `rgba(168, 85, 247, ${plasmaAlpha * 0.8})`);
      decayCtx.fillStyle = plasmaGrad;
      decayCtx.fillRect(0, 0, w, h);
    }

    // Fading Sun in the distance
    // In 1977 (1 AU): bright blinding star. In 2026 (163 AU): tiny pinpoint!
    const sunSize = Math.max(1.5, 22 / Math.sqrt(Math.max(1, distAu)));
    const sunGlow = Math.max(0, 1 - scrubProgress * 0.95);

    decayCtx.save();
    if (sunGlow > 0.05) {
      const sGrad = decayCtx.createRadialGradient(w * 0.2, h * 0.25, 1, w * 0.2, h * 0.25, 30 * sunGlow);
      sGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      sGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      decayCtx.fillStyle = sGrad;
      decayCtx.beginPath();
      decayCtx.arc(w * 0.2, h * 0.25, 30 * sunGlow, 0, Math.PI * 2);
      decayCtx.fill();
    }
    decayCtx.fillStyle = "#ffffff";
    decayCtx.beginPath();
    decayCtx.arc(w * 0.2, h * 0.25, sunSize, 0, Math.PI * 2);
    decayCtx.fill();
    decayCtx.restore();

    // Voyager 1 Spacecraft (Center)
    const cx = w * 0.55;
    const cy = h * 0.52;

    decayCtx.save();
    // High-Gain Parabolic Antenna Dish (3.7m diameter white reflector)
    decayCtx.fillStyle = "#f8fafc";
    decayCtx.beginPath();
    decayCtx.ellipse(cx, cy, 65, 38, -0.2, 0, Math.PI * 2);
    decayCtx.fill();
    decayCtx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    decayCtx.lineWidth = 2;
    decayCtx.stroke();

    // Sub-reflector feed horn
    decayCtx.fillStyle = "#334155";
    decayCtx.beginPath();
    decayCtx.arc(cx - 8, cy - 2, 8, 0, Math.PI * 2);
    decayCtx.fill();

    // Main 10-sided bus behind dish
    decayCtx.fillStyle = "#475569";
    decayCtx.fillRect(cx - 25, cy + 18, 50, 32);

    // RTG Boom (Right side)
    decayCtx.strokeStyle = "#94a3b8";
    decayCtx.lineWidth = 3;
    decayCtx.beginPath();
    decayCtx.moveTo(cx + 25, cy + 30);
    decayCtx.lineTo(cx + 115, cy + 55);
    decayCtx.stroke();

    // Plutonium RTG Canisters (3 cylinders with thermal glow fading with half-life)
    const rtgHeatAlpha = Math.max(0.15, rtgWatts / 470);
    decayCtx.fillStyle = `rgba(239, 68, 68, ${rtgHeatAlpha})`;
    decayCtx.fillRect(cx + 105, cy + 45, 18, 22);

    // Magnetometer Boom (Left side extending far out)
    decayCtx.strokeStyle = "#64748b";
    decayCtx.lineWidth = 2;
    decayCtx.beginPath();
    decayCtx.moveTo(cx - 25, cy + 25);
    decayCtx.lineTo(cx - 150, cy + 85);
    decayCtx.stroke();

    // Golden Record mounted on bus side
    decayCtx.fillStyle = "#fbbf24";
    decayCtx.beginPath();
    decayCtx.ellipse(cx - 8, cy + 34, 10, 7, 0.2, 0, Math.PI * 2);
    decayCtx.fill();
    decayCtx.strokeStyle = "#d97706";
    decayCtx.stroke();

    decayCtx.restore();
  }

  // ============================================================
  // REAL-TIME DEGRADATION CURVE GRAPH
  // ============================================================
  function renderGraph() {
    if (!graphCtx || !graphCanvas) return;
    const w = graphCanvas.width;
    const h = graphCanvas.height;
    graphCtx.clearRect(0, 0, w, h);

    // Background grid
    graphCtx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    graphCtx.lineWidth = 1;
    for (let gy = 20; gy < h; gy += 30) {
      graphCtx.beginPath();
      graphCtx.moveTo(0, gy);
      graphCtx.lineTo(w, gy);
      graphCtx.stroke();
    }

    const model = ENV_MODELS[activeEnv];
    const steps = 100;

    // Draw Degradation Curve (e.g. Power / Hardware Integrity)
    graphCtx.strokeStyle = "#d2f843";
    graphCtx.lineWidth = 2.5;
    graphCtx.beginPath();

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const data = model.calculate(t);
      const valPct = data.param2Pct / 100;
      const gx = t * w;
      const gy = h - 15 - valPct * (h - 35);

      if (i === 0) graphCtx.moveTo(gx, gy);
      else graphCtx.lineTo(gx, gy);
    }
    graphCtx.stroke();

    // Draw Environmental Stress Curve (e.g. Dust Tau / Thermal Cycles)
    graphCtx.strokeStyle = "#38bdf8";
    graphCtx.lineWidth = 1.8;
    graphCtx.setLineDash([4, 4]);
    graphCtx.beginPath();

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const data = model.calculate(t);
      const valPct = data.param1Pct / 100;
      const gx = t * w;
      const gy = h - 15 - valPct * (h - 35);

      if (i === 0) graphCtx.moveTo(gx, gy);
      else graphCtx.lineTo(gx, gy);
    }
    graphCtx.stroke();
    graphCtx.setLineDash([]);

    // Draw Scrubbing Needle Indicator (Current Position)
    const needleX = scrubProgress * w;
    graphCtx.strokeStyle = "#ffffff";
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();
    graphCtx.moveTo(needleX, 0);
    graphCtx.lineTo(needleX, h);
    graphCtx.stroke();

    // Glowing dot at needle intersection
    const currentData = model.calculate(scrubProgress);
    const needleY = h - 15 - (currentData.param2Pct / 100) * (h - 35);

    graphCtx.fillStyle = "#d2f843";
    graphCtx.beginPath();
    graphCtx.arc(needleX, needleY, 5, 0, Math.PI * 2);
    graphCtx.fill();
    graphCtx.strokeStyle = "#050811";
    graphCtx.lineWidth = 2;
    graphCtx.stroke();
  }

  // ============================================================
  // ARCHIVAL PHOTO SLIDER (Module B)
  // ============================================================
  function setupPhotoSlider() {
    const COMPARISONS = {
      oppy: {
        title: "Mars Exploration Rover Opportunity (MER-B)",
        subtitle: "Eagle Crater Landing vs. 5,000 Sols of Martian Dust Storms",
        thenLabel: "THEN (Sol 1 · 2004)",
        nowLabel: "NOW (Sol 5,000 · 2018)",
        thenImg: "https://images-assets.nasa.gov/image/PIA05145/PIA05145~medium.jpg",
        nowImg: "https://images-assets.nasa.gov/image/PIA18613/PIA18613~medium.jpg",
        story: "When Opportunity rolled off the lander in Eagle Crater on January 25, 2004, its gallium arsenide solar panels produced over 900 watt-hours per sol. Designed for a 90-sol warranty, Oppy persevered for over 14 Earth years. By 2018, martian dust coated the arrays, dropping power output until the historic global dust storm plunged Endeavour Crater into darkness."
      },
      apollo: {
        title: "Apollo 15 Lunar Roving Vehicle (LRV-001)",
        subtitle: "Hadley Rille Traverse (1971) vs. Lunar Reconnaissance Orbiter (2020)",
        thenLabel: "THEN (Apollo 15 · 1971)",
        nowLabel: "NOW (LRO Orbit · 2020)",
        thenImg: "https://images-assets.nasa.gov/image/AS15-88-11901/AS15-88-11901~medium.jpg",
        nowImg: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001712/GSFC_20171208_Archive_e001712~medium.jpg",
        story: "In August 1971, Dave Scott and Jim Irwin drove the first car on another world across 17.3 miles of the Moon. Because the Moon has no atmosphere, liquid water, or volcanic activity, the LRV parked at Hadley Rille remains in an immaculate state of preservation. Recent orbital imagery from NASA's Lunar Reconnaissance Orbiter still resolves the rover and the astronauts' dual wheel tracks."
      },
      jezero: {
        title: "Mars: Ancient Water Lakebed vs. Red Desert",
        subtitle: "3.5 Billion Years Ago vs. Barren Craters Today",
        thenLabel: "THEN (Ancient Mars · 3.5B YA)",
        nowLabel: "NOW (Barren Crater · Present)",
        thenImg: "https://images-assets.nasa.gov/image/PIA24424/PIA24424~medium.jpg",
        nowImg: "https://images-assets.nasa.gov/image/PIA24419/PIA24419~medium.jpg",
        story: "Billions of years ago, Jezero and Gale craters were filled with deep, flowing liquid water fed by rich river deltas. Today, they are arid, wind-swept basins of rusty perchlorates and sedimentary rocks. By examining the layering and mineral veins left behind, rovers have proven that Mars once possessed all the chemical ingredients for microbial life."
      },
      golden_record: {
        title: "Voyager 1 Golden Record",
        subtitle: "Pristine Gold Phonograph (1977) vs. Interstellar Flight (Present)",
        thenLabel: "THEN (Cleanroom · 1977)",
        nowLabel: "NOW (Interstellar Medium)",
        thenImg: "https://images-assets.nasa.gov/image/PIA01977/PIA01977~medium.jpg",
        nowImg: "https://images-assets.nasa.gov/image/PIA17049/PIA17049~medium.jpg",
        story: "Before launch in 1977, the Golden Record was mounted to Voyager 1's chassis: a gold-plated copper phonograph disc protected by an aluminum cover containing instructions written in atomic constants. Today, Voyager 1 is over 24 billion kilometers out in the interstellar medium—where the record will outlive our Sun and humanity itself."
      },
      enceladus: {
        title: "Saturn's Moon Enceladus",
        subtitle: "Featureless Ice Ball vs. Active Hydrothermal Geysers",
        thenLabel: "THEN (Voyager Flyby · 1980)",
        nowLabel: "NOW (Cassini Plumes · 2015)",
        thenImg: "https://images-assets.nasa.gov/image/PIA01391/PIA01391~medium.jpg",
        nowImg: "https://images-assets.nasa.gov/image/PIA17183/PIA17183~medium.jpg",
        story: "Voyager 1 viewed Enceladus as a quiet, reflective ball of ice. In 2005, Cassini flew close to the south pole and discovered towering geysers venting water vapor, simple organics, and silica nanoparticles into space. Cassini proved Enceladus harbors a warm, global subsurface ocean with hydrothermal vents."
      }
    };

    const sliderFrame = document.getElementById("sliderFrame");
    const imgThen = document.getElementById("sliderImgThen");
    const imgNow = document.getElementById("sliderImgNow");
    const divider = document.getElementById("sliderDivider");
    const handle = document.getElementById("sliderHandle");
    const badgeThen = document.getElementById("badgeThen");
    const badgeNow = document.getElementById("badgeNow");
    const storyTitle = document.getElementById("sliderStoryTitle");
    const storySubtitle = document.getElementById("sliderStorySubtitle");
    const storyText = document.getElementById("sliderStoryText");
    const compBtns = document.querySelectorAll("[data-comp]");

    function setComparison(key) {
      if (!COMPARISONS[key]) return;
      const item = COMPARISONS[key];

      compBtns.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.comp === key);
      });

      if (imgThen) imgThen.src = item.thenImg;
      if (imgNow) imgNow.src = item.nowImg;
      if (badgeThen) badgeThen.textContent = item.thenLabel;
      if (badgeNow) badgeNow.textContent = item.nowLabel;
      if (storyTitle) storyTitle.textContent = item.title;
      if (storySubtitle) storySubtitle.textContent = item.subtitle;
      if (storyText) storyText.textContent = item.story;

      updatePhotoWiper(50);
    }

    function updatePhotoWiper(pct) {
      const pos = Math.max(0, Math.min(100, pct));
      if (imgNow) imgNow.style.clipPath = `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)`;
      if (divider) divider.style.left = `${pos}%`;
      if (handle) handle.style.left = `${pos}%`;
    }

    function handleWiperMove(e) {
      if (!sliderFrame) return;
      const rect = sliderFrame.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const offsetX = clientX - rect.left;
      const pct = (offsetX / rect.width) * 100;
      updatePhotoWiper(pct);
    }

    let isWiping = false;
    if (sliderFrame) {
      sliderFrame.addEventListener("mousedown", (e) => {
        isWiping = true;
        handleWiperMove(e);
      });
      window.addEventListener("mouseup", () => (isWiping = false));
      window.addEventListener("mousemove", (e) => {
        if (isWiping) handleWiperMove(e);
      });

      sliderFrame.addEventListener("touchstart", (e) => {
        isWiping = true;
        handleWiperMove(e);
      });
      window.addEventListener("touchend", () => (isWiping = false));
      window.addEventListener("touchmove", (e) => {
        if (isWiping) handleWiperMove(e);
      });
    }

    compBtns.forEach((btn) => {
      btn.addEventListener("click", () => setComparison(btn.dataset.comp));
    });

    // Default to oppy
    setComparison("oppy");
  }

  // Load on DOM ready
  document.addEventListener("DOMContentLoaded", init);
})();
