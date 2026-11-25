'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useCinemaStore, CameraPreset } from '@/store/useCinemaStore';
import { SEAT_TIERS } from '@/data/cineData';
import { SeatInfo } from '@/types';
import gsap from 'gsap';
import {
  X, Play, Pause, Volume2, VolumeX, Lightbulb,
  ChevronRight, Eye
} from 'lucide-react';

export default function CinemaHall3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Zustand Store
  const selectedMovie = useCinemaStore((state) => state.selectedMovie);
  const selectedTheatre = useCinemaStore((state) => state.selectedTheatre);
  const selectedShowtime = useCinemaStore((state) => state.selectedShowtime);
  const activeStructure = useCinemaStore((state) => state.activeStructure);
  const selectedSeats = useCinemaStore((state) => state.selectedSeats);
  const toggleSeat = useCinemaStore((state) => state.toggleSeat);
  const clearSeats = useCinemaStore((state) => state.clearSeats);
  const quickPickSeats = useCinemaStore((state) => state.quickPickSeats);
  const hoveredSeat = useCinemaStore((state) => state.hoveredSeat);
  const setHoveredSeat = useCinemaStore((state) => state.setHoveredSeat);
  const cameraPreset = useCinemaStore((state) => state.cameraPreset);
  const setCameraPreset = useCinemaStore((state) => state.setCameraPreset);
  const activeSeatView = useCinemaStore((state) => state.activeSeatView);
  const viewFromSeat = useCinemaStore((state) => state.viewFromSeat);
  const isTrailerPlaying = useCinemaStore((state) => state.isTrailerPlaying);
  const isTrailerStopped = useCinemaStore((state) => state.isTrailerStopped);
  const toggleTrailer = useCinemaStore((state) => state.toggleTrailer);
  const playTrailer = useCinemaStore((state) => state.playTrailer);
  const pauseTrailer = useCinemaStore((state) => state.pauseTrailer);
  const stopTrailer = useCinemaStore((state) => state.stopTrailer);
  const isTrailerMuted = useCinemaStore((state) => state.isTrailerMuted);
  const toggleMute = useCinemaStore((state) => state.toggleMute);
  const houseLights = useCinemaStore((state) => state.houseLights);
  const toggleHouseLights = useCinemaStore((state) => state.toggleHouseLights);
  const hdMode = useCinemaStore((state) => state.hdMode);
  const toggleHdMode = useCinemaStore((state) => state.toggleHdMode);
  const closeModal = useCinemaStore((state) => state.closeModal);
  const openSnacks = useCinemaStore((state) => state.openSnacks);

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    screenTexture: THREE.CanvasTexture;
    screenCanvas: HTMLCanvasElement;
    screenCtx: CanvasRenderingContext2D;
    screenMesh: THREE.Mesh;
    screenLight: THREE.SpotLight;
    screenSpillLight: THREE.PointLight;
    ambientLight: THREE.AmbientLight;
    houseLightsList: THREE.Light[];
    lightCones: THREE.Mesh[];
    lightLenses: THREE.Mesh[];
    seatMeshes: Map<string, THREE.Object3D>;
    seatData: Map<string, SeatInfo>;
    isOrbiting: boolean;
    animFrameId: number;
  } | null>(null);

  // Initialize and run Three.js Interactive Cinema Hall with Grand Wood Architecture
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030307);
    scene.fog = new THREE.FogExp2(0x030307, 0.016);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 180);
    camera.position.set(0, 15.5, 33.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2.5;
    controls.maxDistance = 55;
    controls.target.set(0, 5.2, 8.5);

    // 4. Procedural Textures Generation (Fluted Oak Wood & Carpet)
    // Vertical Acoustic Timber Slat Texture
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 1024;
    woodCanvas.height = 1024;
    const wCtx = woodCanvas.getContext('2d')!;
    const wGrad = wCtx.createLinearGradient(0, 0, 1024, 0);
    wGrad.addColorStop(0, '#b8824a');
    wGrad.addColorStop(0.3, '#9d6836');
    wGrad.addColorStop(0.7, '#c6915b');
    wGrad.addColorStop(1, '#8e5b2b');
    wCtx.fillStyle = wGrad;
    wCtx.fillRect(0, 0, 1024, 1024);

    const slatWidth = 32;
    for (let x = 0; x < 1024; x += slatWidth) {
      wCtx.fillStyle = 'rgba(38, 22, 10, 0.88)';
      wCtx.fillRect(x, 0, 4, 1024);
      wCtx.fillStyle = 'rgba(255, 230, 190, 0.28)';
      wCtx.fillRect(x + 4, 0, 2, 1024);
      for (let i = 0; i < 4; i++) {
        const lineX = x + 8 + Math.random() * (slatWidth - 12);
        wCtx.fillStyle = 'rgba(70, 40, 18, 0.16)';
        wCtx.fillRect(lineX, 0, 1 + Math.random() * 2, 1024);
      }
    }
    const oakWoodTexture = new THREE.CanvasTexture(woodCanvas);
    oakWoodTexture.wrapS = THREE.RepeatWrapping;
    oakWoodTexture.wrapT = THREE.RepeatWrapping;

    // Carpet Texture
    const carpetCanvas = document.createElement('canvas');
    carpetCanvas.width = 256;
    carpetCanvas.height = 256;
    const cCtx = carpetCanvas.getContext('2d')!;
    cCtx.fillStyle = '#0f111e';
    cCtx.fillRect(0, 0, 256, 256);
    cCtx.fillStyle = '#171a2c';
    for (let py = 0; py < 256; py += 16) {
      for (let px = 0; px < 256; px += 16) {
        if ((px + py) % 32 === 0) cCtx.fillRect(px, py, 16, 16);
      }
    }
    const carpetTexture = new THREE.CanvasTexture(carpetCanvas);
    carpetTexture.wrapS = THREE.RepeatWrapping;
    carpetTexture.wrapT = THREE.RepeatWrapping;

    // 5. Screen Canvas & Dynamic Texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = isMobile ? 1024 : 2048;
    screenCanvas.height = isMobile ? 512 : 1024;
    const screenCtx = screenCanvas.getContext('2d')!;
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.generateMipmaps = true;
    screenTexture.minFilter = THREE.LinearMipmapLinearFilter;

    // Curved Cinemascope Screen Mesh (2.39:1)
    const screenGeo = new THREE.CylinderGeometry(42, 42, 12.8, 48, 1, true, Math.PI - 0.28, 0.56);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 7.8, -11.8);
    screenMesh.userData = { isScreen: true };
    scene.add(screenMesh);

    // Screen Outer Frame
    const frameGeo = new THREE.CylinderGeometry(42.1, 42.1, 13.2, 48, 1, true, Math.PI - 0.285, 0.57);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x05050a, roughness: 0.9, metalness: 0.1 });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 7.8, -11.75);
    scene.add(frameMesh);

    // Stage Spotlights
    const screenLight = new THREE.SpotLight(0xfff8ee, 4.2, 48, Math.PI / 3.2, 0.35, 1.2);
    screenLight.position.set(0, 9.5, -9.5);
    screenLight.target.position.set(0, 4.0, 12.0);
    scene.add(screenLight);
    scene.add(screenLight.target);

    const screenSpillLight = new THREE.PointLight(0xffecd1, 3.0, 36, 1.2);
    screenSpillLight.position.set(0, 8.2, -6.5);
    scene.add(screenSpillLight);

    const ambientLight = new THREE.AmbientLight(0x0e1124, 0.95);
    scene.add(ambientLight);

    const houseLightsList: THREE.Light[] = [];
    const lightCones: THREE.Mesh[] = [];
    const lightLenses: THREE.Mesh[] = [];

    // =========================================================================
    // 6. BUILD GRAND ROYAL WOOD AUDITORIUM ARCHITECTURE (Fab 3D Reference)
    // =========================================================================
    const hallGroup = new THREE.Group();

    // A. Acoustic Side Walls with Fluted Oak Panels
    const wallGeo = new THREE.PlaneGeometry(52, 24);
    const woodMat = new THREE.MeshStandardMaterial({
      map: oakWoodTexture,
      roughness: 0.45,
      metalness: 0.08,
    });
    woodMat.map!.repeat.set(6, 3);

    const leftWall = new THREE.Mesh(wallGeo, woodMat);
    leftWall.position.set(-20.5, 11, 8.5);
    leftWall.rotation.y = Math.PI / 2 - 0.03;
    leftWall.receiveShadow = true;
    hallGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, woodMat);
    rightWall.position.set(20.5, 11, 8.5);
    rightWall.rotation.y = -Math.PI / 2 + 0.03;
    rightWall.receiveShadow = true;
    hallGroup.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(42, 24), woodMat);
    backWall.position.set(0, 11, 32.5);
    backWall.rotation.y = Math.PI;
    hallGroup.add(backWall);

    // B. Suspended Acoustic Ceiling & Cove Light
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x101018, roughness: 0.92 });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(42, 52), ceilingMat);
    ceiling.position.set(0, 22.8, 8.5);
    ceiling.rotation.x = Math.PI / 2;
    hallGroup.add(ceiling);

    const coveGeo = new THREE.BoxGeometry(34, 0.15, 0.45);
    const coveMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const cove = new THREE.Mesh(coveGeo, coveMat);
    cove.position.set(0, 22.6, 9.5);
    hallGroup.add(cove);

    // C. Hardwood Stage Floor in Front of Screen
    const stageGeo = new THREE.BoxGeometry(34, 1.4, 9.5);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x22140c,
      roughness: 0.5,
      metalness: 0.1,
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.set(0, 0.7, -9.5);
    hallGroup.add(stage);

    const stageNeon = new THREE.Mesh(
      new THREE.BoxGeometry(34.2, 0.08, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    stageNeon.position.set(0, 1.44, -4.75);
    hallGroup.add(stageNeon);

    // D. Red Proscenium Curtains Framing Screen & Stage
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0x6b101b,
      roughness: 0.75,
      metalness: 0.1,
    });
    const leftCurtain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 13.0, 1.2), curtainMat);
    leftCurtain.position.set(-14.2, 7.8, -12.5);
    hallGroup.add(leftCurtain);

    const rightCurtain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 13.0, 1.2), curtainMat);
    rightCurtain.position.set(14.2, 7.8, -12.5);
    hallGroup.add(rightCurtain);

    const topPelmet = new THREE.Mesh(new THREE.BoxGeometry(30.0, 1.4, 1.4), curtainMat);
    topPelmet.position.set(0, 14.2, -12.5);
    hallGroup.add(topPelmet);

    // E. Concrete Stepped Stadium Risers for Stalls (Rows A to J)
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x161622, roughness: 0.85 });
    const carpetMat = new THREE.MeshStandardMaterial({ map: carpetTexture, roughness: 0.85 });
    carpetMat.map!.repeat.set(12, 14);

    const stallsTiers = [
      { z: -5.5, y: 0.25, h: 0.35, d: 2.1 },
      { z: -3.5, y: 0.65, h: 0.45, d: 2.1 },
      { z: -1.5, y: 1.10, h: 0.50, d: 2.1 },
      { z: 0.7, y: 1.60, h: 0.55, d: 2.1 },
      { z: 2.9, y: 2.10, h: 0.55, d: 2.1 },
      { z: 5.1, y: 2.65, h: 0.60, d: 2.1 },
      { z: 7.3, y: 3.20, h: 0.60, d: 2.1 },
      { z: 9.5, y: 3.80, h: 0.65, d: 2.1 },
      { z: 12.0, y: 4.45, h: 0.70, d: 2.4 },
      { z: 14.5, y: 5.10, h: 0.75, d: 2.5 }
    ];

    stallsTiers.forEach((tier) => {
      const riser = new THREE.Mesh(new THREE.BoxGeometry(32, tier.h, tier.d), concreteMat);
      riser.position.set(0, tier.y, tier.z);
      riser.receiveShadow = true;
      hallGroup.add(riser);

      const pad = new THREE.Mesh(new THREE.PlaneGeometry(31.8, tier.d - 0.1), carpetMat);
      pad.position.set(0, tier.y + tier.h / 2 + 0.01, tier.z);
      pad.rotation.x = -Math.PI / 2;
      pad.receiveShadow = true;
      hallGroup.add(pad);
    });

    // Stalls Aisle LED Runners
    [-5.0, 5.0].forEach((aisleX) => {
      stallsTiers.forEach((t) => {
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.03, 0.1),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 })
        );
        strip.position.set(aisleX, t.y + t.h / 2 + 0.02, t.z - t.d / 2 + 0.1);
        hallGroup.add(strip);
      });
    });

    // F. Elevated Cantilevered Balcony Mezzanine Structure
    const balconyDeckZ = 24.5;
    const balconyDeckY = 7.1;
    const balconyDepth = 14.8;

    const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(39, 0.9, balconyDepth), concreteMat);
    balconySlab.position.set(0, balconyDeckY, balconyDeckZ);
    balconySlab.receiveShadow = true;
    hallGroup.add(balconySlab);

    // 5 Stepped Risers on Balcony (Rows K to P)
    const balconyTiers = [
      { z: 18.5, y: 7.20, h: 0.40, d: 2.2 },
      { z: 20.8, y: 7.85, h: 0.50, d: 2.2 },
      { z: 23.1, y: 8.50, h: 0.55, d: 2.2 },
      { z: 25.4, y: 9.15, h: 0.60, d: 2.2 },
      { z: 28.2, y: 9.90, h: 0.65, d: 2.8 }
    ];

    balconyTiers.forEach((tier) => {
      const bRiser = new THREE.Mesh(new THREE.BoxGeometry(37, tier.h, tier.d), concreteMat);
      bRiser.position.set(0, tier.y, tier.z);
      bRiser.receiveShadow = true;
      hallGroup.add(bRiser);

      const bPad = new THREE.Mesh(new THREE.PlaneGeometry(36.8, tier.d - 0.1), carpetMat);
      bPad.position.set(0, tier.y + tier.h / 2 + 0.01, tier.z);
      bPad.rotation.x = -Math.PI / 2;
      hallGroup.add(bPad);

      [-6.5, 6.5].forEach((bX) => {
        const bStrip = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 0.03, 0.1),
          new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.9 })
        );
        bStrip.position.set(bX, tier.y + tier.h / 2 + 0.02, tier.z - tier.d / 2 + 0.1);
        hallGroup.add(bStrip);
      });
    });

    // 3-part Angled Balcony Wood Fascia
    const centerFascia = new THREE.Mesh(new THREE.BoxGeometry(22, 1.7, 0.45), woodMat);
    centerFascia.position.set(0, balconyDeckY + 0.85, 17.3);
    hallGroup.add(centerFascia);

    const leftFascia = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.7, 0.45), woodMat);
    leftFascia.position.set(-14.2, balconyDeckY + 0.85, 18.5);
    leftFascia.rotation.y = -0.26;
    hallGroup.add(leftFascia);

    const rightFascia = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.7, 0.45), woodMat);
    rightFascia.position.set(14.2, balconyDeckY + 0.85, 18.5);
    rightFascia.rotation.y = 0.26;
    hallGroup.add(rightFascia);

    // Continuous Illuminated White/Brass Safety Railing along Balcony Top
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffedd5,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    });

    const centerRail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 22, 12), railMat);
    centerRail.rotation.z = Math.PI / 2;
    centerRail.position.set(0, balconyDeckY + 1.75, 17.3);
    hallGroup.add(centerRail);

    const leftRail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 9.5, 12), railMat);
    leftRail.rotation.z = Math.PI / 2;
    leftRail.position.set(-14.2, balconyDeckY + 1.75, 18.5);
    leftRail.rotation.y = -0.26;
    hallGroup.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 9.5, 12), railMat);
    rightRail.rotation.z = Math.PI / 2;
    rightRail.position.set(14.2, balconyDeckY + 1.75, 18.5);
    rightRail.rotation.y = 0.26;
    hallGroup.add(rightRail);

    // G. 14 Wall-Mounted Dolby Atmos Surround Speakers
    const speakerZ = [-4, 2, 8, 14, 20, 26, 30];
    const speakerGeo = new THREE.BoxGeometry(0.35, 0.75, 0.5);
    const speakerMat = new THREE.MeshStandardMaterial({ color: 0x0d0d14, roughness: 0.65, metalness: 0.3 });
    const grillGeo = new THREE.PlaneGeometry(0.48, 0.72);
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x161622, roughness: 0.9 });

    speakerZ.forEach((z) => {
      [-20.2, 20.2].forEach((x) => {
        const spk = new THREE.Mesh(speakerGeo, speakerMat);
        spk.position.set(x, 11.5, z);
        spk.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
        hallGroup.add(spk);

        const grill = new THREE.Mesh(grillGeo, grillMat);
        grill.position.set(x < 0 ? x + 0.18 : x - 0.18, 11.5, z);
        grill.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
        hallGroup.add(grill);
      });
    });

    // H. 4 Emergency Exit Doors with Illuminated Green Signs
    const createDoor = (x: number, y: number, z: number) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.20, 2.5, 1.55), woodMat);
      frame.position.set(x, y, z);
      hallGroup.add(frame);

      const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0x1a161e, roughness: 0.6, metalness: 0.2 });
      const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.38, 0.72), doorLeafMat);
      doorL.position.set(x > 0 ? x - 0.05 : x + 0.05, y, z - 0.38);
      hallGroup.add(doorL);

      const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.38, 0.72), doorLeafMat);
      doorR.position.set(x > 0 ? x - 0.05 : x + 0.05, y, z + 0.38);
      hallGroup.add(doorR);

      // Chrome Panic Push Bars
      const barMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.2 });
      [-0.38, 0.38].forEach((barZ) => {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.58, 8), barMat);
        bar.rotation.x = Math.PI / 2;
        bar.position.set(x > 0 ? x - 0.12 : x + 0.12, y, z + barZ);
        hallGroup.add(bar);
      });

      // Illuminated Green EXIT Box
      const signBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.32, 0.82),
        new THREE.MeshStandardMaterial({ color: 0x052e16, roughness: 0.3 })
      );
      signBox.position.set(x, y + 1.48, z);
      hallGroup.add(signBox);

      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(0.78, 0.28),
        new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.95 })
      );
      face.position.set(x > 0 ? x - 0.10 : x + 0.10, y + 1.48, z);
      face.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
      hallGroup.add(face);

      const exitGlow = new THREE.PointLight(0x10b981, 0.8, 6.0);
      exitGlow.position.set(x > 0 ? x - 0.35 : x + 0.35, y + 1.48, z);
      hallGroup.add(exitGlow);
    };

    createDoor(-20.2, 1.2, -3.0); // Front-left
    createDoor(20.2, 1.2, -3.0);  // Front-right
    createDoor(-20.2, 5.6, 15.5); // Rear-left
    createDoor(20.2, 5.6, 15.5);  // Rear-right

    // I. Overhead HVAC Air Return Grills
    [-15.0, 15.0].forEach((ventX) => {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 0.8, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x08080f, roughness: 0.85 })
      );
      vent.position.set(ventX, 18.5, -6.5);
      hallGroup.add(vent);
    });

    // J. Projection Booth Windows
    const boothMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      transmission: 0.8,
    });
    [-3.5, 3.5].forEach((winX) => {
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 0.2), concreteMat);
      winFrame.position.set(winX, 14.8, 32.3);
      hallGroup.add(winFrame);

      const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.2), boothMat);
      glass.position.set(winX, 14.8, 32.18);
      glass.rotation.y = Math.PI;
      hallGroup.add(glass);

      const pLight = new THREE.PointLight(0x06b6d4, 0.8, 10);
      pLight.position.set(winX, 14.8, 31.8);
      hallGroup.add(pLight);
    });

    // K. 28 Recessed Ceiling Pin-Spots with Volumetric Downlight Cones
    const cols = [-12, -4, 4, 12];
    const rows = [-4, 2, 8, 14, 20, 25, 29];
    const fixtureGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16);
    const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x14141e, metalness: 0.8, roughness: 0.3 });
    const lensGeo = new THREE.CircleGeometry(0.22, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfff8ed });

    const downConeGeo = new THREE.ConeGeometry(1.4, 7.5, 16, 1, true);
    downConeGeo.rotateX(Math.PI);
    const downConeMat = new THREE.MeshBasicMaterial({
      color: 0xfff6eb,
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    cols.forEach((cx) => {
      rows.forEach((cz) => {
        const fix = new THREE.Mesh(fixtureGeo, fixtureMat);
        fix.position.set(cx, 20.16, cz);
        hallGroup.add(fix);

        const lens = new THREE.Mesh(lensGeo, lensMat.clone());
        lens.position.set(cx, 20.12, cz);
        lens.rotation.x = Math.PI / 2;
        hallGroup.add(lens);
        lightLenses.push(lens);

        const vCone = new THREE.Mesh(downConeGeo, downConeMat.clone());
        vCone.position.set(cx, 20.1 - 3.75, cz);
        hallGroup.add(vCone);
        lightCones.push(vCone);

        const dLight = new THREE.PointLight(0xffeedd, 0, 14, 1.2);
        dLight.position.set(cx, 19.8, cz);
        hallGroup.add(dLight);
        houseLightsList.push(dLight);
      });
    });

    scene.add(hallGroup);

    // =========================================================================
    // 7. BUILD 400 AUDITORIUM SEATS (Mounted Exactly onto the Stepped Risers)
    // =========================================================================
    const seatMeshes = new Map<string, THREE.Object3D>();
    const seatData = new Map<string, SeatInfo>();

    const rowSeatCounts: Record<string, number> = {
      A: 24, B: 24, C: 26, D: 28, E: 28, F: 28, G: 28, H: 28, I: 24, J: 24,
      K: 30, L: 32, M: 34, N: 30, P: 12
    };

    const rowZMap: Record<string, number> = {
      A: -5.5, B: -3.5, C: -1.5, D: 0.7, E: 2.9, F: 5.1, G: 7.3, H: 9.5, I: 12.0, J: 14.5,
      K: 18.5, L: 20.8, M: 23.1, N: 25.4, P: 28.2
    };

    const rowYMap: Record<string, number> = {
      A: 0.42, B: 0.85, C: 1.35, D: 1.88, E: 2.40, F: 2.95, G: 3.50, H: 4.10, I: 4.80, J: 5.48,
      K: 7.60, L: 8.25, M: 8.90, N: 9.55, P: 10.35
    };

    const rowsConfig = [
      { row: 'A', tier: SEAT_TIERS.classic, span: 22 },
      { row: 'B', tier: SEAT_TIERS.classic, span: 22 },
      { row: 'C', tier: SEAT_TIERS.classic, span: 24 },
      { row: 'D', tier: SEAT_TIERS.classic, span: 26 },
      { row: 'E', tier: SEAT_TIERS.prime, span: 26 },
      { row: 'F', tier: SEAT_TIERS.prime, span: 26 },
      { row: 'G', tier: SEAT_TIERS.prime, span: 26 },
      { row: 'H', tier: SEAT_TIERS.prime, span: 26 },
      { row: 'I', tier: SEAT_TIERS.prime, span: 24 },
      { row: 'J', tier: SEAT_TIERS.prime, span: 24 },
      { row: 'K', tier: SEAT_TIERS.balcony, span: 28 },
      { row: 'L', tier: SEAT_TIERS.balcony, span: 28 },
      { row: 'M', tier: SEAT_TIERS.balcony, span: 30 },
      { row: 'N', tier: SEAT_TIERS.balcony, span: 30 },
      { row: 'P', tier: SEAT_TIERS.recliner, span: 26, isDaybed: true },
    ];

    rowsConfig.forEach((cfg) => {
      const count = rowSeatCounts[cfg.row] || 24;
      const y = rowYMap[cfg.row] || 1.0;
      const z = rowZMap[cfg.row] || 0.0;
      const stepX = cfg.span / Math.max(1, count - 1);
      const startX = -cfg.span / 2;

      for (let i = 0; i < count; i++) {
        const isAisle = (i === Math.floor(count * 0.28) || i === Math.floor(count * 0.72));
        if (isAisle && !cfg.isDaybed) continue;

        const seatId = `${cfg.row}${i + 1}`;
        const x = startX + i * stepX;
        const angleToScreen = Math.atan2(x, z - (-11.8)) * 0.45;
        const isBooked = (i * 7 + cfg.row.charCodeAt(0)) % 5 === 0;

        const info: SeatInfo = {
          id: seatId,
          row: cfg.row,
          number: i + 1,
          tier: cfg.tier,
          price: Math.round(cfg.tier.basePrice * (selectedShowtime?.priceFactor || 1.0)),
          isBooked,
          position: [x, y, z],
          rotationY: -angleToScreen,
        };
        seatData.set(seatId, info);

        const seatGroup = new THREE.Group();
        seatGroup.position.set(x, y, z);
        seatGroup.rotation.y = -angleToScreen;
        seatGroup.userData = { seatId };

        const baseColor = isBooked ? 0x1e202f : cfg.tier.color;

        if (cfg.isDaybed) {
          // VIP Royal Sleeper Bed / Couple Daybed
          const bedGeo = new THREE.BoxGeometry(2.1, 0.4, 1.8);
          const bedMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.5 });
          const bed = new THREE.Mesh(bedGeo, bedMat);
          bed.position.y = 0.2;
          seatGroup.add(bed);

          const headGeo = new THREE.BoxGeometry(2.1, 0.9, 0.15);
          const headMat = new THREE.MeshStandardMaterial({ color: 0x3d2719, roughness: 0.6 });
          const head = new THREE.Mesh(headGeo, headMat);
          head.position.set(0, 0.65, 0.85);
          seatGroup.add(head);

          const underGeo = new THREE.BoxGeometry(2.0, 0.04, 0.06);
          const underMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
          const under = new THREE.Mesh(underGeo, underMat);
          under.position.set(0, 0.02, 0.9);
          seatGroup.add(under);
        } else {
          // Ergonomic Stadium Seat
          const cushionGeo = new THREE.BoxGeometry(0.72, 0.18, 0.65);
          const cushionMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.55 });
          const cushion = new THREE.Mesh(cushionGeo, cushionMat);
          cushion.position.y = 0.45;
          seatGroup.add(cushion);

          const backGeo = new THREE.BoxGeometry(0.70, 0.85, 0.18);
          const backMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.55 });
          const back = new THREE.Mesh(backGeo, backMat);
          back.position.set(0, 0.85, 0.28);
          back.rotation.x = -0.12;
          seatGroup.add(back);

          const armGeo = new THREE.BoxGeometry(0.12, 0.42, 0.6);
          const armMat = new THREE.MeshStandardMaterial({ color: 0x111322, roughness: 0.7 });
          const leftArm = new THREE.Mesh(armGeo, armMat);
          leftArm.position.set(-0.42, 0.55, 0.05);
          const rightArm = new THREE.Mesh(armGeo, armMat);
          rightArm.position.set(0.42, 0.55, 0.05);
          seatGroup.add(leftArm, rightArm);
        }

        scene.add(seatGroup);
        seatMeshes.set(seatId, seatGroup);
      }
    });

    // 8. Raycaster for Interactive Clicks & Hovers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(seatMeshes.values()), true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData.seatId) {
          obj = obj.parent;
        }
        if (obj && obj.userData.seatId) {
          const info = seatData.get(obj.userData.seatId);
          if (info) {
            setHoveredSeat(info);
            container.style.cursor = info.isBooked ? 'not-allowed' : 'pointer';
            return;
          }
        }
      }
      setHoveredSeat(null);
      container.style.cursor = 'default';
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check screen click for Play / Pause trailer
      const screenHits = raycaster.intersectObject(screenMesh, false);
      if (screenHits.length > 0) {
        toggleTrailer();
        return;
      }

      // Check seats click
      const intersects = raycaster.intersectObjects(Array.from(seatMeshes.values()), true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData.seatId) {
          obj = obj.parent;
        }
        if (obj && obj.userData.seatId) {
          const info = seatData.get(obj.userData.seatId);
          if (info && !info.isBooked) {
            toggleSeat(info.id);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // 9. Resize Listener
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 10. Animation Loop
    let animFrameId = 0;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      // 360 Auto-Orbiting if enabled
      if (threeRef.current?.isOrbiting) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.6;
      } else {
        controls.autoRotate = false;
      }

      controls.update();

      // Draw Trailer Video onto Screen Canvas
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !video.paused) {
        screenCtx.drawImage(video, 0, 0, screenCanvas.width, screenCanvas.height);
        screenTexture.needsUpdate = true;
      } else {
        // Draw Obsidian Standby Screen with Amber Title
        const grad = screenCtx.createRadialGradient(
          screenCanvas.width / 2, screenCanvas.height / 2, 50,
          screenCanvas.width / 2, screenCanvas.height / 2, screenCanvas.width / 1.2
        );
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#080d1a');
        grad.addColorStop(1, '#020409');
        screenCtx.fillStyle = grad;
        screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

        // Grid lines
        screenCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        screenCtx.lineWidth = 2;
        for (let gx = 0; gx < screenCanvas.width; gx += 128) {
          screenCtx.beginPath();
          screenCtx.moveTo(gx, 0);
          screenCtx.lineTo(gx, screenCanvas.height);
          screenCtx.stroke();
        }

        // Amber Play Ring
        const cx = screenCanvas.width / 2;
        const cy = screenCanvas.height / 2 - 30;
        screenCtx.beginPath();
        screenCtx.arc(cx, cy, 64, 0, Math.PI * 2);
        screenCtx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        screenCtx.fill();
        screenCtx.strokeStyle = '#f59e0b';
        screenCtx.lineWidth = 4;
        screenCtx.stroke();

        // Play Triangle
        screenCtx.beginPath();
        screenCtx.moveTo(cx - 18, cy - 28);
        screenCtx.lineTo(cx + 28, cy);
        screenCtx.lineTo(cx - 18, cy + 28);
        screenCtx.closePath();
        screenCtx.fillStyle = '#f59e0b';
        screenCtx.fill();

        // Movie Title & Hint
        screenCtx.font = '900 48px "Montserrat", sans-serif';
        screenCtx.fillStyle = '#ffffff';
        screenCtx.textAlign = 'center';
        screenCtx.fillText(selectedMovie.title, screenCanvas.width / 2, screenCanvas.height / 2 + 85);

        screenCtx.font = '700 24px "Inter", sans-serif';
        screenCtx.fillStyle = '#94a3b8';
        screenCtx.fillText('CLICK SCREEN OR BUTTON TO PLAY TRAILER', screenCanvas.width / 2, screenCanvas.height / 2 + 130);

        screenTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      screenTexture,
      screenCanvas,
      screenCtx,
      screenMesh,
      screenLight,
      screenSpillLight,
      ambientLight,
      houseLightsList,
      lightCones,
      lightLenses,
      seatMeshes,
      seatData,
      isOrbiting: false,
      animFrameId,
    };

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
      woodCanvas.remove();
      carpetCanvas.remove();
      screenCanvas.remove();
    };
  }, [selectedMovie, selectedShowtime, activeStructure]);

  // Update selected and hovered seats visual highlights
  useEffect(() => {
    if (!threeRef.current) return;
    const { seatMeshes, seatData } = threeRef.current;

    seatMeshes.forEach((mesh, id) => {
      const info = seatData.get(id);
      if (!info) return;

      const isSelected = selectedSeats.includes(id);
      const isHovered = hoveredSeat?.id === id;

      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            if (isSelected) {
              child.material.color.set(0xf59e0b); // Gold amber
              child.material.emissive.set(0x78350f);
              child.material.emissiveIntensity = 0.55;
            } else if (isHovered && !info.isBooked) {
              child.material.color.set(0x38bdf8); // Sky blue
              child.material.emissive.set(0x0369a1);
              child.material.emissiveIntensity = 0.45;
            } else if (info.isBooked) {
              child.material.color.set(0x1e202f);
              child.material.emissive.set(0x000000);
            } else {
              child.material.color.set(info.tier.color);
              child.material.emissive.set(0x000000);
            }
          }
        }
      });
    });
  }, [selectedSeats, hoveredSeat]);

  // Bright House Lights Toggle Focus
  useEffect(() => {
    if (!threeRef.current) return;
    const { houseLightsList, lightCones, lightLenses, ambientLight, screenLight, scene } = threeRef.current;

    if (houseLights) {
      // House Lights ON: Bright luxury auditorium illumination
      houseLightsList.forEach((light) => {
        if (light instanceof THREE.PointLight) {
          gsap.to(light, { intensity: 4.8, duration: 0.6 });
        }
      });
      lightCones.forEach((cone) => {
        if (cone.material instanceof THREE.MeshBasicMaterial) {
          gsap.to(cone.material, { opacity: 0.45, duration: 0.6 });
        }
      });
      lightLenses.forEach((lens) => {
        if (lens.material instanceof THREE.MeshBasicMaterial) {
          lens.material.color.set(0xffffff);
        }
      });
      gsap.to(ambientLight, { intensity: 2.2, duration: 0.6 });
      gsap.to(screenLight, { intensity: 1.8, duration: 0.6 });
      if (scene.fog) {
        gsap.to(scene.fog, { density: 0.008, duration: 0.6 });
      }
    } else {
      // House Lights OFF: Cinematic movie darkness
      houseLightsList.forEach((light) => {
        if (light instanceof THREE.PointLight) {
          gsap.to(light, { intensity: 0.0, duration: 0.6 });
        }
      });
      lightCones.forEach((cone) => {
        if (cone.material instanceof THREE.MeshBasicMaterial) {
          gsap.to(cone.material, { opacity: 0.045, duration: 0.6 });
        }
      });
      lightLenses.forEach((lens) => {
        if (lens.material instanceof THREE.MeshBasicMaterial) {
          lens.material.color.set(0xfff8ed);
        }
      });
      gsap.to(ambientLight, { intensity: 0.95, duration: 0.6 });
      gsap.to(screenLight, { intensity: 4.2, duration: 0.6 });
      if (scene.fog) {
        gsap.to(scene.fog, { density: 0.016, duration: 0.6 });
      }
    }
  }, [houseLights]);

  // HD Mode Toggle
  useEffect(() => {
    if (!threeRef.current) return;
    const { renderer } = threeRef.current;
    renderer.setPixelRatio(hdMode ? 2.5 : Math.min(window.devicePixelRatio, 1.5));
  }, [hdMode]);

  // Camera Presets Animations
  useEffect(() => {
    if (!threeRef.current) return;
    const { camera, controls } = threeRef.current;

    threeRef.current.isOrbiting = (cameraPreset === 'orbit');

    if (activeSeatView) {
      const seat = threeRef.current.seatData.get(activeSeatView);
      if (seat) {
        gsap.to(camera.position, {
          x: seat.position[0],
          y: seat.position[1] + 1.15,
          z: seat.position[2],
          duration: 1.2,
          ease: 'power2.inOut',
        });
        gsap.to(controls.target, {
          x: 0,
          y: 7.8,
          z: -11.8,
          duration: 1.2,
          ease: 'power2.inOut',
          onUpdate: () => controls.update(),
        });
        return;
      }
    }

    const cameraPresetsMap: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
      overview: { pos: [0, 16.5, 34.5], target: [0, 5.2, 8.5] },
      sleeper: { pos: [0, 13.0, 31.0], target: [0, 10.2, 28.2] },
      balcony: { pos: [0, 11.2, 21.0], target: [0, 7.5, 6.0] },
      balcony_left: { pos: [-11.0, 11.2, 21.0], target: [-2, 7.5, 6.0] },
      balcony_right: { pos: [11.0, 11.2, 21.0], target: [2, 7.5, 6.0] },
      stage: { pos: [0, 4.0, -5.5], target: [0, 6.8, 16.0] },
      bird: { pos: [0, 32.0, 11.0], target: [0, 3.5, 9.0] },
      tour: { pos: [0, 16.5, 34.5], target: [0, 5.2, 8.5] },
      orbit: { pos: [0, 16.5, 34.5], target: [0, 5.2, 8.5] },
      'seat-view': { pos: [0, 16.5, 34.5], target: [0, 7.8, -11.8] }
    };

    const targetConfig = cameraPresetsMap[cameraPreset] || cameraPresetsMap.overview;

    gsap.to(camera.position, {
      x: targetConfig.pos[0],
      y: targetConfig.pos[1],
      z: targetConfig.pos[2],
      duration: 1.1,
      ease: 'power2.inOut',
    });

    gsap.to(controls.target, {
      x: targetConfig.target[0],
      y: targetConfig.target[1],
      z: targetConfig.target[2],
      duration: 1.1,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
    });
  }, [cameraPreset, activeSeatView]);

  // Handle HTML5 video trailer play/pause sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isTrailerMuted;
    if (isTrailerPlaying && !isTrailerStopped) {
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => { });
      });
    } else {
      video.pause();
      if (isTrailerStopped) {
        video.currentTime = 0;
      }
    }
  }, [isTrailerPlaying, isTrailerStopped, isTrailerMuted, selectedMovie]);

  // Pricing calculations
  const totalAmount = useMemo(() => {
    if (!threeRef.current) return 0;
    const { seatData } = threeRef.current;
    return selectedSeats.reduce((sum, id) => {
      const s = seatData.get(id);
      return sum + (s?.price || 240);
    }, 0);
  }, [selectedSeats]);

  return (
    <div className="fixed inset-0 z-50 bg-[#030307] flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Video Source for Three.js Texture */}
      <video
        ref={videoRef}
        src={selectedMovie.trailerUrl}
        playsInline
        loop
        muted={isTrailerMuted}
        preload="auto"
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 1,
          height: 1,
          opacity: 0.001,
          pointerEvents: 'none'
        }}
      />

      {/* Top Header Bar */}
      <div className="h-16 px-4 sm:px-6 bg-[#080b18]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-amber-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-base sm:text-lg text-white tracking-tight">
                {selectedMovie.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                {selectedMovie.cert}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {selectedTheatre.name} · {selectedShowtime.time} · {selectedShowtime.format}
            </p>
          </div>
        </div>

        {/* Top Controls: House Lights & HD Switch */}
        <div className="flex items-center gap-2">
          {/* House Lights Switch */}
          <button
            onClick={toggleHouseLights}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${houseLights
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus Lights</span>
          </button>

          {/* HD Mode */}
          <button
            onClick={toggleHdMode}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all ${hdMode
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
          >
            HD
          </button>
        </div>
      </div>

      {/* Main 3D Canvas + Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* 3D Canvas Container */}
        <div className="flex-1 relative h-full">
          <div ref={containerRef} className="w-full h-full" />

          {/* Floating Camera Presets Bar (Matching Image 3) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1 p-1 rounded-2xl bg-black/75 backdrop-blur-md border border-slate-700/80 shadow-2xl">
            <button
              onClick={() => setCameraPreset('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${cameraPreset === 'overview'
                ? 'bg-white text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCameraPreset('sleeper')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-pink-400 ${cameraPreset === 'sleeper'
                ? 'bg-pink-500 text-white font-black shadow-md'
                : 'hover:bg-white/10'
                }`}
            >
              🛏️ Sleeper Beds
            </button>
            <button
              onClick={() => setCameraPreset('balcony')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-purple-300 ${cameraPreset === 'balcony'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'hover:bg-white/10'
                }`}
            >
              👑 Balcony View
            </button>
            <button
              onClick={() => setCameraPreset('balcony_left')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-purple-300 ${cameraPreset === 'balcony_left'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'hover:bg-white/10'
                }`}
            >
              Balcony Left Box
            </button>
            <button
              onClick={() => setCameraPreset('balcony_right')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-purple-300 ${cameraPreset === 'balcony_right'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'hover:bg-white/10'
                }`}
            >
              Balcony Right Box
            </button>
            <button
              onClick={() => setCameraPreset('stage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${cameraPreset === 'stage'
                ? 'bg-white text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
            >
              From stage
            </button>
            <button
              onClick={() => setCameraPreset('bird')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${cameraPreset === 'bird'
                ? 'bg-white text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
            >
              Bird&apos;s eye
            </button>
            <button
              onClick={() => setCameraPreset('tour')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-amber-400 ${cameraPreset === 'tour'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'hover:bg-white/10'
                }`}
            >
              ▶ Tour
            </button>
          </div>

          {/* 360 Free Orbit Button (Top Right) */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setCameraPreset('orbit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg ${cameraPreset === 'orbit'
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/40'
                : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/80'
                }`}
            >
              <span>🔄 360° FREE ORBIT</span>
            </button>
          </div>

          {/* Floating Live Trailer Controller Dock (Top Left HUD - Matching Image 3) */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 shadow-2xl">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-400">
              <span className={`w-2 h-2 rounded-full ${isTrailerPlaying && !isTrailerStopped ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isTrailerPlaying && !isTrailerStopped ? '• TRAILER PLAYING' : 'SCREEN STANDBY'}</span>
            </div>

            <button
              onClick={() => (isTrailerPlaying ? pauseTrailer() : playTrailer())}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {isTrailerPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isTrailerPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => stopTrailer()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
              <span>Stop</span>
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {isTrailerMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

          {/* Floating Zoom & 360 Controls Dock (Right Side - Matching Image 3) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 p-1 rounded-2xl bg-black/80 backdrop-blur-md border border-slate-700/80 shadow-2xl">
            <button
              onClick={() => {
                if (threeRef.current) {
                  const c = threeRef.current.camera;
                  c.position.lerp(threeRef.current.controls.target, 0.2);
                  threeRef.current.controls.update();
                }
              }}
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-white font-black text-lg flex items-center justify-center hover:bg-slate-800 hover:text-amber-400 transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => {
                if (threeRef.current) {
                  const c = threeRef.current.camera;
                  const dir = c.position.clone().sub(threeRef.current.controls.target).normalize().multiplyScalar(4);
                  c.position.add(dir);
                  threeRef.current.controls.update();
                }
              }}
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-white font-black text-lg flex items-center justify-center hover:bg-slate-800 hover:text-amber-400 transition-colors"
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={() => setCameraPreset('overview')}
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-white font-bold text-sm flex items-center justify-center hover:bg-slate-800 hover:text-amber-400 transition-colors"
              title="Reset View"
            >
              ↺
            </button>
            <button
              onClick={() => setCameraPreset('orbit')}
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-slate-300 font-black text-[10px] flex items-center justify-center hover:bg-slate-800 hover:text-amber-400 transition-colors"
              title="360 Orbit"
            >
              360°
            </button>
          </div>

          {/* Seat Hover Tooltip */}
          {hoveredSeat && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-[#0d1021]/95 backdrop-blur-md border border-amber-500/50 shadow-xl flex items-center gap-3 pointer-events-none">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredSeat.tier.hexColor }} />
              <div className="text-xs">
                <span className="font-extrabold text-white">Seat {hoveredSeat.id}</span>
                <span className="text-slate-400 ml-1.5">({hoveredSeat.tier.name})</span>
              </div>
              <span className="font-black text-amber-400 text-xs">₹{hoveredSeat.price}</span>
              {hoveredSeat.isBooked && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                  Already Booked
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Seat Classes, Quick Pick & Booking Panel */}
        <div className="w-full lg:w-96 bg-[#0a0d1b] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between shrink-0 z-20 overflow-y-auto max-h-[45vh] lg:max-h-full">
          <div>
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-400 mb-3">
              Seat Classes
            </h3>

            {/* Seat Tiers List */}
            <div className="space-y-2 mb-5">
              {Object.values(SEAT_TIERS).map((tier) => (
                <div
                  key={tier.id}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full shadow-md"
                      style={{ backgroundColor: tier.hexColor }}
                    />
                    <div>
                      <div className="font-extrabold text-xs text-white">{tier.name}</div>
                      <div className="text-[10px] text-slate-400">{tier.desc.slice(0, 32)}...</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-amber-400 text-xs">
                      ₹{Math.round(tier.basePrice * selectedShowtime.priceFactor)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Pick Buttons */}
            <div className="mb-5">
              <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider mb-2">
                Quick Pick Seats
              </h4>
              <div className="flex gap-2">
                {[1, 2, 4, 6].map((count) => (
                  <button
                    key={count}
                    onClick={() => quickPickSeats(count)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800 hover:border-amber-400/50 transition-colors"
                  >
                    +{count}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Seats Pills */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Your Pick ({selectedSeats.length})
                </span>
                {selectedSeats.length > 0 && (
                  <button
                    onClick={clearSeats}
                    className="text-[11px] text-rose-400 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {selectedSeats.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-500">
                  Tap any available seat in the 3D auditorium.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map((id) => (
                    <div
                      key={id}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <button
                        onClick={() => viewFromSeat(id)}
                        title="View screen from this seat"
                        className="hover:scale-110 transition-transform"
                      >
                        <Eye className="w-3 h-3 text-slate-950" />
                      </button>
                      <span>{id}</span>
                      <button
                        onClick={() => toggleSeat(id)}
                        className="hover:opacity-70 ml-0.5 text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Total & Continue Action */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Total Amount</span>
                <span className="text-xl font-black text-amber-400 font-display">
                  ₹{totalAmount}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>

            <button
              disabled={selectedSeats.length === 0}
              onClick={openSnacks}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${selectedSeats.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              <span>Continue · Add Snacks</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
