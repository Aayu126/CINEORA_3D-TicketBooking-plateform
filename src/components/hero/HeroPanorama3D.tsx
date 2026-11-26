'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCinemaStore } from '@/store/useCinemaStore';
import { MOVIES } from '@/data/cineData';
import { Movie } from '@/types';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CinemaScreenCurveProps {
  movie: Movie;
  relIndex: number;
  isSelected: boolean;
  onSelect: (movie: Movie) => void;
}

function CinemaScreenCurve({ movie, relIndex, isSelected, onSelect }: CinemaScreenCurveProps) {
  const groupRef = useRef<THREE.Group>(null);
  const subGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Load high-res texture cleanly with instant canvas backdrop and robust multi-path loading
  const texture = useMemo(() => {
    // 1. Generate an instant crisp high-contrast canvas texture with title, cert & rating
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 512, 768);
      grad.addColorStop(0, '#0c1020');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#050814');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 768);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(movie.title, 256, 360);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '700 22px sans-serif';
      ctx.fillText(`★ ${movie.rating} · ${movie.genre}`, 256, 410);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 18px sans-serif';
      ctx.fillText(movie.primaryLang + ' · ' + movie.runtime, 256, 450);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    // 2. Load the actual poster file asynchronously with auto fallback
    const loader = new THREE.TextureLoader();
    const posterSrc = movie.poster;
    loader.load(
      posterSrc,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        tex.image = loadedTex.image;
        tex.needsUpdate = true;
      },
      undefined,
      () => {
        const altSrc = posterSrc.startsWith('/') ? posterSrc.slice(1) : '/' + posterSrc;
        loader.load(altSrc, (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          tex.image = loadedTex.image;
          tex.needsUpdate = true;
        });
      }
    );

    return tex;
  }, [movie.poster, movie.title, movie.rating, movie.genre, movie.primaryLang, movie.runtime]);

  // Panoramic Arc Geometry:
  // Active movie is always at relIndex = 0 (centered, z = 0, facing directly forward)
  // Neighboring movies curve inward and backward (z < 0), with negative rotation facing towards the viewer!
  const angleStep = 0.36; // ~20.6 degrees per screen
  const theta = relIndex * angleStep;
  const radius = 11.2;

  const targetX = Math.sin(theta) * radius;
  const targetZ = Math.cos(theta) * radius - radius; // z <= 0 curves backwards away from camera
  const targetRotY = -theta * 0.96; // Turn inwards to face towards the center camera!
  const targetY = isSelected ? 0.72 : 0; // Prominently elevate active movie so front banner is 100% visible

  // Visible screens across the panoramic view (|relIndex| <= 3.5)
  const isVisible = Math.abs(relIndex) <= 3.5;

  // Organic continuous 3D floating and breathing animation
  useFrame(({ clock }) => {
    if (!subGroupRef.current) return;
    const t = clock.getElapsedTime();
    const floatY = Math.sin(t * 1.8 + relIndex * 0.7) * 0.09;
    const tiltZ = Math.sin(t * 1.3 + relIndex * 0.4) * 0.015;
    subGroupRef.current.position.y = floatY;
    subGroupRef.current.rotation.z = tiltZ;
  });

  useEffect(() => {
    if (!groupRef.current) return;

    const baseScale = isSelected ? 1.18 : Math.max(0.72, 1.0 - Math.abs(relIndex) * 0.12);
    const targetScale = hovered ? baseScale * 1.06 : baseScale;

    gsap.to(groupRef.current.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 0.65,
      ease: 'power2.out',
    });

    gsap.to(groupRef.current.rotation, {
      y: targetRotY,
      duration: 0.65,
      ease: 'power2.out',
    });

    gsap.to(groupRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 0.45,
      ease: 'power2.out',
    });
  }, [relIndex, isSelected, hovered, targetX, targetY, targetZ, targetRotY]);

  if (!isVisible) return null;

  return (
    <group ref={groupRef} position={[targetX, 0, targetZ]} rotation={[0, targetRotY, 0]}>
      <group ref={subGroupRef}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelect(movie);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          {/* Front Poster Surface (Elevated in Z to guarantee zero bezel clipping or depth-fighting) */}
          <mesh position={[0, 0, 0.05]} castShadow>
            <planeGeometry args={[3.2, 4.8, 16, 1]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.20}
              metalness={0.04}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Brushed Champagne Gold / Obsidian Platinum Metallic Bezel Frame with Depth */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[3.36, 4.96, 0.07]} />
            <meshStandardMaterial
              color={isSelected ? 0xd97706 : 0x242d3d}
              emissive={isSelected ? 0x92400e : 0x000000}
              emissiveIntensity={isSelected ? 0.45 : 0}
              roughness={0.25}
              metalness={0.88}
            />
          </mesh>

          {/* Dedicated Front Key Spotlight on Active Movie Screen */}
          {isSelected && (
            <pointLight
              position={[0, 0.5, 3.2]}
              color="#fffcf5"
              intensity={3.8}
              distance={9.0}
            />
          )}

          {/* Under-Screen Ambient Focus Spotlight Glow on Active/Hovered Screen */}
          {(isSelected || hovered) && (
            <pointLight
              position={[0, -2.4, 0.8]}
              color={isSelected ? '#f59e0b' : '#38bdf8'}
              intensity={isSelected ? 2.8 : 1.2}
              distance={6.0}
            />
          )}
        </group>
      </group>
    </group>
  );
}

