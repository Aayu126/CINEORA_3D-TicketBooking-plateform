/**
 * CINEORA - Advanced 3D Cinema Hall with Multi-Architecture Support
 * Directly replicates the Fab 3D Auditorium model with architectural Balcony:
 * - Structure 1: Grand Royal Wood Auditorium (Fab 3D Model with vertical oak acoustic slats,
 *                cantilevered balcony mezzanine with wood fascia & white handrail, 3-block seating,
 *                stage stairs, and ceiling pin spots)
 * - Structure 2: IMAX Laser Multiplex (Images 1 & 2 dark acoustic groove panels, wall speakers)
 * - Structure 3: Luxe VIP Boutique & Private Balcony Boxes
 * 
 * Features:
 * - 360° free continuous orbital camera rotation
 * - Interactive on-canvas Zoom In (+), Zoom Out (-), Reset, and 360° auto-orbit
 * - Dedicated Balcony viewpoints: Balcony Center, Left VIP Box, Right VIP Box
 * - Interactive raycasting seat inspection & smart Best Seats allocation algorithm
 */

class CinemaHall3D {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      movie: null,
      showtime: null,
      structure: 'grand-wood', // 'grand-wood' | 'multiplex-dark' | 'vip-lounge'
      onSeatToggle: null,
      onSeatHover: null
    }, options);

    this.currentStructure = this.options.structure || 'grand-wood';
    this.selectedSeats = new Set();
    this.seatMeshes = new Map();
    this.seatData = new Map();
    this.hallDecorObjects = []; // To easily clear & switch architectures

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredSeat = null;
    this.activePreset = 'overview';
    
    // 360 Rotation & Spherical Camera State
    this.isTouring = false;
    this.isAutoRotating360 = false;
    this.houseLightsOn = false;
    this.balconyNeonOn = true;
    this.lightCones = [];
    this.lightLenses = [];

    // Theater Screen Trailer State
    this.trailerVideo = null;
    this.isTrailerPlaying = false;
    this.isTrailerMuted = true;

    // Spherical coordinates for 360 degree orbital camera
    this.spherical = {
      radius: 30,
      theta: 0,
      phi: 1.15
    };
    this.targetSpherical = {
      radius: 30,
      theta: 0,
      phi: 1.15
    };
    this.orbitCenter = new THREE.Vector3(0, 4.0, 7.5);
    this.targetOrbitCenter = new THREE.Vector3(0, 4.0, 7.5);

    // Camera preset coordinates tailored for realistic 400-seat cinema & balcony seating
    this.cameraPresets = {
      overview: {
        spherical: { radius: 42, theta: 0.03, phi: 0.98 },
        center: new THREE.Vector3(0, 5.2, 8.5)
      },
      sleeper: {
        // Direct view from and onto the luxury VIP Sleeper Beds at Row P (top balcony tier)!
        spherical: { radius: 18, theta: 0.10, phi: 1.18 },
        center: new THREE.Vector3(0, 10.2, 28.2)
      },
      stage: {
        spherical: { radius: 32, theta: Math.PI, phi: 1.25 },
        center: new THREE.Vector3(0, 4.8, 8.0)
      },
      balcony: {
        // Direct view from the center front row of the elevated Balcony Mezzanine overlooking the 400-seat hall!
        spherical: { radius: 26, theta: 0.02, phi: 1.10 },
        center: new THREE.Vector3(0, 8.2, 19.5)
      },
      balcony_left: {
        // Balcony Left Wing view
        spherical: { radius: 24, theta: 0.46, phi: 1.10 },
        center: new THREE.Vector3(-8.0, 8.2, 19.5)
      },
      balcony_right: {
        // Balcony Right Wing view
        spherical: { radius: 24, theta: -0.46, phi: 1.10 },
        center: new THREE.Vector3(8.0, 8.2, 19.5)
      },
      birdseye: {
        spherical: { radius: 52, theta: 0, phi: 0.16 },
        center: new THREE.Vector3(0, 3.5, 9.0)
      }
    };

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030307);
    this.scene.fog = new THREE.FogExp2(0x030307, 0.020);

    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 160);
    this.updateCameraFromSpherical(true);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.id = 'cinema-3d-canvas';
    if (this.container.firstChild) {
      this.container.insertBefore(this.renderer.domElement, this.container.firstChild);
    } else {
      this.container.appendChild(this.renderer.domElement);
    }

    // 2. Generate PBR Procedural Textures
    this.generateProceduralTextures();

    // 3. Lighting System
    this.setupLighting();

    // 4. Build Selected Theater Architecture
    this.buildTheaterArchitecture(this.currentStructure);

    // 5. Build Auditorium Seats
    this.buildAuditoriumSeats();

    // 6. Controls & Events
    this.bindEvents();

    // 7. Initialize Interactive Theater Screen Trailer
    this.initTrailerVideo();

    // Auto-start trailer video on theater screen
    setTimeout(() => {
      this.playTheaterTrailer();
    }, 150);

    // 8. Animation Loop
    this.animate();
  }

  generateProceduralTextures() {
    // 1. Natural Warm Oak Acoustic Timber Texture (Fab Model Images 3, 4, 5)
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 1024;
    woodCanvas.height = 1024;
    const wCtx = woodCanvas.getContext('2d');

    // Base warm honey/oak timber gradient
    const wGrad = wCtx.createLinearGradient(0, 0, 1024, 0);
    wGrad.addColorStop(0, '#b8824a');
    wGrad.addColorStop(0.3, '#9d6836');
    wGrad.addColorStop(0.7, '#c6915b');
    wGrad.addColorStop(1, '#8e5b2b');
    wCtx.fillStyle = wGrad;
    wCtx.fillRect(0, 0, 1024, 1024);

    // Vertical Acoustic Timber Slat Lines
    const slatWidth = 32;
    for (let x = 0; x < 1024; x += slatWidth) {
      // Dark groove between slats
      wCtx.fillStyle = 'rgba(38, 22, 10, 0.85)';
      wCtx.fillRect(x, 0, 4, 1024);

      // Slat edge highlight
      wCtx.fillStyle = 'rgba(255, 230, 190, 0.25)';
      wCtx.fillRect(x + 4, 0, 2, 1024);

      // Subtle vertical wood grain fiber
      for (let i = 0; i < 4; i++) {
        const lineX = x + 8 + Math.random() * (slatWidth - 12);
        wCtx.fillStyle = 'rgba(70, 40, 18, 0.15)';
        wCtx.fillRect(lineX, 0, 1 + Math.random() * 2, 1024);
      }
    }
    this.oakWoodTexture = new THREE.CanvasTexture(woodCanvas);
    this.oakWoodTexture.wrapS = THREE.RepeatWrapping;
    this.oakWoodTexture.wrapT = THREE.RepeatWrapping;

    // 2. Dark Acoustic Fabric Groove Tile Texture (Images 1 & 2)
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 512;
    tileCanvas.height = 512;
    const tCtx = tileCanvas.getContext('2d');
    tCtx.fillStyle = '#181822';
    tCtx.fillRect(0, 0, 512, 512);

    // Horizontal & vertical groove seams
    tCtx.fillStyle = '#0b0b12';
    for (let y = 0; y < 512; y += 64) {
      tCtx.fillRect(0, y, 512, 4);
    }
    for (let x = 0; x < 512; x += 128) {
      tCtx.fillRect(x, 0, 4, 512);
    }
    this.acousticTileTexture = new THREE.CanvasTexture(tileCanvas);
    this.acousticTileTexture.wrapS = THREE.RepeatWrapping;
    this.acousticTileTexture.wrapT = THREE.RepeatWrapping;

    // 3. Dark Carpet Texture
    const carpetCanvas = document.createElement('canvas');
    carpetCanvas.width = 256;
    carpetCanvas.height = 256;
    const cCtx = carpetCanvas.getContext('2d');
    cCtx.fillStyle = '#111119';
    cCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1500; i++) {
      cCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)';
      cCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    this.carpetTexture = new THREE.CanvasTexture(carpetCanvas);
    this.carpetTexture.wrapS = THREE.RepeatWrapping;
    this.carpetTexture.wrapT = THREE.RepeatWrapping;
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x22223a, 0.75);
    this.scene.add(this.ambientLight);

    // Movie Screen Projection Light (casts colored atmospheric spill)
    this.screenLight = new THREE.PointLight(0x06b6d4, 4.5, 55, 1.15);
    this.screenLight.position.set(0, 7.5, -6);
    this.scene.add(this.screenLight);

    // House Lights
    this.houseLightGroup = new THREE.Group();
    const lightPositions = [
      [-9, 18, 4], [0, 18, 4], [9, 18, 4],
      [-9, 19, 16], [0, 19, 16], [9, 19, 16],
      [-8, 20, 24], [8, 20, 24]
    ];
    lightPositions.forEach(([x, y, z]) => {
      const pl = new THREE.PointLight(0xffeedd, 0, 28);
      pl.position.set(x, y, z);
      this.houseLightGroup.add(pl);
    });
    this.scene.add(this.houseLightGroup);

    // Balcony Ambient Pendant Lights
    this.balconyLightGroup = new THREE.Group();
    const balconyLightPos = [
      [-7, 13, 20], [0, 13, 20], [7, 13, 20]
    ];
    balconyLightPos.forEach(([x, y, z]) => {
      const bLight = new THREE.PointLight(0xa855f7, 1.8, 15);
      bLight.position.set(x, y, z);
      this.balconyLightGroup.add(bLight);
    });
    this.scene.add(this.balconyLightGroup);

    // Stage Front Spotlight
    this.stageSpot = new THREE.SpotLight(0xf59e0b, 3.0, 25, Math.PI / 3);
    this.stageSpot.position.set(0, 0.6, -9);
    this.scene.add(this.stageSpot);
  }

  /**
   * Builds the 3 distinct 3D theater architectures matching the user's reference images:
   * - 'grand-wood': Grand Royal Wood Auditorium with Cantilevered Balcony (Fab 3D Model Images 3, 4, 5)
   * - 'multiplex-dark': IMAX Laser Multiplex with Acoustic Tiles & Surround Speakers (Images 1 & 2)
   * - 'vip-lounge': Luxe VIP Boutique Lounge with Velvet Acoustic Panels & Private Opera Boxes
   */
  buildTheaterArchitecture(structureType) {
    // Clear previous architecture meshes
    this.hallDecorObjects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    this.hallDecorObjects = [];

    // Reset dynamic screen references
    this.screenMesh = null;
    this.screenCtx = null;
    this.screenCanvas = null;

    if (structureType === 'grand-wood') {
      // 1. Grand Royal Wood Auditorium with Balcony (Fab 3D Model Images 3, 4, 5)
      this.buildGrandWoodTheater();
      this.buildProperCinemaScreen('grand-wood');
    } else if (structureType === 'multiplex-dark') {
      // 2. IMAX Laser Multiplex (Images 1 & 2 dark acoustic black-box)
      this.loadGlbTheaterModel('multiplex-dark');
      this.buildProperCinemaScreen('multiplex-dark');
    } else if (structureType === 'vip-lounge') {
      // 3. Luxe VIP Boutique Lounge with Private Opera Boxes
      this.buildVipLoungeTheater();
      this.buildProperCinemaScreen('vip-lounge');
    } else {
      this.buildGrandWoodTheater();
      this.buildProperCinemaScreen('grand-wood');
    }
  }

  loadGlbTheaterModel(structureType) {
    if (window._cineora_cached_glb) {
      this.applyGlbTheaterScene(window._cineora_cached_glb, structureType);
      return;
    }

    if (typeof THREE.GLTFLoader === 'function') {
      const loader = new THREE.GLTFLoader();
      loader.load('models/cinema_theatre_3d_model.glb', (gltf) => {
        window._cineora_cached_glb = gltf.scene;
        this.applyGlbTheaterScene(gltf.scene, structureType);
      }, undefined, (err) => {
        console.warn('GLTFLoader error, fallback to procedural multiplex:', err);
        this.buildMultiplexDarkTheater();
      });
    } else {
      this.buildMultiplexDarkTheater();
    }
  }

  buildProceduralTheater(structureType) {
    if (structureType === 'grand-wood') {
      this.buildGrandWoodTheater();
    } else if (structureType === 'multiplex-dark') {
      this.buildMultiplexDarkTheater();
    } else {
      this.buildVipLoungeTheater();
    }
    this.buildProperCinemaScreen(structureType);
  }

  applyGlbTheaterScene(glbScene, structureType) {
    const root = glbScene.clone(true);
    root.rotation.set(-Math.PI / 2, Math.PI, 0);
    root.position.set(0, 0, -10);

    // Apply high-end realistic interior PBR materials to model meshes
    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.name === 'screen') {
          // Hide raw untextured quad from GLB; our 4K animated projection canvas will render in its exact spot
          child.visible = false;
        } else if (child.name === 'wall') {
          // Dark grooved acoustic tiles for IMAX Laser Multiplex (Images 1 & 2)
          child.material = new THREE.MeshStandardMaterial({
            map: this.acousticTileTexture,
            roughness: 0.65,
            metalness: 0.05,
            color: 0x14151e
          });
        } else if (child.name === 'carpet') {
          child.material = new THREE.MeshStandardMaterial({
            map: this.carpetTexture,
            roughness: 0.88,
            metalness: 0.02,
            color: 0x141620
          });
        } else if (child.name === 'stage') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x111116,
            roughness: 0.7,
            metalness: 0.15
          });
        } else if (child.name === 'trim') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x22242e,
            roughness: 0.4,
            metalness: 0.45
          });
        } else if (child.name === 'aisle') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x0c0c14,
            roughness: 0.65
          });
        } else if (child.name === 'speaker') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x1c1c24,
            roughness: 0.45,
            metalness: 0.4
          });
        } else if (child.name === 'door') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x1e1222,
            roughness: 0.6,
            metalness: 0.1
          });
        } else if (child.name === 'light') {
          child.material = new THREE.MeshBasicMaterial({ color: 0xfff3d6 });
        } else if (child.name === 'seat' || child.name === 'seat_dark' || child.name === 'metal') {
          // Hide static unclickable model chairs; our interactive 192 chairs and sleeper beds are created dynamically
          child.visible = false;
        }
      }
    });

    // Add glowing Aisle Step LED Runners
    const aisleGroup = new THREE.Group();
    [-7.8, 7.8].forEach(aisleX => {
      for (let z = -4.5; z <= 17.5; z += 2.2) {
        const stepY = 0.55 + ((z + 4.5) / 22.0) * 5.4;
        const stripGeo = new THREE.BoxGeometry(0.75, 0.03, 0.12);
        const stripMat = new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.85
        });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.set(aisleX, stepY + 0.04, z);
        aisleGroup.add(strip);
      }
    });
    root.add(aisleGroup);

    // Add Illuminated Green Exit signs over doors
    const exitCanvas = document.createElement('canvas');
    exitCanvas.width = 256; exitCanvas.height = 80;
    const eCtx = exitCanvas.getContext('2d');
    eCtx.fillStyle = '#064e3b'; eCtx.fillRect(0, 0, 256, 80);
    eCtx.fillStyle = '#34d399'; eCtx.font = '900 36px "Plus Jakarta Sans", "Inter", sans-serif'; eCtx.textAlign = 'center';
    eCtx.fillText('EXIT 🚪', 128, 52);
    const exitTex = new THREE.CanvasTexture(exitCanvas);
    const exitMat = new THREE.MeshBasicMaterial({ map: exitTex });
    const exitGeo = new THREE.PlaneGeometry(1.2, 0.4);

    const leftExit = new THREE.Mesh(exitGeo, exitMat);
    leftExit.position.set(-14.3, 3.85, 7.5);
    leftExit.rotation.y = Math.PI / 2;
    root.add(leftExit);

    const rightExit = new THREE.Mesh(exitGeo, exitMat);
    rightExit.position.set(14.3, 3.85, 7.5);
    rightExit.rotation.y = -Math.PI / 2;
    root.add(rightExit);

    this.hallDecorObjects.push(root);
    this.scene.add(root);
  }

  /**
   * Structure 1: Grand Royal Wood Auditorium (400 Seats Capacity)
   * High-capacity realistic cinema matching user reference images:
   * - Stepped concrete stadium risers for 262 stalls seats (Rows A to J)
   * - Elevated cantilevered Balcony Mezzanine deck with stepped tiers for 138 balcony seats (Rows K to P)
   * - 3-part angled front fascia with continuous illuminated white/brass safety railing
   * - Realistic acoustic panel walls with horizontal seam joints (Image 2)
   * - 14 wall-mounted Dolby Atmos surround speakers with spotlight cones
   * - 4 emergency exit doors with illuminated green EXIT signs
   * - Overhead HVAC air ventilation grills (Image 2)
   * - Dual projection booth windows on rear wall (Image 2)
   * - Proscenium framing with side curtains (Image 1)
   */
  buildGrandWoodTheater() {
    const group = new THREE.Group();

    // 1. Acoustic Side Walls with horizontal panel seams (Image 2)
    const wallGeo = new THREE.PlaneGeometry(52, 24);
    const woodMat = new THREE.MeshStandardMaterial({
      map: this.oakWoodTexture,
      roughness: 0.45,
      metalness: 0.08
    });
    woodMat.map.repeat.set(6, 3);

    // Left Wall
    const leftWall = new THREE.Mesh(wallGeo, woodMat);
    leftWall.position.set(-20.5, 11, 8.5);
    leftWall.rotation.y = Math.PI / 2 - 0.03;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(wallGeo, woodMat);
    rightWall.position.set(20.5, 11, 8.5);
    rightWall.rotation.y = -Math.PI / 2 + 0.03;
    rightWall.receiveShadow = true;
    group.add(rightWall);

    // Back Wall behind Balcony Daybeds
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(42, 24), woodMat);
    backWall.position.set(0, 11, 32.5);
    backWall.rotation.y = Math.PI;
    group.add(backWall);

    // 2. Dark Acoustic Ceiling with Recessed Downlights & Cove Light
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x12121a, roughness: 0.92 });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(42, 52), ceilingMat);
    ceiling.position.set(0, 22.8, 8.5);
    ceiling.rotation.x = Math.PI / 2;
    group.add(ceiling);

    // Ceiling Pin-Spot Downlights
    const pinGeo = new THREE.CircleGeometry(0.24, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let r = 0; r < 6; r++) {
      for (let c = -3; c <= 3; c++) {
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.set(c * 5.6, 22.75, -4 + r * 6.5);
        pin.rotation.x = Math.PI / 2;
        group.add(pin);
      }
    }

    // Curved Ceiling Accent Cove Light
    const coveGeo = new THREE.BoxGeometry(34, 0.15, 0.45);
    const coveMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const cove = new THREE.Mesh(coveGeo, coveMat);
    cove.position.set(0, 22.6, 9.5);
    group.add(cove);

    // 3. Concrete Stepped Stadium Risers for Stalls (Rows A to J) - Image 2
    const carpetMat = new THREE.MeshStandardMaterial({
      map: this.carpetTexture,
      roughness: 0.85
    });
    carpetMat.map.repeat.set(12, 14);

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x161622,
      roughness: 0.85
    });

    // 10 Stalls Tiers under Rows A to J
    const stallsTiers = [
      { z: -5.5, y: 0.25, h: 0.35, d: 2.1 },
      { z: -3.5, y: 0.65, h: 0.45, d: 2.1 },
      { z: -1.5, y: 1.10, h: 0.50, d: 2.1 },
      { z: 0.7,  y: 1.60, h: 0.55, d: 2.1 },
      { z: 2.9,  y: 2.10, h: 0.55, d: 2.1 },
      { z: 5.1,  y: 2.65, h: 0.60, d: 2.1 },
      { z: 7.3,  y: 3.20, h: 0.60, d: 2.1 },
      { z: 9.5,  y: 3.80, h: 0.65, d: 2.1 },
      { z: 12.0, y: 4.45, h: 0.70, d: 2.4 },
      { z: 14.5, y: 5.10, h: 0.75, d: 2.5 }
    ];

    stallsTiers.forEach(tier => {
      const riser = new THREE.Mesh(new THREE.BoxGeometry(32, tier.h, tier.d), concreteMat);
      riser.position.set(0, tier.y, tier.z);
      riser.receiveShadow = true;
      group.add(riser);

      const pad = new THREE.Mesh(new THREE.PlaneGeometry(31.8, tier.d - 0.1), carpetMat);
      pad.position.set(0, tier.y + tier.h / 2 + 0.01, tier.z);
      pad.rotation.x = -Math.PI / 2;
      pad.receiveShadow = true;
      group.add(pad);
    });

    // Stalls Aisle LED Runners (along X = -5.0 and X = 5.0)
    [-5.0, 5.0].forEach(aisleX => {
      stallsTiers.forEach(t => {
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.03, 0.1),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 })
        );
        strip.position.set(aisleX, t.y + t.h / 2 + 0.02, t.z - t.d / 2 + 0.1);
        group.add(strip);
      });
    });

    // 4. Elevated Cantilevered Balcony Mezzanine Structure (Rows K to P)
    const balconyDeckZ = 24.5;
    const balconyDeckY = 7.1;
    const balconyDepth = 14.8;

    const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(39, 0.9, balconyDepth), concreteMat);
    balconySlab.position.set(0, balconyDeckY, balconyDeckZ);
    balconySlab.receiveShadow = true;
    group.add(balconySlab);

    // 5 Stepped Risers on the Balcony for Rows K, L, M, N, P
    const balconyTiers = [
      { z: 18.5, y: 7.20, h: 0.40, d: 2.2 },
      { z: 20.8, y: 7.85, h: 0.50, d: 2.2 },
      { z: 23.1, y: 8.50, h: 0.55, d: 2.2 },
      { z: 25.4, y: 9.15, h: 0.60, d: 2.2 },
      { z: 28.2, y: 9.90, h: 0.65, d: 2.8 }
    ];

    balconyTiers.forEach(tier => {
      const bRiser = new THREE.Mesh(new THREE.BoxGeometry(37, tier.h, tier.d), concreteMat);
      bRiser.position.set(0, tier.y, tier.z);
      bRiser.receiveShadow = true;
      group.add(bRiser);

      const bPad = new THREE.Mesh(new THREE.PlaneGeometry(36.8, tier.d - 0.1), carpetMat);
      bPad.position.set(0, tier.y + tier.h / 2 + 0.01, tier.z);
      bPad.rotation.x = -Math.PI / 2;
      group.add(bPad);

      // Balcony Aisle step lights
      [-6.5, 6.5].forEach(bX => {
        const bStrip = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 0.03, 0.1),
          new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.9 })
        );
        bStrip.position.set(bX, tier.y + tier.h / 2 + 0.02, tier.z - tier.d / 2 + 0.1);
        group.add(bStrip);
      });
    });

    // 3-part Angled Balcony Wood Fascia
    const fasciaMat = woodMat;
    const centerFascia = new THREE.Mesh(new THREE.BoxGeometry(22, 1.7, 0.45), fasciaMat);
    centerFascia.position.set(0, balconyDeckY + 0.85, 17.3);
    group.add(centerFascia);

    const leftFascia = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.7, 0.45), fasciaMat);
    leftFascia.position.set(-14.2, balconyDeckY + 0.85, 18.5);
    leftFascia.rotation.y = -0.26;
    group.add(leftFascia);

    const rightFascia = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.7, 0.45), fasciaMat);
    rightFascia.position.set(14.2, balconyDeckY + 0.85, 18.5);
    rightFascia.rotation.y = 0.26;
    group.add(rightFascia);

    // Continuous Illuminated White/Brass Safety Railing along Balcony Top
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffedd5,
      emissiveIntensity: 0.65,
      roughness: 0.2
    });

    const centerRail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 22, 12), railMat);
    centerRail.rotation.z = Math.PI / 2;
    centerRail.position.set(0, balconyDeckY + 1.75, 17.3);
    group.add(centerRail);

    const leftRail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 9.5, 12), railMat);
    leftRail.rotation.z = Math.PI / 2;
    leftRail.position.set(-14.2, balconyDeckY + 1.75, 18.5);
    leftRail.rotation.y = -0.26;
    group.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 9.5, 12), railMat);
    rightRail.rotation.z = Math.PI / 2;
    rightRail.position.set(14.2, balconyDeckY + 1.75, 18.5);
    rightRail.rotation.y = 0.26;
    group.add(rightRail);

    // 5. 14 Wall-Mounted Dolby Atmos Surround Speakers with Downlights (Image 2)
    const speakerZ = [-4, 2, 8, 14, 20, 26, 30];
    speakerZ.forEach(z => {
      this.createWallSpeaker(group, -20.2, 11.5, z, Math.PI / 2);
      this.createWallSpeaker(group, 20.2, 11.5, z, -Math.PI / 2);
    });

    // 6. 4 Emergency Exit Doors with Illuminated Green Signs (Image 2)
    this.createExitDoor(group, -20.2, 1.2, -3.0, woodMat); // Front-left
    this.createExitDoor(group, 20.2, 1.2, -3.0, woodMat);  // Front-right
    this.createExitDoor(group, -20.2, 5.6, 15.5, woodMat); // Rear-left
    this.createExitDoor(group, 20.2, 5.6, 15.5, woodMat);  // Rear-right

    // 7. Overhead HVAC Air Return Grills (Image 2 - top right)
    const ventMat = new THREE.MeshStandardMaterial({ color: 0x08080f, roughness: 0.85 });
    [-15.0, 15.0].forEach(ventX => {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.8, 0.15), ventMat);
      vent.position.set(ventX, 18.5, -6.5);
      group.add(vent);

      for (let s = -0.3; s <= 0.3; s += 0.12) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.04, 0.16), new THREE.MeshBasicMaterial({ color: 0x1f1f2e }));
        slat.position.set(ventX, 18.5 + s, -6.48);
        group.add(slat);
      }
    });

    // 8. Projection Booth Window Apertures on Rear Wall (Image 2)
    const boothMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      transmission: 0.8
    });
    [-3.5, 3.5].forEach(winX => {
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 0.2), concreteMat);
      winFrame.position.set(winX, 14.8, 32.3);
      group.add(winFrame);

      const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.2), boothMat);
      glass.position.set(winX, 14.8, 32.18);
      glass.rotation.y = Math.PI;
      group.add(glass);

      const pLight = new THREE.PointLight(0x06b6d4, 0.8, 10);
      pLight.position.set(winX, 14.8, 31.8);
      group.add(pLight);
    });

    // 9. Red Proscenium Curtains Framing Screen & Stage (Image 1)
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0x6b101b,
      roughness: 0.75,
      metalness: 0.1
    });

    const leftCurtain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 13.0, 1.2), curtainMat);
    leftCurtain.position.set(-14.2, 7.8, -12.5);
    group.add(leftCurtain);

    const rightCurtain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 13.0, 1.2), curtainMat);
    rightCurtain.position.set(14.2, 7.8, -12.5);
    group.add(rightCurtain);

    const topPelmet = new THREE.Mesh(new THREE.BoxGeometry(30.0, 1.4, 1.4), curtainMat);
    topPelmet.position.set(0, 14.2, -12.5);
    group.add(topPelmet);

    // 10. Modular Acoustic Ceiling with 28 Recessed Pin-Spot Downlights (Image 2)
    this.createCeilingDownlightsGrid(group);

    // 11. Cinema Waste Bins / Receptacles (Image 2)
    this.createAuditoriumBins(group);

    // 12. Volumetric Dual Projector Beams (Image 2)
    this.createProjectorBeams(group);

    this.hallDecorObjects.push(group);
    this.scene.add(group);
  }

  /**
   * Structure 2: Modern Acoustic Multiplex / Black Box (Images 1 & 2)
   */
  buildMultiplexDarkTheater() {
    const group = new THREE.Group();

    // Dark Acoustic Grooved Fabric Walls
    const wallGeo = new THREE.PlaneGeometry(48, 24);
    const darkTileMat = new THREE.MeshStandardMaterial({
      map: this.acousticTileTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    darkTileMat.map.repeat.set(6, 3);

    const leftWall = new THREE.Mesh(wallGeo, darkTileMat);
    leftWall.position.set(-19, 11, 8);
    leftWall.rotation.y = Math.PI / 2;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, darkTileMat);
    rightWall.position.set(19, 11, 8);
    rightWall.rotation.y = -Math.PI / 2;
    group.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(38, 24), darkTileMat);
    backWall.position.set(0, 11, 31);
    backWall.rotation.y = Math.PI;
    group.add(backWall);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(38, 48), new THREE.MeshStandardMaterial({ color: 0x08080f }));
    ceiling.position.set(0, 22, 8);
    ceiling.rotation.x = Math.PI / 2;
    group.add(ceiling);

    // Wall-Mounted Surround Speakers with Spotlight Cones (Image 1 & 2)
    const speakerZ = [-2, 4, 10, 16, 22];
    speakerZ.forEach(z => {
      this.createWallSpeaker(group, -18.7, 9.5, z, Math.PI / 2);
      this.createWallSpeaker(group, 18.7, 9.5, z, -Math.PI / 2);
    });

    // Elevated Mezzanine Balcony Tier
    const balconyDeckZ = 19.5;
    const balconyDeckY = 7.5;
    const balconySlab = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.8, 11),
      new THREE.MeshStandardMaterial({ color: 0x11111a, roughness: 0.7 })
    );
    balconySlab.position.set(0, balconyDeckY, balconyDeckZ);
    group.add(balconySlab);

    // Cyan Glass Balustrade with Neon Cyan Railing
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(35, 1.2, 0.1),
      new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.35, transmission: 0.85 })
    );
    rail.position.set(0, balconyDeckY + 1.0, balconyDeckZ - 5.5);
    group.add(rail);

    const topBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 35, 12),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    topBar.rotation.z = Math.PI / 2;
    topBar.position.set(0, balconyDeckY + 1.62, balconyDeckZ - 5.5);
    group.add(topBar);

    // Floor with Cyan Neon Runners
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 44),
      new THREE.MeshStandardMaterial({ map: this.carpetTexture, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2 + 0.10;
    floor.position.set(0, 2.7, 7);
    group.add(floor);

    // Neon Floor Aisle Runners
    const runnerGeo = new THREE.BoxGeometry(0.12, 0.05, 20);
    const runnerMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const rL = new THREE.Mesh(runnerGeo, runnerMat);
    rL.position.set(-5, 2.5, 7);
    rL.rotation.x = 0.10;
    group.add(rL);

    const rR = new THREE.Mesh(runnerGeo, runnerMat);
    rR.position.set(5, 2.5, 7);
    rR.rotation.x = 0.10;
    group.add(rR);

    this.hallDecorObjects.push(group);
    this.scene.add(group);
  }

  /**
   * Structure 3: Luxe VIP Boutique Cinema
   */
  buildVipLoungeTheater() {
    const group = new THREE.Group();

    // Deep Royal Velvet Walls with Gold Trim
    const wallGeo = new THREE.PlaneGeometry(48, 24);
    const velvetMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.85 }); // Royal Plum / Velvet

    const leftWall = new THREE.Mesh(wallGeo, velvetMat);
    leftWall.position.set(-19, 11, 8);
    leftWall.rotation.y = Math.PI / 2;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, velvetMat);
    rightWall.position.set(19, 11, 8);
    rightWall.rotation.y = -Math.PI / 2;
    group.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(38, 24), velvetMat);
    backWall.position.set(0, 11, 31);
    backWall.rotation.y = Math.PI;
    group.add(backWall);

    // Golden Vertical Sconce Trims
    const sconceGeo = new THREE.BoxGeometry(0.08, 14, 0.08);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    for (let z = 0; z < 28; z += 5) {
      const sL = new THREE.Mesh(sconceGeo, goldMat);
      sL.position.set(-18.9, 11, z);
      group.add(sL);

      const sR = new THREE.Mesh(sconceGeo, goldMat);
      sR.position.set(18.9, 11, z);
      group.add(sR);
    }

    // VIP Private Balcony Boxes
    const balconyDeckZ = 19.5;
    const balconyDeckY = 7.6;
    const balconySlab = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.8, 11),
      new THREE.MeshStandardMaterial({ color: 0x1f1730 })
    );
    balconySlab.position.set(0, balconyDeckY, balconyDeckZ);
    group.add(balconySlab);

    // Gold Railing
    const topBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 35, 12),
      goldMat
    );
    topBar.rotation.z = Math.PI / 2;
    topBar.position.set(0, balconyDeckY + 1.5, balconyDeckZ - 5.5);
    group.add(topBar);

    // Floor with Deep Purple/Charcoal Carpet
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 44),
      new THREE.MeshStandardMaterial({ color: 0x0f0b18, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2 + 0.10;
    floor.position.set(0, 2.7, 7);
    group.add(floor);

    this.hallDecorObjects.push(group);
    this.scene.add(group);
  }

  createWallSpeaker(group, x, y, z, rotY) {
    const speakerGeo = new THREE.BoxGeometry(0.35, 0.75, 0.5);
    const speakerMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d14,
      roughness: 0.65,
      metalness: 0.3
    });
    const speaker = new THREE.Mesh(speakerGeo, speakerMat);
    speaker.position.set(x, y, z);
    speaker.rotation.y = rotY;
    group.add(speaker);

    // Front beveled speaker grille
    const grillGeo = new THREE.PlaneGeometry(0.48, 0.72);
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x161622, roughness: 0.9 });
    const grill = new THREE.Mesh(grillGeo, grillMat);
    grill.position.set(x > 0 ? x - 0.18 : x + 0.18, y, z);
    grill.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    group.add(grill);

    // Sconce downlight fixture ring under speaker
    const ringGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, y - 0.38, z);
    group.add(ring);

    // Conical downward volumetric light wash (Image 2)
    const coneHeight = 3.6;
    const coneRadius = 0.95;
    const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 16, 1, true);
    coneGeo.rotateX(Math.PI);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfff4e6,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.set(x > 0 ? x - 0.12 : x + 0.12, y - 0.4 - coneHeight / 2, z);
    coneMesh.userData.brightOpacity = 0.58;
    coneMesh.userData.dimOpacity = 0.12;
    group.add(coneMesh);
    if (this.lightCones) this.lightCones.push(coneMesh);
    if (this.lightLenses) this.lightLenses.push(ring);

    // PointLight illuminating acoustic wall & stairs beneath speaker
    const spot = new THREE.PointLight(0xffedd5, 0.65, 7.5, 1.2);
    spot.position.set(x > 0 ? x - 0.25 : x + 0.25, y - 0.8, z);
    group.add(spot);
    if (this.houseLightGroup) {
      this.houseLightGroup.add(spot);
    }
  }

  createExitDoor(group, x, y, z, frameMat) {
    // 1. Double Door Frame
    const frameGeo = new THREE.BoxGeometry(0.20, 2.5, 1.55);
    const frame = new THREE.Mesh(frameGeo, frameMat || new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 0.7 }));
    frame.position.set(x, y, z);
    group.add(frame);

    // 2. Twin Door Leaves with center groove
    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: 0x1a161e,
      roughness: 0.6,
      metalness: 0.2
    });
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.38, 0.72), doorLeafMat);
    doorL.position.set(x > 0 ? x - 0.05 : x + 0.05, y, z - 0.38);
    group.add(doorL);

    const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.38, 0.72), doorLeafMat);
    doorR.position.set(x > 0 ? x - 0.05 : x + 0.05, y, z + 0.38);
    group.add(doorR);

    // 3. Chrome Emergency Push Panic Bars (Image 2)
    const barMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.2 });
    [-0.38, 0.38].forEach(barZ => {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.58, 8), barMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(x > 0 ? x - 0.12 : x + 0.12, y, z + barZ);
      group.add(bar);
    });

    // 4. Illuminated Green EXIT Box above door (Image 2)
    const signBoxGeo = new THREE.BoxGeometry(0.18, 0.32, 0.82);
    const signBoxMat = new THREE.MeshStandardMaterial({ color: 0x052e16, roughness: 0.3 });
    const signBox = new THREE.Mesh(signBoxGeo, signBoxMat);
    signBox.position.set(x, y + 1.48, z);
    group.add(signBox);

    // Luminous Green Faceplate
    const faceGeo = new THREE.PlaneGeometry(0.78, 0.28);
    const faceMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.95
    });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(x > 0 ? x - 0.10 : x + 0.10, y + 1.48, z);
    face.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    group.add(face);

    // Soft Green Exit Glow
    const exitGlow = new THREE.PointLight(0x10b981, 0.8, 6.0);
    exitGlow.position.set(x > 0 ? x - 0.35 : x + 0.35, y + 1.48, z);
    group.add(exitGlow);
  }

  createCeilingDownlightsGrid(group) {
    // Suspended Acoustic Ceiling Tiles Structure (Image 2)
    const ceilGeo = new THREE.PlaneGeometry(40, 44);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0x08080f,
      roughness: 0.95,
      metalness: 0.05
    });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.position.set(0, 20.2, 10.5);
    ceiling.rotation.x = Math.PI / 2;
    group.add(ceiling);

    // Grid of Recessed Circular Pin-Spot Downlights (Image 2)
    // Spaced evenly across auditorium above stalls and balcony
    const cols = [-12, -4, 4, 12];
    const rows = [-4, 2, 8, 14, 20, 25, 29];

    const fixtureGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16);
    const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x14141e, metalness: 0.8, roughness: 0.3 });
    const lensGeo = new THREE.CircleGeometry(0.22, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfff8ed });

    // Subtle downlight cone
    const downConeGeo = new THREE.ConeGeometry(1.4, 7.5, 16, 1, true);
    downConeGeo.rotateX(Math.PI);
    const downConeMat = new THREE.MeshBasicMaterial({
      color: 0xfff6eb,
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    cols.forEach(x => {
      rows.forEach(z => {
        // Fixture Bezel
        const fix = new THREE.Mesh(fixtureGeo, fixtureMat);
        fix.position.set(x, 20.16, z);
        group.add(fix);

        // Glowing Lens
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.set(x, 20.12, z);
        lens.rotation.x = Math.PI / 2;
        group.add(lens);

        // Volumetric soft downwash
        const vCone = new THREE.Mesh(downConeGeo, downConeMat.clone());
        vCone.position.set(x, 20.1 - 3.75, z);
        vCone.userData.brightOpacity = 0.52;
        vCone.userData.dimOpacity = 0.045;
        group.add(vCone);
        if (this.lightCones) this.lightCones.push(vCone);
        if (this.lightLenses) this.lightLenses.push(lens);

        // Downlight Point Source
        const dLight = new THREE.PointLight(0xffeedd, 0.55, 14, 1.2);
        dLight.position.set(x, 19.8, z);
        group.add(dLight);
        if (this.houseLightGroup) {
          this.houseLightGroup.add(dLight);
        }
      });
    });
  }

  createAuditoriumBins(group) {
    // Brushed Stainless Steel Cinema Waste Bins (Image 2)
    const binGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.95, 16);
    const binMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e28,
      roughness: 0.45,
      metalness: 0.85
    });
    const lidGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.12, 16);
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x0f0f18, metalness: 0.9, roughness: 0.2 });

    const binPositions = [
      [-18.5, 0.48, -4.2],  // Front Left near exit
      [18.5, 0.48, -4.2],   // Front Right near exit
      [-17.8, 10.4, 30.5],  // Rear Balcony Left
      [17.8, 10.4, 30.5]    // Rear Balcony Right
    ];

    binPositions.forEach(([bx, by, bz]) => {
      const bMesh = new THREE.Mesh(binGeo, binMat);
      bMesh.position.set(bx, by, bz);
      group.add(bMesh);

      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.set(bx, by + 0.50, bz);
      group.add(lid);
    });
  }

  createProjectorBeams(group) {
    // Dual Volumetric Projection Beams from Rear Booth to Screen (Image 2)
    const beamGeo = new THREE.ConeGeometry(8.5, 44.0, 16, 1, true);
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.035,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    [-3.5, 3.5].forEach(bx => {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(bx, 11.3, 10.0);
      beam.rotation.x = -0.16;
      group.add(beam);
    });
  }

  /**
   * Proper Cinema Screen with Beveled Black Velvet Masking Frame,
   * Cylindrical Curvature, Bias Ambient Halo, and Stage Apron
   */
  buildProperCinemaScreen(structureType) {
    const group = new THREE.Group();

    // 1. Proscenium Stage Platform (underneath the big screen)
    const stageWidth = 28;
    const stageHeight = 1.35;
    const stageDepth = 6.5;

    let stageMatColor = 0x181822;
    if (structureType === 'grand-wood') stageMatColor = 0x241710;
    else if (structureType === 'vip-lounge') stageMatColor = 0x1b1424;

    const stageMat = new THREE.MeshStandardMaterial({
      color: stageMatColor,
      roughness: 0.65,
      metalness: 0.15
    });

    const stage = new THREE.Mesh(new THREE.BoxGeometry(stageWidth, stageHeight, stageDepth), stageMat);
    stage.position.set(0, stageHeight / 2, -9.5);
    stage.receiveShadow = true;
    group.add(stage);

    // Stage Access Stairs on Left and Right (matching Image 4)
    this.createStageStairs(group, -stageWidth / 2 + 1.2, stageHeight);
    this.createStageStairs(group, stageWidth / 2 - 1.2, stageHeight);

    // Stage Front Corner Wedge Monitor Speakers (Image 4)
    const monGeo = new THREE.BoxGeometry(0.85, 0.55, 0.65);
    const monMat = new THREE.MeshStandardMaterial({ color: 0x0e0e14, roughness: 0.85 });
    const monL = new THREE.Mesh(monGeo, monMat);
    monL.position.set(-6.5, stageHeight + 0.28, -6.8);
    monL.rotation.y = 0.2;
    group.add(monL);

    const monR = new THREE.Mesh(monGeo, monMat);
    monR.position.set(6.5, stageHeight + 0.28, -6.8);
    monR.rotation.y = -0.2;
    group.add(monR);

    // Glowing Neon Stage Lip Line
    const lipColor = structureType === 'grand-wood' ? 0xf59e0b : (structureType === 'vip-lounge' ? 0xc084fc : 0x06b6d4);
    const stageEdgeGeo = new THREE.BoxGeometry(stageWidth, 0.08, 0.12);
    const stageEdgeMat = new THREE.MeshBasicMaterial({ color: lipColor });
    const stageEdge = new THREE.Mesh(stageEdgeGeo, stageEdgeMat);
    stageEdge.position.set(0, stageHeight + 0.04, -6.3);
    group.add(stageEdge);

    // 2. High-Fidelity Curved Acoustic Cinema Screen (Concave to Auditorium)
    const screenWidth = 24.5;
    const screenHeight = 10.5;
    const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight, 48, 1);
    const pos = screenGeo.attributes.position;
    const curveDepth = 1.75;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      // Curve concave back away from audience into stage:
      pos.setZ(i, -Math.pow(x / (screenWidth / 2), 2) * curveDepth);
    }
    screenGeo.computeVertexNormals();

    // Dynamic 2048x1024 4K Laser Projection Canvas
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 2048;
    this.screenCanvas.height = 1024;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.generateMipmaps = true;
    this.screenTexture.minFilter = THREE.LinearMipmapLinearFilter;

    const screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTexture,
      side: THREE.DoubleSide
    });

    this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
    // Positioned front and center over stage at Y = 7.8, Z = -11.8
    this.screenMesh.position.set(0, 7.8, -11.8);
    group.add(this.screenMesh);

    // Dark Acoustic Backboard Wall Behind Screen (Ensures solid backdrop)
    const backboardGeo = new THREE.PlaneGeometry(36, 18);
    const backboardMat = new THREE.MeshStandardMaterial({ color: 0x06060a, roughness: 0.95 });
    const backboard = new THREE.Mesh(backboardGeo, backboardMat);
    backboard.position.set(0, 8.0, -14.2);
    group.add(backboard);

    // 3. Deep Light-Absorbing Black Velvet Masking Frame / Bezel
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.98,
      metalness: 0.02
    });

    // Top velvet masking bar (2.39:1 scope mask)
    const topBarGeo = new THREE.BoxGeometry(screenWidth + 1.2, 0.65, 0.45);
    const topBar = new THREE.Mesh(topBarGeo, velvetMat);
    topBar.position.set(0, 7.8 + screenHeight / 2 + 0.32, -12.4);
    group.add(topBar);

    // Bottom velvet masking bar
    const bottomBar = new THREE.Mesh(topBarGeo, velvetMat);
    bottomBar.position.set(0, 7.8 - screenHeight / 2 - 0.32, -12.4);
    group.add(bottomBar);

    // Left & Right curved velvet upright side bezels
    const sideBarGeo = new THREE.BoxGeometry(0.75, screenHeight + 1.25, 0.45);
    const leftBar = new THREE.Mesh(sideBarGeo, velvetMat);
    leftBar.position.set(-screenWidth / 2 - 0.35, 7.8, -13.5);
    leftBar.rotation.y = -0.15;
    group.add(leftBar);

    const rightBar = new THREE.Mesh(sideBarGeo, velvetMat);
    rightBar.position.set(screenWidth / 2 + 0.35, 7.8, -13.5);
    rightBar.rotation.y = 0.15;
    group.add(rightBar);

    // 4. Bias Backlight Ambient Halo (Behind Screen Frame)
    const haloGeo = new THREE.PlaneGeometry(screenWidth + 2.5, screenHeight + 2.0);
    const haloMat = new THREE.MeshBasicMaterial({
      color: lipColor,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 7.8, -13.8);
    group.add(halo);

    // 5. Dynamic Auditorium Projection Light Spill (Light reflecting from screen onto seats)
    if (!this.screenSpillLight) {
      this.screenSpillLight = new THREE.SpotLight(0xffeedd, 2.5, 42, Math.PI / 3, 0.85, 1.2);
      this.screenSpillLight.position.set(0, 8.0, -12.5);
      this.screenSpillLight.target.position.set(0, 2.0, 5.0);
      this.scene.add(this.screenSpillLight);
      this.scene.add(this.screenSpillLight.target);
    }

    this.hallDecorObjects.push(group);
    this.scene.add(group);
  }

  createStageStairs(group, x, stageH) {
    const stepCount = 4;
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x222230, roughness: 0.65 });
    const stripMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8, roughness: 0.2 });

    for (let i = 0; i < stepCount; i++) {
      const stepW = 1.4;
      const stepD = 0.45;
      const stepH = (stageH / stepCount);
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stepW, stepH, stepD),
        stepMat
      );
      step.position.set(x, (i + 0.5) * stepH, -6.8 + i * stepD);
      step.receiveShadow = true;
      group.add(step);

      // Cyan LED Safety Step Indicator Strip (Image 2)
      const strip = new THREE.Mesh(new THREE.BoxGeometry(stepW * 0.92, 0.02, 0.06), stripMat);
      strip.position.set(x, (i + 1) * stepH + 0.01, -6.8 + i * stepD + stepD / 2 - 0.03);
      group.add(strip);
    }

    // Modern Chrome Safety Handrail along staircase
    const postGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8);
    const railPost1 = new THREE.Mesh(postGeo, railMat);
    railPost1.position.set(x > 0 ? x + 0.72 : x - 0.72, stageH / 2 + 0.45, -6.8);
    group.add(railPost1);

    const railPost2 = new THREE.Mesh(postGeo, railMat);
    railPost2.position.set(x > 0 ? x + 0.72 : x - 0.72, stageH + 0.45, -6.8 + (stepCount - 1) * 0.45);
    group.add(railPost2);

    const handrailGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.95, 8);
    const handrail = new THREE.Mesh(handrailGeo, railMat);
    handrail.position.set(x > 0 ? x + 0.72 : x - 0.72, stageH * 0.75 + 0.45, -6.8 + (stepCount - 1) * 0.22);
    handrail.rotation.x = 0.38;
    group.add(handrail);
  }

  _initCachedSeatGeometries() {
    if (this._seatGeosInitialized) return;
    this._seatGeosInitialized = true;

    this._cushionGeo = new THREE.BoxGeometry(0.70, 0.16, 0.62);
    this._cushionReclinerGeo = new THREE.BoxGeometry(0.82, 0.16, 0.72);
    this._backGeo = new THREE.BoxGeometry(0.70, 0.74, 0.14);
    this._backReclinerGeo = new THREE.BoxGeometry(0.82, 0.82, 0.14);
    this._footGeo = new THREE.BoxGeometry(0.82 * 0.9, 0.10, 0.45);
    this._armGeo = new THREE.BoxGeometry(0.11, 0.28, 0.52);
    this._armReclinerGeo = new THREE.BoxGeometry(0.11, 0.28, 0.61);
    this._cupGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8);
    this._standGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.45, 8);
    this._standMat = new THREE.MeshStandardMaterial({ color: 0x0a0a10, metalness: 0.8 });
    this._armMat = new THREE.MeshStandardMaterial({ color: 0x14141e, roughness: 0.7 });
    this._cupMat = new THREE.MeshStandardMaterial({ color: 0x020205, metalness: 0.9, roughness: 0.2 });
  }

  /**
   * Builds 400-seat high-capacity Auditorium Seats matching the user request:
   * - 262 Ground Stalls seats across 10 tiers (Rows A to J) divided into 3 blocks (Image 1 & 2)
   * - 138 Elevated Balcony Mezzanine seats across 5 tiers (Rows K to P) with railing view
   * - Row P features 12 luxury VIP Royal Sleeper Daybeds on the top balcony tier!
   * - Total: 400 seats capacity!
   */
  buildAuditoriumSeats() {
    if (this.seatGroup) {
      this.scene.remove(this.seatGroup);
    }

    this.seatGroup = new THREE.Group();
    this.scene.add(this.seatGroup);

    this.seatMeshes.clear();
    this.seatData.clear();

    this._initCachedSeatGeometries();

    const tiers = window.CINE_DATA ? window.CINE_DATA.seatTiers : [];

    // Precise height and depth mapping for 400 seats across Stalls & Balcony
    const rowZMap = {
      // Ground Stalls (Orchestra Level) - 10 rows (262 seats)
      'A': -5.5,
      'B': -3.5,
      'C': -1.5,
      'D': 0.7,
      'E': 2.9,
      'F': 5.1,
      'G': 7.3,
      'H': 9.5,
      'I': 12.0,
      'J': 14.5,
      // Elevated Balcony Mezzanine Level - 5 rows (138 seats)
      'K': 18.5,
      'L': 20.8,
      'M': 23.1,
      'N': 25.4,
      'P': 28.2
    };

    const rowYMap = {
      // Ground Stalls (Orchestra Level)
      'A': 0.55,
      'B': 0.95,
      'C': 1.40,
      'D': 1.90,
      'E': 2.40,
      'F': 2.95,
      'G': 3.50,
      'H': 4.10,
      'I': 4.75,
      'J': 5.40,
      // Elevated Balcony Mezzanine Level
      'K': 7.50,
      'L': 8.15,
      'M': 8.80,
      'N': 9.45,
      'P': 10.20
    };

    const rowSeatCounts = {
      // Stalls (262 seats)
      'A': 24,
      'B': 24,
      'C': 26,
      'D': 28,
      'E': 28,
      'F': 28,
      'G': 28,
      'H': 28,
      'I': 24,
      'J': 24,
      // Balcony (138 seats)
      'K': 30,
      'L': 32,
      'M': 34,
      'N': 30,
      'P': 12 // 12 double sleeper beds
    };

    tiers.forEach((tier) => {
      tier.rows.forEach((rowLetter) => {
        const count = rowSeatCounts[rowLetter] || tier.seatsPerRow;
        const z = rowZMap[rowLetter] !== undefined ? rowZMap[rowLetter] : 0;
        const y = rowYMap[rowLetter] !== undefined ? rowYMap[rowLetter] : 1;
        const isBalconyRow = (rowLetter === 'K' || rowLetter === 'L' || rowLetter === 'M' || rowLetter === 'N' || rowLetter === 'P');

        if (tier.isSleeper) {
          // ================= LAST ROW (P): VIP ROYAL SLEEPER BEDS =================
          // 12 spacious couple daybeds across the top elevated balcony tier!
          const bedSpan = 26.0;
          for (let s = 1; s <= count; s++) {
            const seatId = `${rowLetter}${s}`;
            const bedIdx = s - 1;
            const seatX = ((bedIdx / Math.max(1, count - 1)) - 0.5) * bedSpan;
            const rotY = seatX < -5 ? 0.08 : (seatX > 5 ? -0.08 : 0);

            const hash = (seatId.charCodeAt(0) * 37 + s * 19) % 100;
            const isBooked = hash < 22;

            const seatInfo = {
              id: seatId,
              row: rowLetter,
              number: s,
              tier: tier,
              price: tier.price,
              position: new THREE.Vector3(seatX, y, z),
              rotationY: rotY,
              isBooked: isBooked,
              isSelected: false,
              baseColor: tier.hexColor,
              isSleeper: true,
              isCouple: true,
              isBalcony: true
            };

            this.seatData.set(seatId, seatInfo);
            const bedMesh = this.createSleeperBedMesh(seatInfo);
            this.seatMeshes.set(seatId, bedMesh);
            this.seatGroup.add(bedMesh);
          }
        } else {
          // ================= 3-BLOCK AUDITORIUM CHAIRS & RECLINERS =================
          // Matches Image 1 and Image 2: Left Wing (angled), Center Block, Right Wing (angled)
          const leftBlockLimit = Math.floor(count * 0.25);
          const rightBlockStart = Math.ceil(count * 0.75);
          const wingSpan = isBalconyRow ? 6.2 : 5.4;
          const centerSpan = isBalconyRow ? 14.5 : 12.8;

          for (let s = 1; s <= count; s++) {
            const seatId = `${rowLetter}${s}`;
            let seatX, rotY = 0;

            if (s <= leftBlockLimit) {
              // Left Wing Block: angled inward towards center of the big screen
              seatX = -9.2 - ((leftBlockLimit - s) / Math.max(1, leftBlockLimit - 1)) * wingSpan;
              rotY = 0.16;
            } else if (s > rightBlockStart) {
              // Right Wing Block: angled inward towards center of the big screen
              seatX = 9.2 + ((s - rightBlockStart) / Math.max(1, count - rightBlockStart)) * wingSpan;
              rotY = -0.16;
            } else {
              // Center Block: wide sweet spot
              const centerCount = rightBlockStart - leftBlockLimit;
              const centerIdx = s - leftBlockLimit - 1;
              seatX = ((centerIdx / Math.max(1, centerCount - 1)) - 0.5) * centerSpan;
              rotY = 0;
            }

            const hash = (seatId.charCodeAt(0) * 31 + s * 17) % 100;
            const isBooked = hash < 20 && !tier.isSweetSpot;

            const seatInfo = {
              id: seatId,
              row: rowLetter,
              number: s,
              tier: tier,
              price: tier.price,
              position: new THREE.Vector3(seatX, y, z),
              rotationY: rotY,
              isBooked: isBooked,
              isSelected: false,
              baseColor: tier.hexColor,
              isBalcony: isBalconyRow,
              isCouple: !!tier.isCouple
            };

            this.seatData.set(seatId, seatInfo);
            const seatMesh = this.createSingleSeatMesh(seatInfo);
            this.seatMeshes.set(seatId, seatMesh);
            this.seatGroup.add(seatMesh);
          }
        }
      });
    });
  }

  /**
   * Creates a luxury VIP Royal Sleeper Daybed for Row K
   */
  createSleeperBedMesh(seatInfo) {
    const group = new THREE.Group();
    group.position.copy(seatInfo.position);
    group.rotation.y = seatInfo.rotationY || 0;
    group.userData = { seatId: seatInfo.id };

    const color = seatInfo.isBooked ? 0x22222e : seatInfo.baseColor;

    // 1. Bed Base Platform
    const frameGeo = new THREE.BoxGeometry(2.10, 0.30, 1.70);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x141018,
      roughness: 0.6,
      metalness: 0.2
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0.15, 0);
    frame.castShadow = true;
    frame.receiveShadow = true;
    group.add(frame);

    // Warm amber LED underglow strip beneath bed
    const underglowGeo = new THREE.BoxGeometry(2.0, 0.04, 0.08);
    const underglowMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8
    });
    const underglow = new THREE.Mesh(underglowGeo, underglowMat);
    underglow.position.set(0, 0.02, 0.82);
    group.add(underglow);

    // 2. Plush Tufted Mattress (inclined 15 degrees for movie watching)
    const matGeo = new THREE.BoxGeometry(1.95, 0.22, 1.52);
    const matMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.45,
      metalness: 0.12,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0
    });
    const mattress = new THREE.Mesh(matGeo, matMaterial);
    mattress.position.set(0, 0.38, 0);
    mattress.rotation.x = -0.15;
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    group.add(mattress);

    // 3. Dual Luxury Head Pillows
    const pillowGeo = new THREE.BoxGeometry(0.72, 0.16, 0.40);
    const pillowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.05
    });

    const leftPillow = new THREE.Mesh(pillowGeo, pillowMat);
    leftPillow.position.set(-0.50, 0.58, 0.45);
    leftPillow.rotation.x = -0.30;
    leftPillow.castShadow = true;
    group.add(leftPillow);

    const rightPillow = new THREE.Mesh(pillowGeo, pillowMat);
    rightPillow.position.set(0.50, 0.58, 0.45);
    rightPillow.rotation.x = -0.30;
    rightPillow.castShadow = true;
    group.add(rightPillow);

    // 4. Folded Velvet Blanket Throw across foot
    const blanketGeo = new THREE.BoxGeometry(1.96, 0.08, 0.42);
    const blanketMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.65,
      metalness: 0.1
    });
    const blanket = new THREE.Mesh(blanketGeo, blanketMat);
    blanket.position.set(0, 0.36, -0.50);
    group.add(blanket);

    // 5. Wooden Privacy Wings / Headboard
    const headboardGeo = new THREE.BoxGeometry(2.14, 0.95, 0.10);
    const headboardMat = new THREE.MeshStandardMaterial({
      map: this.oakWoodTexture || null,
      color: 0x2a1b12,
      roughness: 0.5,
      metalness: 0.15
    });
    const headboard = new THREE.Mesh(headboardGeo, headboardMat);
    headboard.position.set(0, 0.65, 0.85);
    headboard.castShadow = true;
    group.add(headboard);

    // Side Privacy Partitions
    const partitionGeo = new THREE.BoxGeometry(0.08, 0.70, 1.20);
    const leftPart = new THREE.Mesh(partitionGeo, headboardMat);
    leftPart.position.set(-1.08, 0.55, 0.25);
    group.add(leftPart);

    const rightPart = new THREE.Mesh(partitionGeo, headboardMat);
    rightPart.position.set(1.08, 0.55, 0.25);
    group.add(rightPart);

    // 6. Cocktail Nightstand with Warm Lamp
    const tableGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.55, 16);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.7
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(1.22, 0.35, 0.40);
    group.add(table);

    const lampGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(1.22, 0.68, 0.40);
    group.add(lamp);

    group.cushion = mattress;
    group.backrest = headboard;
    return group;
  }

  /**
   * Creates an auditorium cinema chair or luxury motorized recliner
   */
  createSingleSeatMesh(seatInfo) {
    const group = new THREE.Group();
    group.position.copy(seatInfo.position);
    group.rotation.y = seatInfo.rotationY || 0;
    group.userData = { seatId: seatInfo.id };

    const color = seatInfo.isBooked ? 0x22222e : seatInfo.baseColor;
    const isRecliner = seatInfo.tier && (seatInfo.tier.id === 'recliner' || seatInfo.tier.isCouple);

    const seatWidth = isRecliner ? 0.82 : 0.70;
    const seatDepth = isRecliner ? 0.72 : 0.62;

    // Cushion (uses shared BoxGeometry)
    const cushionGeo = isRecliner ? this._cushionReclinerGeo : this._cushionGeo;
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: isRecliner ? 0.38 : 0.50,
      metalness: isRecliner ? 0.18 : 0.10
    });
    const cushion = new THREE.Mesh(cushionGeo, mat);
    cushion.position.set(0, 0.45, 0);
    cushion.castShadow = true;
    cushion.receiveShadow = true;
    group.add(cushion);

    // Backrest
    const backGeo = isRecliner ? this._backReclinerGeo : this._backGeo;
    const backrest = new THREE.Mesh(backGeo, mat);
    backrest.position.set(0, 0.84, 0.26);
    backrest.rotation.x = isRecliner ? -0.22 : -0.15;
    backrest.castShadow = true;
    group.add(backrest);

    // Motorized Footrest (if recliner)
    if (isRecliner) {
      const footrest = new THREE.Mesh(this._footGeo, mat);
      footrest.position.set(0, 0.24, -0.42);
      footrest.rotation.x = 0.25;
      footrest.castShadow = true;
      group.add(footrest);
    }

    // Armrests
    const armGeo = isRecliner ? this._armReclinerGeo : this._armGeo;
    const leftArm = new THREE.Mesh(armGeo, this._armMat);
    leftArm.position.set(-(seatWidth / 2 + 0.05), 0.58, 0.05);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, this._armMat);
    rightArm.position.set(seatWidth / 2 + 0.05, 0.58, 0.05);
    group.add(rightArm);

    // Cup Holder
    const cup = new THREE.Mesh(this._cupGeo, this._cupMat);
    cup.position.set(seatWidth / 2 + 0.05, 0.73, 0.16);
    group.add(cup);

    // Stand base
    const stand = new THREE.Mesh(this._standGeo, this._standMat);
    stand.position.set(0, 0.22, 0);
    group.add(stand);

    group.cushion = cushion;
    group.backrest = backrest;
    return group;
  }

  switchStructure(structureId) {
    if (this.currentStructure === structureId) return;
    this.currentStructure = structureId;
    this.buildTheaterArchitecture(structureId);
    this.buildAuditoriumSeats();

    // Reapply selected seats visual state
    this.selectedSeats.forEach(seatId => {
      const seat = this.seatData.get(seatId);
      const mesh = this.seatMeshes.get(seatId);
      if (seat && mesh) {
        this.updateSeatVisual(seat, mesh, 'selected');
      }
    });
  }

  toggleSeat(seatId) {
    const seat = this.seatData.get(seatId);
    if (!seat || seat.isBooked) return false;

    const mesh = this.seatMeshes.get(seatId);
    if (!mesh) return false;

    if (this.selectedSeats.has(seatId)) {
      this.selectedSeats.delete(seatId);
      seat.isSelected = false;
      this.updateSeatVisual(seat, mesh, 'normal');
    } else {
      this.selectedSeats.add(seatId);
      seat.isSelected = true;
      this.updateSeatVisual(seat, mesh, 'selected');
      this.playSeatChime(true);
    }

    if (this.options.onSeatToggle) {
      this.options.onSeatToggle(Array.from(this.selectedSeats).map(id => this.seatData.get(id)));
    }
    return true;
  }

  updateSeatVisual(seat, mesh, state) {
    if (!mesh || !mesh.cushion) return;

    let targetColor = seat.baseColor;
    let emissiveColor = 0x000000;
    let emissiveIntensity = 0;

    if (seat.isBooked) {
      targetColor = 0x22222e;
    } else if (state === 'selected' || seat.isSelected) {
      targetColor = 0x00f5d4; // Glowing cyan
      emissiveColor = 0x00f5d4;
      emissiveIntensity = 0.55;
    } else if (state === 'hover') {
      targetColor = 0xffffff;
      emissiveColor = 0xf59e0b;
      emissiveIntensity = 0.35;
    }

    if (mesh.cushion.material) {
      mesh.cushion.material.color.setHex(targetColor);
      mesh.cushion.material.emissive.setHex(emissiveColor);
      mesh.cushion.material.emissiveIntensity = emissiveIntensity;
    }

    if (mesh.backrest && mesh.backrest.material && !seat.isSleeper) {
      mesh.backrest.material.color.setHex(targetColor);
      mesh.backrest.material.emissive.setHex(emissiveColor);
      mesh.backrest.material.emissiveIntensity = emissiveIntensity;
    }
  }

  playSeatChime(select = true) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(select ? 587.33 : 440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(select ? 880 : 330, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }

  updateCameraFromSpherical(immediate = false) {
    const sinPhiRadius = Math.sin(this.spherical.phi) * this.spherical.radius;
    const x = this.orbitCenter.x + sinPhiRadius * Math.sin(this.spherical.theta);
    const y = this.orbitCenter.y + Math.cos(this.spherical.phi) * this.spherical.radius;
    const z = this.orbitCenter.z + sinPhiRadius * Math.cos(this.spherical.theta);

    if (immediate) {
      this.camera.position.set(x, y, z);
      this.camera.lookAt(this.orbitCenter);
    } else {
      this.camera.position.lerp(new THREE.Vector3(x, y, z), 0.08);
      this.camera.lookAt(this.orbitCenter);
    }
  }

  zoomIn(step = 3.5) {
    this.targetSpherical.radius = THREE.MathUtils.clamp(this.targetSpherical.radius - step, 8, 48);
  }

  zoomOut(step = 3.5) {
    this.targetSpherical.radius = THREE.MathUtils.clamp(this.targetSpherical.radius + step, 8, 48);
  }

  resetView() {
    this.setCameraPreset('overview');
  }

  toggleAutoRotate360() {
    this.isAutoRotating360 = !this.isAutoRotating360;
    this.isTouring = false;
    return this.isAutoRotating360;
  }

  setCameraPreset(presetName) {
    this.isTouring = false;
    this.isAutoRotating360 = false;
    this.activePreset = presetName;

    const preset = this.cameraPresets[presetName];
    if (preset) {
      this.targetSpherical.radius = preset.spherical.radius;
      this.targetSpherical.theta = preset.spherical.theta;
      this.targetSpherical.phi = preset.spherical.phi;
      this.targetOrbitCenter.copy(preset.center);
    }
  }

  setBalconyPreset(viewType = 'center') {
    if (viewType === 'box-left') {
      this.setCameraPreset('balcony_left');
    } else if (viewType === 'box-right') {
      this.setCameraPreset('balcony_right');
    } else {
      this.setCameraPreset('balcony');
    }
  }

  viewFromSeat(seatId) {
    const seat = this.seatData.get(seatId);
    if (!seat) return;

    this.isTouring = false;
    this.isAutoRotating360 = false;
    this.activePreset = 'seat-view';

    this.targetOrbitCenter.set(0, 7.5, -12);
    
    const dx = seat.position.x - 0;
    const dy = (seat.position.y + 0.85) - 7.5;
    const dz = (seat.position.z + 0.1) - (-12);
    
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    this.targetSpherical.radius = r;
    this.targetSpherical.theta = Math.atan2(dx, dz);
    this.targetSpherical.phi = Math.acos(dy / r);
  }

  startTour() {
    this.isTouring = true;
    this.isAutoRotating360 = false;
    this.activePreset = 'tour';
  }

  toggleHouseLights() {
    this.houseLightsOn = !this.houseLightsOn;
    const isOn = this.houseLightsOn;

    // 1. Point lights & downlights (brilliant focus when on!)
    const targetIntensity = isOn ? 6.5 : 0;
    if (this.houseLightGroup) {
      this.houseLightGroup.children.forEach(light => {
        light.intensity = targetIntensity;
      });
    }

    // 2. Ambient illumination boost (illuminates the entire cinema auditorium)
    if (this.ambientLight) {
      this.ambientLight.intensity = isOn ? 2.6 : 0.65;
    }

    // 3. Stage front spotlight focus beam
    if (this.stageSpot) {
      this.stageSpot.intensity = isOn ? 6.5 : 1.2;
    }

    // 4. Volumetric spotlight cones (bright focused downbeams when on!)
    if (this.lightCones && this.lightCones.length > 0) {
      this.lightCones.forEach(cone => {
        if (cone && cone.material) {
          cone.material.opacity = isOn ? (cone.userData.brightOpacity || 0.52) : (cone.userData.dimOpacity || 0.04);
          cone.material.needsUpdate = true;
        }
      });
    }

    // 5. Glowing lens fixtures (recessed pin-spots visually illuminate bright white)
    if (this.lightLenses && this.lightLenses.length > 0) {
      this.lightLenses.forEach(lens => {
        if (lens && lens.material) {
          lens.material.color.setHex(isOn ? 0xffffff : 0x555566);
        }
      });
    }

    // 6. Atmospheric clarity (crystal clear visibility when lights on)
    if (this.scene && this.scene.fog) {
      this.scene.fog.density = isOn ? 0.007 : 0.018;
    }

    return this.houseLightsOn;
  }

  toggleBalconyNeon() {
    this.balconyNeonOn = !this.balconyNeonOn;
    this.balconyLightGroup.children.forEach(light => {
      light.intensity = this.balconyNeonOn ? 1.8 : 0.2;
    });
    return this.balconyNeonOn;
  }

  findBestSeats(quantity = 2, preferredTier = 'prime') {
    const tiers = window.CINE_DATA.seatTiers;
    const targetTier = tiers.find(t => t.id === preferredTier) || tiers.find(t => t.isSweetSpot);
    if (!targetTier) return [];

    let bestWindow = null;
    let bestScore = Infinity;

    targetTier.rows.forEach(rowLetter => {
      const rowSeats = [];
      for (let s = 1; s <= 40; s++) {
        const seat = this.seatData.get(`${rowLetter}${s}`);
        if (seat) rowSeats.push(seat);
      }
      if (rowSeats.length === 0) return;

      const centerCol = rowSeats.length / 2;
      for (let i = 0; i <= rowSeats.length - quantity; i++) {
        const window = rowSeats.slice(i, i + quantity);
        if (window.some(s => !s || s.isBooked)) continue;

        const startNum = window[0].number;
        const endNum = window[window.length - 1].number;
        const midPoint = (startNum + endNum) / 2;
        const centerDistance = Math.abs(midPoint - centerCol);
        const rowBonus = (rowLetter === 'F' || rowLetter === 'E' || rowLetter === 'L') ? 0 : 2;

        const score = centerDistance * 1.2 + rowBonus;
        if (score < bestScore) {
          bestScore = score;
          bestWindow = window;
        }
      }
    });

    if (bestWindow) {
      this.clearSelection();
      bestWindow.forEach(seat => this.toggleSeat(seat.id));
      this.setCameraPreset(targetTier.isBalcony ? 'balcony' : 'overview');
      return bestWindow;
    }
    return [];
  }

  clearSelection() {
    this.selectedSeats.forEach(seatId => {
      const seat = this.seatData.get(seatId);
      const mesh = this.seatMeshes.get(seatId);
      if (seat && mesh) {
        seat.isSelected = false;
        this.updateSeatVisual(seat, mesh, 'normal');
      }
    });
    this.selectedSeats.clear();
    if (this.options.onSeatToggle) {
      this.options.onSeatToggle([]);
    }
  }

  bindEvents() {
    const dom = this.renderer.domElement;
    let isMouseDown = false;
    let prevMousePos = { x: 0, y: 0 };

    dom.addEventListener('pointerdown', (e) => {
      isMouseDown = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isMouseDown) {
        const dx = e.clientX - prevMousePos.x;
        const dy = e.clientY - prevMousePos.y;
        prevMousePos = { x: e.clientX, y: e.clientY };

        this.targetSpherical.theta -= dx * 0.008;
        this.targetSpherical.phi = THREE.MathUtils.clamp(
          this.targetSpherical.phi - dy * 0.006,
          0.16,
          1.52
        );

        this.isTouring = false;
        this.isAutoRotating360 = false;
      }

      this.handleHover();
    });

    window.addEventListener('pointerup', () => {
      isMouseDown = false;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.025;
      this.targetSpherical.radius = THREE.MathUtils.clamp(
        this.targetSpherical.radius + zoomDelta,
        8,
        48
      );
    }, { passive: false });

    dom.addEventListener('click', () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check if user clicked directly on the Cinema Screen
      if (this.screenMesh) {
        const screenHits = this.raycaster.intersectObject(this.screenMesh);
        if (screenHits.length > 0) {
          this.toggleTheaterTrailer();
          return;
        }
      }

      const intersects = this.raycaster.intersectObjects(this.seatGroup.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.seatId && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData.seatId) {
          this.toggleSeat(obj.userData.seatId);
        }
      }
    });

    window.addEventListener('resize', () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  handleHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.seatGroup.children, true);

    let newlyHovered = null;
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData.seatId && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData.seatId) {
        newlyHovered = this.seatData.get(obj.userData.seatId);
      }
    }

    if (newlyHovered !== this.hoveredSeat) {
      if (this.hoveredSeat && !this.hoveredSeat.isSelected) {
        const mesh = this.seatMeshes.get(this.hoveredSeat.id);
        this.updateSeatVisual(this.hoveredSeat, mesh, 'normal');
      }

      if (newlyHovered && !newlyHovered.isBooked && !newlyHovered.isSelected) {
        const mesh = this.seatMeshes.get(newlyHovered.id);
        this.updateSeatVisual(newlyHovered, mesh, 'hover');
      }

      this.hoveredSeat = newlyHovered;
      this.renderer.domElement.style.cursor = (newlyHovered && !newlyHovered.isBooked) ? 'pointer' : 'default';

      if (this.options.onSeatHover) {
        this.options.onSeatHover(newlyHovered);
      }
    }
  }

  // =========================================================================
  // THEATER SCREEN TRAILER VIDEO SYSTEM
  // =========================================================================
  initTrailerVideo() {
    if (this.trailerVideo) {
      try {
        this.trailerVideo.pause();
        this.trailerVideo.remove();
      } catch (e) {}
      this.trailerVideo = null;
    }

    this.trailerVideo = document.createElement('video');
    this.trailerVideo.id = 'cineora-screen-video';
    this.trailerVideo.playsInline = true;
    this.trailerVideo.setAttribute('playsinline', '');
    this.trailerVideo.setAttribute('webkit-playsinline', '');
    this.trailerVideo.loop = true;
    this.trailerVideo.muted = true;
    this.trailerVideo.setAttribute('muted', '');
    this.trailerVideo.preload = 'auto';
    this.trailerVideo.style.position = 'fixed';
    this.trailerVideo.style.top = '-9999px';
    this.trailerVideo.style.left = '-9999px';
    this.trailerVideo.style.width = '1px';
    this.trailerVideo.style.height = '1px';
    this.trailerVideo.style.opacity = '0.001';
    this.trailerVideo.style.pointerEvents = 'none';
    document.body.appendChild(this.trailerVideo);

    const movie = this.options.movie || (window.CINE_DATA ? window.CINE_DATA.movies[0] : null);
    const videoUrl = (movie && movie.trailerUrl) ? movie.trailerUrl : 'videos/trailer.mp4';
    
    this.trailerVideo.onerror = () => {
      console.warn('Trailer path error for:', this.trailerVideo.src);
      if (!this.trailerVideo.dataset.triedPublic && videoUrl.startsWith('videos/')) {
        this.trailerVideo.dataset.triedPublic = '1';
        this.trailerVideo.src = 'public/' + videoUrl;
        this.trailerVideo.load();
      } else if (!this.trailerVideo.dataset.triedGeneric) {
        this.trailerVideo.dataset.triedGeneric = '1';
        this.trailerVideo.src = 'videos/trailer.mp4';
        this.trailerVideo.load();
      }
    };

    this.trailerVideo.src = videoUrl;
    this.trailerVideo.load();

    this.trailerVideo.addEventListener('canplay', () => {
      if (!this.isTrailerPlaying && this.trailerVideo.currentTime === 0) {
        this.playTheaterTrailer();
      }
    }, { once: true });

    this.trailerVideo.addEventListener('play', () => {
      this.isTrailerPlaying = true;
      this.updateTrailerUI();
    });

    this.trailerVideo.addEventListener('pause', () => {
      this.isTrailerPlaying = false;
      this.updateTrailerUI();
    });

    this.trailerVideo.addEventListener('ended', () => {
      this.isTrailerPlaying = false;
      this.updateTrailerUI();
    });
  }

  playTheaterTrailer() {
    if (!this.trailerVideo) return;
    const movie = this.options.movie || (window.CINE_DATA ? window.CINE_DATA.movies[0] : null);
    const videoUrl = (movie && movie.trailerUrl) ? movie.trailerUrl : 'videos/trailer.mp4';
    if (!this.trailerVideo.src || (!this.trailerVideo.src.includes(videoUrl) && !this.trailerVideo.dataset.triedPublic)) {
      this.trailerVideo.src = videoUrl;
      this.trailerVideo.load();
    }

    this.trailerVideo.muted = this.isTrailerMuted;
    const playPromise = this.trailerVideo.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isTrailerPlaying = true;
        this.updateTrailerUI();
      }).catch(err => {
        console.warn('Playback with audio blocked by browser policy, fallback to muted:', err);
        this.trailerVideo.muted = true;
        this.isTrailerMuted = true;
        this.trailerVideo.play().then(() => {
          this.isTrailerPlaying = true;
          this.updateTrailerUI();
        }).catch(e => console.error('Trailer play error:', e));
      });
    }
  }

  pauseTheaterTrailer() {
    if (this.trailerVideo) {
      this.trailerVideo.pause();
      this.isTrailerPlaying = false;
      this.updateTrailerUI();
    }
  }

  stopTheaterTrailer() {
    if (this.trailerVideo) {
      this.trailerVideo.pause();
      this.trailerVideo.currentTime = 0;
      this.isTrailerPlaying = false;
      this.updateTrailerUI();
    }
  }

  toggleTheaterTrailer() {
    if (this.isTrailerPlaying) {
      this.pauseTheaterTrailer();
    } else {
      this.playTheaterTrailer();
    }
  }

  toggleTheaterAudio() {
    if (!this.trailerVideo) return;
    this.trailerVideo.muted = !this.trailerVideo.muted;
    this.isTrailerMuted = this.trailerVideo.muted;
    this.updateTrailerUI();
  }

  updateTrailerUI() {
    const playBtn = document.getElementById('screen-trailer-play-btn');
    const pauseBtn = document.getElementById('screen-trailer-pause-btn');
    const audioBtn = document.getElementById('screen-trailer-audio-btn');
    const statusBadge = document.getElementById('screen-trailer-status');
    const screenHint = document.getElementById('cinema-screen-click-hint');

    if (playBtn && pauseBtn) {
      if (this.isTrailerPlaying) {
        playBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
      } else {
        playBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
      }
    }

    if (audioBtn) {
      audioBtn.textContent = this.isTrailerMuted ? '🔇' : '🔊';
      audioBtn.title = this.isTrailerMuted ? 'Unmute Sound' : 'Mute Sound';
      audioBtn.classList.toggle('text-amber-400', !this.isTrailerMuted);
    }

    if (statusBadge) {
      if (this.isTrailerPlaying) {
        statusBadge.textContent = '● TRAILER PLAYING';
        statusBadge.className = 'text-[10px] font-black px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse';
      } else if (this.trailerVideo && this.trailerVideo.currentTime > 0) {
        statusBadge.textContent = '⏸ TRAILER PAUSED';
        statusBadge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30';
      } else {
        statusBadge.textContent = 'SCREEN STANDBY';
        statusBadge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700';
      }
    }

    if (screenHint) {
      screenHint.innerHTML = this.isTrailerPlaying
        ? `<span>⏸ Click Screen to Pause Trailer</span>`
        : `<span>🎬 Click Screen to Play Trailer</span>`;
    }
  }

  updateScreenAnimation() {
    if (!this.screenCtx) return;

    const ctx = this.screenCtx;
    const time = performance.now() * 0.0015;
    const movie = this.options.movie || (window.CINE_DATA ? window.CINE_DATA.movies[0] : null);
    const title = movie ? movie.title : 'CINEORA';

    // A. LIVE TRAILER VIDEO PLAYBACK ON THEATER SCREEN
    if (this.isTrailerPlaying && this.trailerVideo && (this.trailerVideo.readyState >= 1 || !this.trailerVideo.paused)) {
      // 1. Backing
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, 2048, 1024);

      // 2. Video frame rendered in 2.39:1 Cinemascope anamorphic ratio
      let drewVideo = false;
      try {
        if (this.trailerVideo.videoWidth > 0) {
          ctx.drawImage(this.trailerVideo, 0, 85, 2048, 854);
          drewVideo = true;
        }
      } catch (e) {
        // Fallback to videoTexture directly if available
      }

      // If video element is still loading initial frame, draw clean standby frame
      if (!drewVideo) {
        ctx.fillStyle = '#080c1a';
        ctx.fillRect(0, 85, 2048, 854);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 64px "Outfit", sans-serif';
        ctx.fillText(`⚡ ${title.toUpperCase()} — TRAILER`, 1024, 480);
        ctx.fillStyle = '#f59e0b';
        ctx.font = '700 24px "DM Sans", sans-serif';
        ctx.fillText('Loading 4K Laser Projection...', 1024, 545);
      }

      // 3. Header Masking with Metadata
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, 2048, 85);
      ctx.font = '800 24px "Outfit", sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'left';
      ctx.fillText(`⚡ CINEORA 4K LASER · ${title.toUpperCase()} — OFFICIAL TRAILER`, 60, 52);

      ctx.font = '700 20px "DM Sans", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'right';
      ctx.fillText('🔊 DOLBY ATMOS 128 CHANNELS · DCI-P3 4K HDR', 1988, 52);

      // 4. Footer Masking
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 939, 2048, 85);
      ctx.font = '600 18px "DM Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'left';
      ctx.fillText('📐 2.39:1 CINEMASCOPE · CURVED AUDITORIUM SCREEN', 60, 982);

      ctx.font = '700 18px "DM Sans", sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'right';
      ctx.fillText('● PLAYING LIVE · CLICK SCREEN TO PAUSE', 1988, 982);

      this.screenTexture.needsUpdate = true;

      // Dynamic Projector Spill from video
      if (this.screenSpillLight) {
        this.screenSpillLight.color.setRGB(0.96, 0.94, 0.90);
        this.screenSpillLight.intensity = 3.6 + Math.sin(time * 3.5) * 0.7;
      }
      if (this.screenLight) {
        this.screenLight.color.setRGB(0.85, 0.92, 1.0);
        this.screenLight.intensity = 5.0 + Math.sin(time * 2.8) * 0.6;
      }
      return;
    }

    // B. PAUSED TRAILER STATE
    if (this.trailerVideo && !this.isTrailerPlaying && this.trailerVideo.currentTime > 0) {
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, 2048, 1024);
      try {
        if (this.trailerVideo.videoWidth > 0) {
          ctx.drawImage(this.trailerVideo, 0, 85, 2048, 854);
        }
      } catch (e) {}

      // Translucent pause overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 85, 2048, 854);

      // Pause glyph and hint
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '900 64px "Outfit", sans-serif';
      ctx.fillText('⏸ TRAILER PAUSED', 1024, 490);
      ctx.font = '700 24px "DM Sans", sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('Click screen or tap Play Trailer to resume', 1024, 550);

      this.screenTexture.needsUpdate = true;
      return;
    }

    // C. STANDBY CINEMA SCREEN ANIMATION (High-End Dark Cinematic Dolby/IMAX Screen - NEVER YELLOW)
    // Deep obsidian luxury atmospheric background
    const grad = ctx.createRadialGradient(1024, 512, 120, 1024, 512, 1100);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.55, '#070914');
    grad.addColorStop(1, '#020308');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Micro-Perforation Grid (Simulating high-gain cinema projection screen material)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let py = 100; py < 924; py += 22) {
      for (let px = 60; px < 1988; px += 28) {
        ctx.fillRect(px, py, 1.5, 1.5);
      }
    }

    // Top & Bottom 2.39:1 Cinemascope Velvet Letterbox Bands
    ctx.fillStyle = '#010103';
    ctx.fillRect(0, 0, 2048, 90);
    ctx.fillRect(0, 934, 2048, 90);

    // Glowing Play Button in Center
    ctx.beginPath();
    ctx.arc(1024, 430, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Play Arrow
    ctx.beginPath();
    ctx.moveTo(1015, 412);
    ctx.lineTo(1043, 430);
    ctx.lineTo(1015, 448);
    ctx.closePath();
    ctx.fillStyle = '#020617';
    ctx.fill();

    // Film Title & Cinematic Typography
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 32;
    ctx.fillText(`${title.toUpperCase()}`, 1024, 545);
    ctx.shadowBlur = 0;

    // Subtitle / Tagline
    ctx.font = '700 24px "DM Sans", sans-serif';
    ctx.fillStyle = '#f59e0b';
    const tagline = movie ? movie.tagline : 'The Next Generation Cinematic Experience';
    ctx.fillText(tagline, 1024, 600);

    // Action Hint
    ctx.font = '800 20px "DM Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('⚡ TAP SCREEN OR CLICK "PLAY" TO WATCH OFFICIAL TRAILER', 1024, 645);

    // Metadata: Cert, Runtime, Genre
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    const metaStr = movie ? `${movie.cert} · ${movie.genre} · ${movie.runtime} · ${movie.primaryLang}` : '4K LASER · DOLBY ATMOS';
    ctx.fillText(metaStr, 1024, 580);

    // 6. Professional Audio & Visual Cinema Badges in 4 Corners
    // Top-Left: CINEORA 4K LASER
    ctx.textAlign = 'left';
    ctx.font = '800 21px "Inter", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('⚡ CINEORA 4K LASER HDR', 90, 58);

    // Top-Right: DOLBY ATMOS
    ctx.textAlign = 'right';
    ctx.font = '800 21px "Inter", sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('🔊 DOLBY ATMOS · 128 CHANNELS', 1958, 58);

    // Bottom-Left: 2.39:1 SCOPE
    ctx.textAlign = 'left';
    ctx.font = '700 19px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('📐 2.39:1 CINEMASCOPE · CURVED DCI P3', 90, 980);

    // Bottom-Right: REAL-D 3D CERTIFIED
    ctx.textAlign = 'right';
    ctx.font = '700 19px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('✨ REAL-D 3D HIGH-FRAME-RATE (HFR)', 1958, 980);

    this.screenTexture.needsUpdate = true;

    // 7. Modulate Directional Light Spill onto Auditorium
    if (this.screenSpillLight) {
      this.screenSpillLight.color.setRGB(r / 255, g / 255, b / 255);
      this.screenSpillLight.intensity = 2.2 + Math.sin(time * 2.5) * 0.45;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.updateScreenAnimation();

    if (this.isAutoRotating360) {
      this.targetSpherical.theta += 0.005;
    }

    if (this.isTouring) {
      this.targetSpherical.theta += 0.007;
      this.targetSpherical.phi = 1.05 + Math.sin(this.spherical.theta * 2) * 0.18;
      this.targetSpherical.radius = 26 + Math.cos(this.spherical.theta) * 4;
    }

    this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * 0.08;
    this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * 0.08;
    this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * 0.08;
    this.orbitCenter.lerp(this.targetOrbitCenter, 0.08);

    this.updateCameraFromSpherical(false);

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.stopTheaterTrailer();
    if (this.trailerVideo) {
      this.trailerVideo.pause();
      this.trailerVideo.src = '';
      this.trailerVideo.remove();
      this.trailerVideo = null;
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.remove();
    }
  }
}

window.CinemaHall3D = CinemaHall3D;
