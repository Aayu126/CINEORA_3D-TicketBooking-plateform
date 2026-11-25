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
  const [hovered, setHovered] = useState(false);

  // Load high-res texture cleanly without any color box tint
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(movie.poster);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [movie.poster]);

  // Panoramic Arc Geometry:
  // Active movie is always at relIndex = 0 (centered, z = 0, facing directly forward)
  // Neighboring movies curve outward and backward (z < 0), always facing towards the viewer!
  const angleStep = 0.38; // ~21.8 degrees per screen
  const theta = relIndex * angleStep;
  const radius = 11.5;

  const targetX = Math.sin(theta) * radius;
  const targetZ = Math.cos(theta) * radius - radius; // z <= 0 always!
  const targetRotY = theta * 0.92; // Angle gently towards the viewer
  const targetY = isSelected ? 0.35 : 0;

  // Culling screens that are wrapped around out of panoramic view (|relIndex| > 3)
  const isVisible = Math.abs(relIndex) <= 3.5;

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
        {/* Front Poster Surface (Facing the viewer!) */}
        <mesh position={[0, 0, 0.02]} castShadow>
          <planeGeometry args={[3.2, 4.8, 16, 1]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.25}
            metalness={0.08}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Brushed Champagne Platinum Metallic Bezel */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.36, 4.96]} />
          <meshStandardMaterial
            color={isSelected ? 0xd97706 : 0x334155}
            roughness={0.25}
            metalness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Under-Screen Focus Spotlight Glow on Active/Hovered Screen */}
        {(isSelected || hovered) && (
          <pointLight
            position={[0, -2.4, 0.8]}
            color={isSelected ? '#f59e0b' : '#38bdf8'}
            intensity={isSelected ? 2.2 : 1.0}
            distance={5.0}
          />
        )}
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

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[0, 14, 12]} intensity={2.0} color="#fffcf5" castShadow />
      <pointLight position={[0, 6, 4]} intensity={1.5} color="#fffbeb" distance={20} />

      {/* Floating Ambient Golden Bokeh Motes */}
      <points>
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

      {/* Elegant Curved Golden Floor Guide Ribbon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.78, 0]}>
        <ringGeometry args={[11.3, 11.5, 64, 1, 0, Math.PI]} />
        <meshBasicMaterial color={0xf59e0b} transparent opacity={0.6} />
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
        camera={{ position: [0, 0.4, 11.2], fov: 42 }}
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