function CurvedScreensRing() {
  const selectedMovie = useCinemaStore((state) => state.selectedMovie);
  const selectMovie = useCinemaStore((state) => state.selectMovie);
  const nextMovie = useCinemaStore((state) => state.nextMovie);
  const prevMovie = useCinemaStore((state) => state.prevMovie);

  const count = MOVIES.length;
  const activeIdx = useMemo(() => {
    const idx = MOVIES.findIndex((m) => m.id === selectedMovie.id);
    return idx !== -1 ? idx : 0;
  }, [selectedMovie]);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragAccum = useRef(0);
  const particlesRef = useRef<THREE.Points>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Floating Golden Particles
  const particles = useMemo(() => {
    const num = 180;
    const pos = new Float32Array(num * 3);
    for (let i = 0; i < num; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = Math.random() * 12 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 2;
    }
    return pos;
  }, []);

  // 3D Parallax Camera & Dynamic Atmospheric Animation
  useFrame(({ clock, mouse, camera }) => {
    // Dynamic camera parallax responding gently to cursor
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1.1, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.55 + mouse.y * 0.25, 0.04);
    camera.lookAt(0, 0.25, -2);

    // 3D dynamic swirling motes
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.035;
      particlesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.04;
    }

    // Dynamic glowing floor guide ribbon pulsing
    if (ringMatRef.current) {
      ringMatRef.current.opacity = 0.45 + Math.sin(clock.getElapsedTime() * 2.2) * 0.25;
    }
  });

  const activeModal = useCinemaStore((state) => state.activeModal);
  const isTrailerPlaying = useCinemaStore((state) => state.isTrailerPlaying);

  // Smooth automatic slideshow rotation ONLY when on homepage and no modal or theater is active
  useEffect(() => {
    // Crucial: Stop auto-rotation whenever cinema hall, showtimes, snacks, or trailer modal is active!
    if (activeModal !== null || isTrailerPlaying) return;

    const timer = setInterval(() => {
      if (!isDragging.current) {
        nextMovie();
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [activeModal, isTrailerPlaying, nextMovie]);

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[0, 14, 12]} intensity={2.0} color="#fffcf5" castShadow />
      <pointLight position={[0, 6, 4]} intensity={1.5} color="#fffbeb" distance={20} />

      {/* Floating Ambient Golden Bokeh Motes with 3D Swirl */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#f59e0b"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Interactive Curved Panoramic Arc of Screens */}
      <group
        onPointerDown={(e) => {
          isDragging.current = true;
          dragStartX.current = e.clientX;
          dragAccum.current = 0;
        }}
        onPointerMove={(e) => {
          if (!isDragging.current) return;
          const delta = e.clientX - dragStartX.current;
          dragAccum.current += delta;
          dragStartX.current = e.clientX;

          if (dragAccum.current > 60) {
            prevMovie();
            dragAccum.current = 0;
          } else if (dragAccum.current < -60) {
            nextMovie();
            dragAccum.current = 0;
          }
        }}
        onPointerUp={() => {
          isDragging.current = false;
        }}
        onPointerLeave={() => {
          isDragging.current = false;
        }}
      >
        {MOVIES.map((movie, index) => {
          let rel = index - activeIdx;
          while (rel > count / 2) rel -= count;
          while (rel < -count / 2) rel += count;

          return (
            <CinemaScreenCurve
              key={movie.id}
              movie={movie}
              relIndex={rel}
              isSelected={selectedMovie.id === movie.id}
              onSelect={(m) => selectMovie(m)}
            />
          );
        })}
      </group>

      {/* Reflective Luminous Stage Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, -4]}>
        <planeGeometry args={[48, 24]} />
        <meshStandardMaterial
          color={0x0b0e1a}
          roughness={0.18}
          metalness={0.45}
        />
      </mesh>

      {/* Elegant Curved Golden Floor Guide Ribbon with Pulsing Glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.78, 0]}>
        <ringGeometry args={[11.3, 11.5, 64, 1, 0, Math.PI]} />
        <meshBasicMaterial ref={ringMatRef} color={0xf59e0b} transparent opacity={0.6} />
      </mesh>
    </>
  );
}

export default function HeroPanorama3D() {
  const nextMovie = useCinemaStore((state) => state.nextMovie);
  const prevMovie = useCinemaStore((state) => state.prevMovie);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevMovie();
      else if (e.key === 'ArrowRight') nextMovie();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextMovie, prevMovie]);

  return (
    <div className="relative w-full h-[500px] sm:h-[560px] md:h-[620px] overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0.55, 11.4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <CurvedScreensRing />
      </Canvas>

      {/* Left Navigation Arrow Button */}
      <button
        onClick={prevMovie}
        className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700/80 hover:border-amber-400 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md group"
        title="Previous Movie (Left Arrow)"
        aria-label="Previous Movie"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* Right Navigation Arrow Button */}
      <button
        onClick={nextMovie}
        className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700/80 hover:border-amber-400 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md group"
        title="Next Movie (Right Arrow)"
        aria-label="Next Movie"
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Ambient Gradient Blend at Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030307] via-[#030307]/70 to-transparent pointer-events-none" />
    </div>
  );
}
