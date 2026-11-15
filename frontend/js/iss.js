/**
 * 3D INTERNATIONAL SPACE STATION (ISS) EXPLORER & SCIENCE ENGINE
 * Interactive Three.js Orbital Laboratory with Module Inspector,
 * Real-Time Telemetry, Day/Night Lighting, and Web Audio Soundscape.
 */

(function () {
  "use strict";

  // --- Science & Engineering Dossier Data ---
  const MODULE_DATA = {
    destiny: {
      name: "Destiny Laboratory",
      agency: "NASA · United States",
      role: "Primary US Microgravity Research Laboratory",
      description:
        "The scientific centerpiece of the US segment. Inside Destiny, microgravity removes the masking effects of Earth's gravity, enabling researchers to study fluid dynamics, combustion physics, and materials science that are impossible on the planet.",
      science:
        "Houses the Cold Atom Lab (CAL), chilling atoms to a billionth of a degree above absolute zero to create exotic fifth states of matter (Bose-Einstein condensates). Also home to protein crystal growth experiments accelerating cancer and Alzheimer's drug discovery.",
      specs: {
        "Launch Date": "Feb 7, 2001 (STS-98)",
        "Mass": "24,000 kg (53,000 lbs)",
        "Dimensions": "8.5m length × 4.3m diameter",
        "Payload Capacity": "24 International Standard Racks"
      },
      cameraPos: { x: 8, y: 5, z: 12 },
      targetPos: { x: 0, y: 0, z: 4 }
    },
    kibo: {
      name: "Kibo (Japanese Experiment Module)",
      agency: "JAXA · Japan",
      role: "Largest Science Laboratory & Exposed Facility",
      description:
        "Meaning 'Hope' in Japanese, Kibo is the single largest habitable module on the ISS. It features an internal pressurized lab, an airlock for small satellites, its own dedicated robotic arm, and an external 'back porch' directly exposed to the hostile vacuum of space.",
      science:
        "Deploys CubeSats into low-Earth orbit and tests space exposure of extremophile organisms, materials, and cosmic ray detectors (CALET) searching for signatures of dark matter.",
      specs: {
        "Launch Date": "May 31, 2008 (STS-124)",
        "Mass": "15,900 kg (pressurized module)",
        "Dimensions": "11.2m length × 4.4m diameter",
        "Features": "Robotic arm & vacuum airlock"
      },
      cameraPos: { x: -12, y: 7, z: 14 },
      targetPos: { x: -6, y: 1, z: 5 }
    },
    columbus: {
      name: "Columbus Laboratory",
      agency: "ESA · European Space Agency",
      role: "European Multidisciplinary Research Module",
      description:
        "Europe's premier laboratory in space. Columbus provides researchers with complete rack-based facilities for human physiology, biology, fluid physics, and materials science in constant weightlessness.",
      science:
        "Houses Biolab (studying microgravity impacts on cells and small plants) and the Fluid Science Laboratory. Its exterior platform hosts ASIM, monitoring high-altitude electrical storms (blue jets and red sprites) above Earth's atmosphere.",
      specs: {
        "Launch Date": "Feb 7, 2008 (STS-122)",
        "Mass": "10,300 kg",
        "Dimensions": "6.9m length × 4.5m diameter",
        "Control Center": "Munich, Germany (ESA)"
      },
      cameraPos: { x: 12, y: 6, z: 12 },
      targetPos: { x: 6, y: 1, z: 4 }
    },
    cupola: {
      name: "Cupola Observation Module",
      agency: "ESA / NASA · Joint Observatory",
      role: "7-Window Earth Observatory & Robotic Workstation",
      description:
        "The iconic observation dome facing Earth. Equipped with seven optical-grade fused silica windows—including the largest single window flown in space (80 cm across)—Cupola gives astronauts an unparalleled panoramic view of Earth, orbital rendezvous, and spacewalks.",
      science:
        "Crucial for piloting Canadarm2 during cargo capture (Crew Dragon, Cygnus). Astronauts also use it to monitor Earth's climate, hurricanes, auroras, and deforestation, capturing hundreds of thousands of scientific photographs.",
      specs: {
        "Launch Date": "Feb 8, 2010 (STS-130)",
        "Mass": "1,800 kg",
        "Central Window": "80 cm (31.5 in) diameter",
        "Position": "Nadir (Earth-facing on Tranquility)"
      },
      cameraPos: { x: 4, y: -6, z: 6 },
      targetPos: { x: 2, y: -2, z: 1 }
    },
    canadarm: {
      name: "Canadarm2 (SSRMS)",
      agency: "CSA · Canadian Space Agency",
      role: "17-Meter Space Robotic Manipulator",
      description:
        "Humanity's most versatile robotic limb in orbit. Canadarm2 has seven motorized joints that allow it to bend with human-like dexterity. Uniquely, it can inchworm end-over-end across the station by changing which of its two identical hands is anchored.",
      science:
        "Grapples and docks uncrewed cargo freighters traveling at 27,600 km/h, assists spacewalking astronauts, and moves massive orbital replacement units (ORUs) and science payloads across the Integrated Truss Structure.",
      specs: {
        "Launch Date": "April 19, 2001 (STS-100)",
        "Length": "17.6 meters (57.7 feet)",
        "Payload Limit": "116,000 kg (255,000 lbs)",
        "Degrees of Freedom": "7 motorized rotary joints"
      },
      cameraPos: { x: -4, y: 12, z: 8 },
      targetPos: { x: -1, y: 4, z: 2 }
    },
    zvezda: {
      name: "Zvezda Service Module",
      agency: "Roscosmos · Russia",
      role: "Russian Segment Core & Orbital Reboost Engines",
      description:
        "The nerve center of the Russian segment. Zvezda provides structural support, flight control computers, navigation sensors, life support, and two main rocket engines used to reboost the ISS when atmospheric drag pulls it downward.",
      science:
        "Houses crew sleeping quarters, exercise bicycles, the Russian Vozdukh carbon dioxide scrubber, and communication antennas linked to the Russian Luch satellite network.",
      specs: {
        "Launch Date": "July 12, 2000 (Proton-K)",
        "Mass": "19,050 kg",
        "Length": "13.1 meters",
        "Propulsion": "Two 300 kgf rocket engines"
      },
      cameraPos: { x: 0, y: 6, z: -16 },
      targetPos: { x: 0, y: 0, z: -8 }
    },
    zarya: {
      name: "Zarya (Functional Cargo Block / FGB)",
      agency: "Roscosmos / NASA · Foundation Module",
      role: "The First Module in Orbit & Core Passageway",
      description:
        "The very first piece of the International Space Station, launched into an empty orbit on Nov 20, 1998. Zarya provided early electric power, battery storage, and propulsion during initial station assembly before handover to Zvezda.",
      science:
        "Today serves as a vital pressurized passageway between the Russian and US orbital segments, holding internal cargo storage racks and external propellant tanks.",
      specs: {
        "Launch Date": "Nov 20, 1998 (Proton Rocket)",
        "Mass": "19,320 kg",
        "Diameter": "4.1 meters",
        "Significance": "Foundation brick of the ISS"
      },
      cameraPos: { x: -8, y: 4, z: -4 },
      targetPos: { x: 0, y: 0, z: -2 }
    },
    solar_arrays: {
      name: "Integrated Truss & Solar Array Wings (SAWs)",
      agency: "NASA / International Coalition",
      role: "120 kW Orbital Power Generation & Heat Radiators",
      description:
        "The ISS spans 109 meters—longer than an American football field. Its 8 massive solar array wings cover over an acre (27,000 sq ft) of photovoltaic silicon, generating 120 kilowatts of electricity stored in advanced lithium-ion batteries.",
      science:
        "Rotates 360 degrees via Solar Alpha Rotary Joints (SARJ) to face the Sun continuously during daylight passes. Paired with ammonia thermal radiator panels that expel excess heat from computers, experiments, and crew into the cold vacuum of space.",
      specs: {
        "Total Truss Length": "109 meters (357 feet)",
        "Array Wingspan": "73 meters (240 feet)",
        "Total Power": "120 kW peak generation",
        "Solar Cell Area": "2,500 square meters"
      },
      cameraPos: { x: -35, y: 14, z: 20 },
      targetPos: { x: -16, y: 0, z: 0 }
    },
    quest_airlock: {
      name: "Quest Joint Airlock",
      agency: "NASA · United States",
      role: "Gateway to the Void for Spacewalks (EVAs)",
      description:
        "The primary doorway for spacewalks. Quest allows astronauts wearing US Extravehicular Mobility Units (EMUs) or Russian Orlan spacesuits to step into the vacuum of space without depressurizing the rest of the station.",
      science:
        "Houses high-pressure oxygen and nitrogen gas tanks recharge manifolds, spacesuit maintenance benches, and pre-breathe exercise equipment preventing decompression sickness (the bends).",
      specs: {
        "Launch Date": "July 12, 2001 (STS-104)",
        "Mass": "9,920 kg",
        "Chambers": "Equipment Lock & Crew Lock",
        "Spacewalks Hosted": "Over 180 EVAs"
      },
      cameraPos: { x: 9, y: 4, z: -1 },
      targetPos: { x: 3, y: -0.5, z: 0 }
    }
  };

  // --- State Variables ---
  let scene, camera, renderer, controls;
  let issGroup, earthMesh, cloudsMesh, sunLight;
  let interactiveObjects = [];
  let hoveredObject = null;
  let selectedModuleKey = null;
  let currentViewMode = "orbit"; // orbit | cupola | solar | eva

  // Camera lerp targets
  let targetCamPos = null;
  let targetLookAt = null;
  let currentLookAt = new THREE.Vector3(0, 0, 0);

  // Solar Array Rotators
  let solarRotators = [];

  // Web Audio
  let audioCtx = null;
  let ambientGain = null;
  let isAudioPlaying = false;

  // Real-time telemetry simulation
  let telemetryLat = 28.5;
  let telemetryLon = -80.6;
  let orbitalProgress = 0;

  // --- Initialize App ---
  function init() {
    const container = document.getElementById("issThreeCanvas");
    if (!container) return;

    setupScene(container);
    buildStarfield();
    buildEarth();
    buildISSModel();
    setupLighting();
    setupControls();
    setupEvents(container);
    setupUI();
    setupTelemetryClock();

    animate();
  }

  // --- Three.js Scene Setup ---
  function setupScene(container) {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020409, 0.0012);

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 2000);
    camera.position.set(22, 14, 28);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
  }

  function setupControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.5;
    controls.maxDistance = 160;
    controls.maxPolarAngle = Math.PI / 1.05;
  }

  // --- Lighting & Sun Simulation ---
  function setupLighting() {
    // Ambient starlight
    const ambientLight = new THREE.AmbientLight(0x223348, 0.7);
    scene.add(ambientLight);

    // Directional Sunlight
    sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(80, 45, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 250;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Earth reflected up-light (Albedo reflection)
    const earthAlbedo = new THREE.DirectionalLight(0x2b6cb0, 0.55);
    earthAlbedo.position.set(0, -50, 0);
    scene.add(earthAlbedo);
  }

  // --- Deep Cosmic Starfield ---
  function buildStarfield() {
    const starCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 600 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const isBlue = Math.random() > 0.8;
      const isLime = Math.random() > 0.95;
      colors[i * 3] = isLime ? 0.82 : isBlue ? 0.6 : 0.95;
      colors[i * 3 + 1] = isLime ? 0.97 : isBlue ? 0.8 : 0.95;
      colors[i * 3 + 2] = isLime ? 0.26 : isBlue ? 1.0 : 0.98;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starPoints = new THREE.Points(geometry, material);
    scene.add(starPoints);
  }

  // --- Earth Sphere with Atmosphere & Cloud Layer ---
  function buildEarth() {
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -320, 0); // Positioned ~420km scale below ISS

    const earthGeo = new THREE.SphereGeometry(280, 64, 64);

    // Procedural Blue Marble style shader texture canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Ocean Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, "#08203e");
    oceanGrad.addColorStop(0.5, "#0d3b66");
    oceanGrad.addColorStop(1, "#08203e");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Landmass patterns
    ctx.fillStyle = "#1e3f20";
    for (let i = 0; i < 48; i++) {
      const x = Math.random() * 1024;
      const y = 80 + Math.random() * 352;
      const r = 25 + Math.random() * 70;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Deserts
    ctx.fillStyle = "#705328";
    for (let i = 0; i < 24; i++) {
      const x = Math.random() * 1024;
      const y = 140 + Math.random() * 200;
      const r = 15 + Math.random() * 40;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const earthTex = new THREE.CanvasTexture(canvas);

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.7,
      metalness: 0.1
    });

    earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.receiveShadow = true;
    earthGroup.add(earthMesh);

    // Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(282, 48, 48);
    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = 512;
    cloudCanvas.height = 256;
    const cCtx = cloudCanvas.getContext("2d");
    cCtx.fillStyle = "rgba(0,0,0,0)";
    cCtx.fillRect(0, 0, 512, 256);
    cCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 80; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      cCtx.beginPath();
      cCtx.arc(cx, cy, 10 + Math.random() * 30, 0, Math.PI * 2);
      cCtx.fill();
    }
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudsMesh);

    // Atmospheric Glow Rim
    const glowGeo = new THREE.SphereGeometry(286, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(glowGeo, glowMat);
    earthGroup.add(atmosMesh);

    scene.add(earthGroup);
  }

  // --- Procedural High-Fidelity ISS Construction ---
  function buildISSModel() {
    issGroup = new THREE.Group();

    // Reusable Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde4,
      metalness: 0.85,
      roughness: 0.35
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x333b47,
      metalness: 0.9,
      roughness: 0.4
    });

    const goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xdfa020,
      metalness: 0.95,
      roughness: 0.25
    });

    const radiatorMat = new THREE.MeshStandardMaterial({
      color: 0xf0f3f6,
      roughness: 0.65,
      metalness: 0.15
    });

    // 1. Integrated Truss Structure (Main Spine across X axis, ~70 units)
    const trussGroup = new THREE.Group();
    const mainTrussGeo = new THREE.BoxGeometry(72, 1.4, 1.4);
    const mainTruss = new THREE.Mesh(mainTrussGeo, darkMetalMat);
    mainTruss.castShadow = true;
    mainTruss.receiveShadow = true;
    trussGroup.add(mainTruss);

    // Cross-truss ribs
    for (let x = -35; x <= 35; x += 3.5) {
      const ribGeo = new THREE.BoxGeometry(0.35, 1.8, 1.8);
      const rib = new THREE.Mesh(ribGeo, metalMat);
      rib.position.x = x;
      trussGroup.add(rib);
    }
    issGroup.add(trussGroup);

    // 2. Solar Array Wings (SAWs)
    // 4 Starboard Arrays (X = -32 to -22) and 4 Port Arrays (X = 22 to 32)
    const solarTexCanvas = document.createElement("canvas");
    solarTexCanvas.width = 256;
    solarTexCanvas.height = 512;
    const sCtx = solarTexCanvas.getContext("2d");
    sCtx.fillStyle = "#0c1527";
    sCtx.fillRect(0, 0, 256, 512);
    // Photovoltaic cell grid lines
    sCtx.strokeStyle = "#4070a0";
    sCtx.lineWidth = 1;
    for (let y = 0; y < 512; y += 16) {
      sCtx.beginPath();
      sCtx.moveTo(0, y);
      sCtx.lineTo(256, y);
      sCtx.stroke();
    }
    for (let x = 0; x < 256; x += 32) {
      sCtx.beginPath();
      sCtx.moveTo(x, 0);
      sCtx.lineTo(x, 512);
      sCtx.stroke();
    }
    const solarTex = new THREE.CanvasTexture(solarTexCanvas);

    const solarMat = new THREE.MeshStandardMaterial({
      map: solarTex,
      metalness: 0.8,
      roughness: 0.25,
      bumpScale: 0.05
    });

    function createSolarWingPair(xPos) {
      const pairGroup = new THREE.Group();
      pairGroup.position.set(xPos, 0, 0);

      // Rotator joint
      const jointGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.2, 16);
      const joint = new THREE.Mesh(jointGeo, metalMat);
      joint.rotation.z = Math.PI / 2;
      pairGroup.add(joint);

      const rotatingWing = new THREE.Group();

      // Wing 1 (Forward, +Z)
      const panelGeo = new THREE.BoxGeometry(4.2, 0.12, 15);
      const wing1 = new THREE.Mesh(panelGeo, solarMat);
      wing1.position.set(0, 0, 8.5);
      wing1.castShadow = true;
      wing1.receiveShadow = true;
      rotatingWing.add(wing1);

      // Golden back foil
      const foil1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, 15), goldFoilMat);
      foil1.position.set(0, -0.07, 8.5);
      rotatingWing.add(foil1);

      // Wing 2 (Aft, -Z)
      const wing2 = new THREE.Mesh(panelGeo, solarMat);
      wing2.position.set(0, 0, -8.5);
      wing2.castShadow = true;
      wing2.receiveShadow = true;
      rotatingWing.add(wing2);

      const foil2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, 15), goldFoilMat);
      foil2.position.set(0, -0.07, -8.5);
      rotatingWing.add(foil2);

      pairGroup.add(rotatingWing);
      solarRotators.push(rotatingWing);

      // Tag for raycasting
      wing1.userData = { moduleKey: "solar_arrays" };
      wing2.userData = { moduleKey: "solar_arrays" };
      interactiveObjects.push(wing1, wing2);

      return pairGroup;
    }

    issGroup.add(createSolarWingPair(-32));
    issGroup.add(createSolarWingPair(-24));
    issGroup.add(createSolarWingPair(24));
    issGroup.add(createSolarWingPair(32));

    // 3. Thermal Radiator Assemblies (P1 and S1 trusses)
    function createRadiator(xPos, angle) {
      const radGroup = new THREE.Group();
      radGroup.position.set(xPos, 0.8, -4);
      radGroup.rotation.y = angle;

      for (let i = 0; i < 3; i++) {
        const rPanelGeo = new THREE.BoxGeometry(2.4, 0.15, 6);
        const rPanel = new THREE.Mesh(rPanelGeo, radiatorMat);
        rPanel.position.set((i - 1) * 2.8, 0, -3.5);
        rPanel.rotation.x = Math.PI / 14;
        rPanel.castShadow = true;
        radGroup.add(rPanel);
      }
      return radGroup;
    }
    issGroup.add(createRadiator(-12, 0));
    issGroup.add(createRadiator(12, 0));

    // 4. PRESSURIZED MODULE CLUSTER (Centered along Z-axis)

    // Helper: Create cylindrical module with end cones
    function createCylinderModule(radius, length, material, key) {
      const group = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(radius, radius, length, 24);
      const cyl = new THREE.Mesh(cylGeo, material);
      cyl.castShadow = true;
      cyl.receiveShadow = true;
      cyl.rotation.x = Math.PI / 2;
      group.add(cyl);

      // End caps
      const capGeo = new THREE.ConeGeometry(radius, 0.5, 24);
      const capFront = new THREE.Mesh(capGeo, darkMetalMat);
      capFront.position.z = length / 2 + 0.25;
      capFront.rotation.x = Math.PI / 2;
      group.add(capFront);

      const capBack = new THREE.Mesh(capGeo, darkMetalMat);
      capBack.position.z = -(length / 2 + 0.25);
      capBack.rotation.x = -Math.PI / 2;
      group.add(capBack);

      // Ring ribs
      for (let z = -length / 2 + 0.8; z < length / 2; z += 1.4) {
        const ringGeo = new THREE.TorusGeometry(radius + 0.05, 0.04, 8, 24);
        const ring = new THREE.Mesh(ringGeo, darkMetalMat);
        ring.position.z = z;
        group.add(ring);
      }

      cyl.userData = { moduleKey: key };
      interactiveObjects.push(cyl);

      return group;
    }

    // A. Destiny Laboratory (US Lab) - Center Forward
    const destiny = createCylinderModule(1.3, 4.8, metalMat, "destiny");
    destiny.position.set(0, 0, 3.2);
    issGroup.add(destiny);

    // Destiny science window
    const destWindowGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
    const destWindow = new THREE.Mesh(
      destWindowGeo,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    destWindow.position.set(0, -1.35, 3.2);
    destWindow.userData = { moduleKey: "destiny" };
    interactiveObjects.push(destWindow);
    issGroup.add(destWindow);

    // B. Kibo Laboratory (JEM) - Port Side (X: -3.8)
    const kibo = createCylinderModule(1.4, 5.8, metalMat, "kibo");
    kibo.position.set(-3.6, 0.6, 4.8);
    issGroup.add(kibo);

    // Kibo Exposed Facility Porch
    const kiboPorchGeo = new THREE.BoxGeometry(2.4, 1.2, 2.8);
    const kiboPorch = new THREE.Mesh(kiboPorchGeo, darkMetalMat);
    kiboPorch.position.set(-3.6, 0.6, 8.4);
    kiboPorch.userData = { moduleKey: "kibo" };
    interactiveObjects.push(kiboPorch);
    issGroup.add(kiboPorch);

    // C. Columbus Laboratory (ESA) - Starboard Side (X: +3.6)
    const columbus = createCylinderModule(1.35, 3.8, metalMat, "columbus");
    columbus.position.set(3.4, 0.6, 4.2);
    issGroup.add(columbus);

    // D. Unity Node 1 (Central hub)
    const unity = createCylinderModule(1.3, 2.6, darkMetalMat, "destiny");
    unity.position.set(0, 0, 0);
    issGroup.add(unity);

    // E. Quest Airlock (Starboard nadir)
    const airlock = createCylinderModule(1.1, 3.2, metalMat, "quest_airlock");
    airlock.position.set(2.8, -0.6, 0);
    airlock.rotation.y = Math.PI / 2;
    issGroup.add(airlock);

    // High pressure gas tanks on Quest
    for (let i = 0; i < 4; i++) {
      const tankGeo = new THREE.SphereGeometry(0.4, 12, 12);
      const tank = new THREE.Mesh(tankGeo, goldFoilMat);
      tank.position.set(2.8 + (i % 2 === 0 ? 0.8 : -0.8), -0.6 + (i > 1 ? 0.7 : -0.7), 0.8);
      tank.userData = { moduleKey: "quest_airlock" };
      interactiveObjects.push(tank);
      issGroup.add(tank);
    }

    // F. Cupola Observation Module (Mounted nadir facing Earth)
    const cupolaGroup = new THREE.Group();
    cupolaGroup.position.set(0, -1.8, 1.2);

    const cupolaBaseGeo = new THREE.CylinderGeometry(0.9, 0.7, 0.6, 16);
    const cupolaBase = new THREE.Mesh(cupolaBaseGeo, darkMetalMat);
    cupolaGroup.add(cupolaBase);

    // 7 Windows
    const centerWindowGeo = new THREE.CircleGeometry(0.45, 16);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0c4a6e,
      roughness: 0.1,
      metalness: 0.9
    });
    const centerWin = new THREE.Mesh(centerWindowGeo, winMat);
    centerWin.rotation.x = Math.PI / 2;
    centerWin.position.y = -0.32;
    cupolaGroup.add(centerWin);

    // 6 trapezoidal side windows
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      const sideWinGeo = new THREE.PlaneGeometry(0.35, 0.3);
      const sideWin = new THREE.Mesh(sideWinGeo, winMat);
      sideWin.position.set(Math.cos(a) * 0.65, -0.15, Math.sin(a) * 0.65);
      sideWin.rotation.y = -a + Math.PI / 2;
      sideWin.rotation.x = Math.PI / 6;
      cupolaGroup.add(sideWin);
    }

    cupolaBase.userData = { moduleKey: "cupola" };
    centerWin.userData = { moduleKey: "cupola" };
    interactiveObjects.push(cupolaBase, centerWin);
    issGroup.add(cupolaGroup);

    // G. Zarya FGB (Russian segment forward)
    const zarya = createCylinderModule(1.25, 4.4, goldFoilMat, "zarya");
    zarya.position.set(0, 0, -3.8);
    issGroup.add(zarya);

    // Zarya auxiliary solar panels
    const zaryaWing1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 6), solarMat);
    zaryaWing1.position.set(-3.2, 0, -3.8);
    zaryaWing1.userData = { moduleKey: "zarya" };
    interactiveObjects.push(zaryaWing1);
    issGroup.add(zaryaWing1);

    const zaryaWing2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 6), solarMat);
    zaryaWing2.position.set(3.2, 0, -3.8);
    zaryaWing2.userData = { moduleKey: "zarya" };
    interactiveObjects.push(zaryaWing2);
    issGroup.add(zaryaWing2);

    // H. Zvezda Service Module (Russian segment aft)
    const zvezda = createCylinderModule(1.35, 5.4, darkMetalMat, "zvezda");
    zvezda.position.set(0, 0, -8.6);
    issGroup.add(zvezda);

    // Zvezda solar panels
    const zvWing1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 7.5), solarMat);
    zvWing1.position.set(-4.2, 0, -8.6);
    zvWing1.userData = { moduleKey: "zvezda" };
    interactiveObjects.push(zvWing1);
    issGroup.add(zvWing1);

    const zvWing2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 7.5), solarMat);
    zvWing2.position.set(4.2, 0, -8.6);
    zvWing2.userData = { moduleKey: "zvezda" };
    interactiveObjects.push(zvWing2);
    issGroup.add(zvWing2);

    // Zvezda Aft Engines
    const engineGeo = new THREE.ConeGeometry(0.35, 0.6, 12);
    const engine1 = new THREE.Mesh(engineGeo, metalMat);
    engine1.position.set(-0.5, 0, -11.6);
    engine1.rotation.x = -Math.PI / 2;
    issGroup.add(engine1);

    const engine2 = new THREE.Mesh(engineGeo, metalMat);
    engine2.position.set(0.5, 0, -11.6);
    engine2.rotation.x = -Math.PI / 2;
    issGroup.add(engine2);

    // I. Canadarm2 (Robotic Arm on truss)
    const armGroup = new THREE.Group();
    armGroup.position.set(-1, 1.2, 1);

    // Shoulder joint
    const joint1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), metalMat);
    armGroup.add(joint1);

    // Boom 1 (White carbon-composite cylinder)
    const boom1Geo = new THREE.CylinderGeometry(0.18, 0.18, 3.8, 12);
    const boom1 = new THREE.Mesh(boom1Geo, radiatorMat);
    boom1.position.set(-1, 1.6, 0.8);
    boom1.rotation.z = Math.PI / 3.8;
    boom1.rotation.x = Math.PI / 6;
    armGroup.add(boom1);

    // Elbow joint
    const joint2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), metalMat);
    joint2.position.set(-2, 3.2, 1.6);
    armGroup.add(joint2);

    // Boom 2
    const boom2Geo = new THREE.CylinderGeometry(0.16, 0.16, 3.6, 12);
    const boom2 = new THREE.Mesh(boom2Geo, radiatorMat);
    boom2.position.set(-1.2, 4.4, 2.6);
    boom2.rotation.z = -Math.PI / 4;
    boom2.rotation.x = Math.PI / 4;
    armGroup.add(boom2);

    // Latching End Effector (Hand)
    const leeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.5, 12);
    const lee = new THREE.Mesh(leeGeo, darkMetalMat);
    lee.position.set(-0.2, 5.6, 3.6);
    armGroup.add(lee);

    boom1.userData = { moduleKey: "canadarm" };
    boom2.userData = { moduleKey: "canadarm" };
    interactiveObjects.push(boom1, boom2);

    issGroup.add(armGroup);

    // J. Docked SpaceX Crew Dragon Spacecraft (Forward IDA-2 port)
    const dragonGroup = new THREE.Group();
    dragonGroup.position.set(0, 0, 7.8);

    // Capsule cone
    const capsuleGeo = new THREE.ConeGeometry(1.15, 2.2, 20);
    const capsule = new THREE.Mesh(capsuleGeo, radiatorMat);
    capsule.rotation.x = Math.PI / 2;
    dragonGroup.add(capsule);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(1.15, 1.15, 1.8, 20);
    const trunk = new THREE.Mesh(trunkGeo, darkMetalMat);
    trunk.position.z = -1.6;
    trunk.rotation.x = Math.PI / 2;
    dragonGroup.add(trunk);

    // Black nosecone cap
    const noseGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const nose = new THREE.Mesh(noseGeo, darkMetalMat);
    nose.position.z = 1.1;
    dragonGroup.add(nose);

    capsule.userData = { moduleKey: "destiny" };
    interactiveObjects.push(capsule);
    issGroup.add(dragonGroup);

    scene.add(issGroup);
  }

  // --- Mouse & Touch Raycasting Events ---
  function setupEvents(container) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function updatePointer(e) {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    container.addEventListener("mousemove", (e) => {
      updatePointer(e);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        container.style.cursor = "pointer";
        const hit = intersects[0].object;
        if (hoveredObject !== hit) {
          hoveredObject = hit;
        }
      } else {
        container.style.cursor = currentViewMode === "cupola" ? "default" : "grab";
        hoveredObject = null;
      }
    });

    container.addEventListener("click", (e) => {
      updatePointer(e);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.moduleKey) {
          focusOnModule(hit.userData.moduleKey);
          playAudioChirp();
        }
      }
    });

    // Window Resize
    window.addEventListener("resize", () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // --- Focus Camera on Module & Open Science Dossier ---
  function focusOnModule(moduleKey) {
    const data = MODULE_DATA[moduleKey];
    if (!data) return;

    selectedModuleKey = moduleKey;

    // Update Quick-Jump Pills UI
    document.querySelectorAll(".iss-module-pill").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.mod === moduleKey);
    });

    // Smooth Camera Transition Target
    targetCamPos = new THREE.Vector3(data.cameraPos.x, data.cameraPos.y, data.cameraPos.z);
    targetLookAt = new THREE.Vector3(data.targetPos.x, data.targetPos.y, data.targetPos.z);

    // Populate and open Science Dossier Card
    const dossier = document.getElementById("issDossierCard");
    if (dossier) {
      document.getElementById("issDossierAgency").textContent = data.agency;
      document.getElementById("issDossierTitle").textContent = data.name;
      document.getElementById("issDossierRole").textContent = data.role;
      document.getElementById("issDossierDesc").textContent = data.description;
      document.getElementById("issScienceText").textContent = data.science;

      // Populate Specs Grid
      const specsGrid = document.getElementById("issSpecsGrid");
      if (specsGrid) {
        specsGrid.innerHTML = "";
        Object.entries(data.specs).forEach(([k, v]) => {
          const div = document.createElement("div");
          div.className = "iss-spec-box";
          div.innerHTML = `<div class="iss-spec-lbl">${k}</div><div class="iss-spec-val">${v}</div>`;
          specsGrid.appendChild(div);
        });
      }

      dossier.classList.add("is-open");
    }
  }

  function resetToOrbitalView() {
    selectedModuleKey = null;
    currentViewMode = "orbit";
    targetCamPos = new THREE.Vector3(22, 14, 28);
    targetLookAt = new THREE.Vector3(0, 0, 0);

    const dossier = document.getElementById("issDossierCard");
    if (dossier) dossier.classList.remove("is-open");

    document.querySelectorAll(".iss-module-pill").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".iss-mode-btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.mode === "orbit");
    });
  }

  // --- UI & Viewport Controls Setup ---
  function setupUI() {
    // Mode Buttons
    const modeBtns = document.querySelectorAll(".iss-mode-btn");
    modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        modeBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        setViewMode(btn.dataset.mode);
      });
    });

    // Module Quick-Jump Pills
    const jumpBtns = document.querySelectorAll(".iss-module-pill");
    jumpBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        focusOnModule(btn.dataset.mod);
      });
    });

    // Dossier Close Button
    const closeBtn = document.getElementById("issDossierClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const dossier = document.getElementById("issDossierCard");
        if (dossier) dossier.classList.remove("is-open");
      });
    }

    // Return to Orbit Button
    const orbitReturnBtn = document.getElementById("issReturnOrbitBtn");
    if (orbitReturnBtn) {
      orbitReturnBtn.addEventListener("click", () => {
        resetToOrbitalView();
      });
    }

    // Audio Soundscape Toggle Button
    const audioBtn = document.getElementById("issAudioToggle");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        toggleSoundscape(audioBtn);
      });
    }
  }

  function setViewMode(mode) {
    currentViewMode = mode;
    const dossier = document.getElementById("issDossierCard");

    if (mode === "orbit") {
      targetCamPos = new THREE.Vector3(24, 15, 30);
      targetLookAt = new THREE.Vector3(0, 0, 0);
      if (dossier) dossier.classList.remove("is-open");
    } else if (mode === "cupola") {
      // Look from inside the Cupola facing straight down toward rotating Earth
      targetCamPos = new THREE.Vector3(0, -1.9, 1.2);
      targetLookAt = new THREE.Vector3(0, -50, 1.2);
      focusOnModule("cupola");
    } else if (mode === "solar") {
      // Close-up view of the giant 73-meter solar arrays
      targetCamPos = new THREE.Vector3(-36, 12, 18);
      targetLookAt = new THREE.Vector3(-24, 0, 0);
      focusOnModule("solar_arrays");
    } else if (mode === "eva") {
      // Spacewalker POV standing on the S0 truss outside Quest Airlock
      targetCamPos = new THREE.Vector3(3.2, 1.8, 1.2);
      targetLookAt = new THREE.Vector3(-12, 2.5, 20);
      focusOnModule("quest_airlock");
    }
  }

  // --- Live Orbital Telemetry Clock & API Fallback ---
  function setupTelemetryClock() {
    const latEl = document.getElementById("issHudLat");
    const lonEl = document.getElementById("issHudLon");
    const speedEl = document.getElementById("issHudSpeed");
    const altEl = document.getElementById("issHudAlt");
    const sunEl = document.getElementById("issHudDayNight");

    function updateTelemetry() {
      // Calculate realistic orbital position based on 51.6° orbital inclination
      orbitalProgress += 0.0018;
      const inclination = (51.6 * Math.PI) / 180;
      telemetryLat = (Math.sin(orbitalProgress) * 51.6).toFixed(2);
      telemetryLon = (((orbitalProgress * 180) / Math.PI * 4) % 360 - 180).toFixed(2);

      const speed = (27570 + Math.sin(orbitalProgress * 3) * 15).toFixed(0);
      const alt = (418.4 + Math.cos(orbitalProgress * 2) * 1.8).toFixed(1);

      if (latEl) latEl.textContent = `${Math.abs(telemetryLat)}° ${telemetryLat >= 0 ? "N" : "S"}`;
      if (lonEl) lonEl.textContent = `${Math.abs(telemetryLon)}° ${telemetryLon >= 0 ? "E" : "W"}`;
      if (speedEl) speedEl.textContent = `${Number(speed).toLocaleString()} km/h`;
      if (altEl) altEl.textContent = `${alt} km`;

      // Day / Night cycle (Daylight ~45 min, Eclipse ~45 min)
      const isDaylight = Math.sin(orbitalProgress) > -0.2;
      if (sunEl) {
        sunEl.textContent = isDaylight ? "☀️ Daylight Pass" : "🌑 Orbital Eclipse";
        sunEl.style.color = isDaylight ? "#D2F843" : "#94a3b8";
      }

      // Adjust sunlight intensity based on day/night
      if (sunLight) {
        sunLight.intensity = isDaylight ? 2.2 : 0.25;
      }
    }

    setInterval(updateTelemetry, 1000);
    updateTelemetry();

    // Attempt live Open ISS API fetch (graceful fallback if offline/sandboxed)
    try {
      fetch("https://api.wheretheiss.at/v1/satellites/25544")
        .then((r) => r.json())
        .then((data) => {
          if (data && data.latitude && data.longitude) {
            telemetryLat = data.latitude.toFixed(2);
            telemetryLon = data.longitude.toFixed(2);
            if (latEl) latEl.textContent = `${Math.abs(telemetryLat)}° ${telemetryLat >= 0 ? "N" : "S"}`;
            if (lonEl) lonEl.textContent = `${Math.abs(telemetryLon)}° ${telemetryLon >= 0 ? "E" : "W"}`;
            if (altEl && data.altitude) altEl.textContent = `${data.altitude.toFixed(1)} km`;
          }
        })
        .catch(() => {
          // Offline mode continues smoothly with mathematical physics model
        });
    } catch (_) {}
  }

  // --- Web Audio Synthesizer (Cabin Atmosphere & Radio Chime) ---
  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      // Deep cabin ventilation hum (brown noise + 60Hz hum)
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(64, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, audioCtx.currentTime);

      ambientGain = audioCtx.createGain();
      ambientGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(ambientGain);
      ambientGain.connect(audioCtx.destination);
      osc.start();
    } catch (_) {}
  }

  function toggleSoundscape(btn) {
    if (!audioCtx) initAudio();

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    isAudioPlaying = !isAudioPlaying;
    if (ambientGain) {
      ambientGain.gain.setTargetAtTime(isAudioPlaying ? 0.05 : 0.0001, audioCtx.currentTime, 0.1);
    }

    btn.classList.toggle("is-active", isAudioPlaying);
    btn.innerHTML = isAudioPlaying ? "🔊 Audio: ON" : "🔇 Audio: Muted";
  }

  function playAudioChirp() {
    if (!audioCtx || !isAudioPlaying) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.19);
    } catch (_) {}
  }

  // --- Render Loop ---
  function animate() {
    requestAnimationFrame(animate);

    // 1. Rotate Earth and Cloud Layer underneath ISS
    if (earthMesh) earthMesh.rotation.y += 0.0003;
    if (cloudsMesh) cloudsMesh.rotation.y += 0.00045;

    // 2. Solar Arrays track the sun
    solarRotators.forEach((rotator) => {
      rotator.rotation.x += 0.0015;
    });

    // 3. ISS subtle orbital attitude drift
    if (issGroup && currentViewMode === "orbit") {
      issGroup.rotation.y = Math.sin(Date.now() * 0.0002) * 0.04;
    }

    // 4. Smooth Camera Lerp
    if (targetCamPos) {
      camera.position.lerp(targetCamPos, 0.05);
      if (camera.position.distanceTo(targetCamPos) < 0.05) {
        targetCamPos = null;
      }
    }

    if (targetLookAt) {
      currentLookAt.lerp(targetLookAt, 0.05);
      controls.target.copy(currentLookAt);
      if (currentLookAt.distanceTo(targetLookAt) < 0.05) {
        targetLookAt = null;
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // Start on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
