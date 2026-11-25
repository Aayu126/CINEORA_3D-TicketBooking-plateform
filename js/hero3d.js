/**
 * CINEORA - 3D Curved Panorama Hero
 * Implements an interactive curved carousel of cinema screens in Three.js
 * Features drag inertia, snap physics, reflective floor, celestial stars, and spotlighting.
 */

class HeroPanorama3D {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      radius: 9.5,
      screenCount: 8,
      aspectRatio: 1.5,
      autoRotateDelay: 5200,
      onSelectMovie: null,
      onActiveChange: null
    }, options);

    this.movies = window.CINE_DATA ? window.CINE_DATA.movies : [];
    this.currentAngle = 0;
    this.targetAngle = 0;
    this.angularVelocity = 0;
    this.isDragging = false;
    this.previousMouseX = 0;
    this.lastDragTime = 0;
    this.dragDeltaX = 0;
    this.activeIndex = 0;
    this.autoRotateTimer = null;
    this.screenMeshes = [];
    window.heroInstance = this;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredIndex = -1;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    // Ethereal Alabaster Silk Fog
    this.scene.fog = new THREE.FogExp2(0xf1f4f9, 0.024);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.6, 14.5);
    this.camera.lookAt(0, -0.2, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 2. Luminous Luxury Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambientLight);

    // Warm Sunbeam Spotlight from Top
    this.spotLight = new THREE.SpotLight(0xfff8ee, 4.2, 38, Math.PI / 4, 0.45, 1);
    this.spotLight.position.set(0, 14, 6);
    this.spotLight.target.position.set(0, 0, 0);
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);

    // Warm Neutral Front Fill Light (Pure natural light, never tints posters)
    this.centerGlow = new THREE.PointLight(0xfff8ee, 0.45, 22);
    this.centerGlow.position.set(0, 0.2, 7.5);
    this.scene.add(this.centerGlow);

    // 3. Environment: Floating Sunbeam Bokeh Motes and Carrara Marble Floor
    this.createStarField();
    this.createReflectiveFloor();

    // 4. Create Cinema Screens in a Circle
    this.createScreens();

    // 5. Event Listeners
    this.bindEvents();

    // 6. Start Loop
    this.startAutoRotate();
    this.animate();

    if (this.options.onActiveChange && this.movies.length > 0) {
      this.options.onActiveChange(this.movies[0], 0, this.movies.length);
    }
  }

  createStarField() {
    // Floating Luminous Sunbeam Bokeh Particles (Golden dust motes)
    const starCount = 380;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 65;
      positions[i * 3 + 1] = Math.random() * 26 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 55 - 5;

      // Champagne & Golden Mote Palette
      const p = Math.random();
      if (p > 0.6) {
        colors[i * 3] = 0.85;     // Warm Gold
        colors[i * 3 + 1] = 0.55;
        colors[i * 3 + 2] = 0.10;
      } else if (p > 0.3) {
        colors[i * 3] = 0.95;     // Champagne Pearl
        colors[i * 3 + 1] = 0.82;
        colors[i * 3 + 2] = 0.55;
      } else {
        colors[i * 3] = 0.90;     // Soft Amber Rose
        colors[i * 3 + 1] = 0.40;
        colors[i * 3 + 2] = 0.20;
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.70
    });

    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }

  createReflectiveFloor() {
    // High-Gloss Italian White Carrara Marble Floor with Soft Reflections
    const floorGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.08,
      metalness: 0.15
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.8;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Delicate Architectural Floor Grid
    const gridHelper = new THREE.GridHelper(45, 45, 0xd4d4d8, 0xe2e8f0);
    gridHelper.position.y = -2.78;
    gridHelper.material.opacity = 0.45;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  createPosterTexture(movie) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 768);
    grad.addColorStop(0, '#0b0e17');
    grad.addColorStop(0.5, '#131826');
    grad.addColorStop(1, '#05070d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    ctx.font = '900 160px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.textAlign = 'center';
    ctx.fillText(movie.title.charAt(0), 256, 360);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(30, 30, 80, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "DM Sans", sans-serif';
    ctx.fillText(movie.cert, 70, 55);

    ctx.fillStyle = '#141424';
    ctx.fillRect(350, 30, 130, 36);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 18px "DM Sans", sans-serif';
    ctx.fillText(`★ ${movie.rating}`, 415, 55);

    const darkFade = ctx.createLinearGradient(0, 420, 0, 768);
    darkFade.addColorStop(0, 'rgba(5, 7, 13, 0)');
    darkFade.addColorStop(0.7, 'rgba(5, 7, 13, 0.92)');
    darkFade.addColorStop(1, 'rgba(5, 7, 13, 1)');
    ctx.fillStyle = darkFade;
    ctx.fillRect(0, 420, 512, 348);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(movie.title, 36, 640);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 20px "DM Sans", sans-serif';
    ctx.fillText(movie.genre, 36, 680);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 18px "DM Sans", sans-serif';
    ctx.fillText(movie.languages.slice(0, 3).join(' · '), 36, 715);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  createScreens() {
    this.screenGroup = new THREE.Group();
    this.scene.add(this.screenGroup);

    const count = this.movies.length;
    const screenWidth = 3.6;
    const screenHeight = screenWidth * 1.5;

    const geometry = new THREE.PlaneGeometry(screenWidth, screenHeight, 16, 1);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -Math.pow(x / screenWidth, 2) * 0.4);
    }
    geometry.computeVertexNormals();

    const loader = new THREE.TextureLoader();

    for (let i = 0; i < count; i++) {
      const movie = this.movies[i];
      const texture = this.createPosterTexture(movie);

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.05,
        side: THREE.DoubleSide
      });

      if (movie.poster) {
        loader.load(movie.poster, (realTex) => {
          realTex.generateMipmaps = true;
          realTex.minFilter = THREE.LinearMipmapLinearFilter;
          material.map = realTex;
          material.color.set(0xffffff);
          material.needsUpdate = true;
        }, undefined, () => {
          loader.load('public/' + movie.poster, (realTex) => {
            realTex.generateMipmaps = true;
            realTex.minFilter = THREE.LinearMipmapLinearFilter;
            material.map = realTex;
            material.color.set(0xffffff);
            material.needsUpdate = true;
          });
        });
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.userData = { index: i, movie: movie };

      this.screenMeshes.push(mesh);
      this.screenGroup.add(mesh);
    }

    this.updateScreenPositions();
  }

  updateScreenPositions() {
    const count = this.screenMeshes.length;
    const angleStep = 0.38; // ~21.8 degrees per screen on the panoramic arc
    const radius = 11.5;

    for (let i = 0; i < count; i++) {
      const mesh = this.screenMeshes[i];
      let rel = i - this.activeIndex;
      while (rel > count / 2) rel -= count;
      while (rel < -count / 2) rel += count;

      const theta = rel * angleStep;
      const targetX = Math.sin(theta) * radius;
      const targetZ = Math.cos(theta) * radius - radius; // z <= 0 curves away from the camera!
      const targetRotY = theta * 0.92;

      mesh.position.set(targetX, rel === 0 ? 0.35 : 0, targetZ);
      mesh.rotation.y = targetRotY;

      // Show the closest 7 screens in the panoramic curve
      const isVisible = Math.abs(rel) <= 3.5;
      mesh.visible = isVisible;

      const baseScale = rel === 0 ? 1.18 : Math.max(0.72, 1.0 - Math.abs(rel) * 0.12);
      mesh.scale.set(baseScale, baseScale, baseScale);

      const brightness = rel === 0 ? 1.0 : Math.max(0.7, 0.95 - Math.abs(rel) * 0.08);
      mesh.material.color.setRGB(brightness, brightness, brightness);
    }
  }

  bindEvents() {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.previousMouseX = e.clientX;
      this.dragDeltaX = 0;
      this.lastDragTime = performance.now();
      this.pauseAutoRotate();
    });

    window.addEventListener('pointermove', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMouseX;
      this.dragDeltaX = deltaX;
      this.previousMouseX = e.clientX;

      this.currentAngle += deltaX * 0.0035;
      this.targetAngle = this.currentAngle;
    });

    window.addEventListener('pointerup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.snapToNearest();
      this.startAutoRotate();
    });

    dom.addEventListener('click', (e) => {
      if (Math.abs(this.dragDeltaX) > 4) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.screenMeshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const index = clickedMesh.userData.index;

        if (index === this.activeIndex) {
          if (this.options.onSelectMovie) {
            this.options.onSelectMovie(clickedMesh.userData.movie);
          }
        } else {
          this.rotateToIndex(index);
        }
      }
    });

    window.addEventListener('resize', () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  snapToNearest() {
    const count = this.screenMeshes.length;
    const angleStep = (Math.PI * 2) / count;
    let closestIndex = Math.round(-this.currentAngle / angleStep) % count;
    if (closestIndex < 0) closestIndex += count;
    this.rotateToIndex(closestIndex);
  }

  rotateToIndex(index) {
    const count = this.screenMeshes.length;
    const angleStep = (Math.PI * 2) / count;
    const target = -index * angleStep;
    const current = this.currentAngle;
    const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
    this.targetAngle = current + diff;
    this.activeIndex = index;

    if (this.options.onActiveChange && this.movies[index]) {
      this.options.onActiveChange(this.movies[index], index, count);
    }
  }

  selectMovieById(movieId) {
    if (!this.movies || this.movies.length === 0) return false;
    const idx = this.movies.findIndex(m => m.id === movieId);
    if (idx !== -1) {
      this.rotateToIndex(idx);
      return true;
    }
    return false;
  }

  next() {
    const nextIdx = (this.activeIndex + 1) % this.screenMeshes.length;
    this.rotateToIndex(nextIdx);
  }

  prev() {
    const prevIdx = (this.activeIndex - 1 + this.screenMeshes.length) % this.screenMeshes.length;
    this.rotateToIndex(prevIdx);
  }

  startAutoRotate() {
    this.pauseAutoRotate();
    this.autoRotateTimer = setInterval(() => {
      this.next();
    }, this.options.autoRotateDelay);
  }

  pauseAutoRotate() {
    if (this.autoRotateTimer) {
      clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isDragging) {
      this.currentAngle += (this.targetAngle - this.currentAngle) * 0.085;
    }

    this.updateScreenPositions();

    if (this.stars) {
      this.stars.rotation.y += 0.0003;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.HeroPanorama3D = HeroPanorama3D;
