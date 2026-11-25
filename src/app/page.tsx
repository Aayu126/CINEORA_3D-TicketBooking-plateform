'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useCinemaStore } from '@/store/useCinemaStore';
import Navbar from '@/components/ui/Navbar';
import HeroMovieCard from '@/components/hero/HeroMovieCard';
import MovieCatalog from '@/components/movies/MovieCatalog';
import TheatreShowcase from '@/components/theatres/TheatreShowcase';
import Footer from '@/components/ui/Footer';

// Dynamic import with ssr: false for Three.js WebGL canvases
const HeroPanorama3D = dynamic(() => import('@/components/hero/HeroPanorama3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] md:h-[620px] flex items-center justify-center bg-[#050711]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Loading 3D Cinema Experience...
        </span>
      </div>
    </div>
  ),
});

const CinemaHall3D = dynamic(() => import('@/components/cinema/CinemaHall3D'), {
  ssr: false,
});

const ShowtimeModal = dynamic(() => import('@/components/modals/ShowtimeModal'), {
  ssr: false,
});

const SnacksModal = dynamic(() => import('@/components/modals/SnacksModal'), {
  ssr: false,
});

const CheckoutModal = dynamic(() => import('@/components/modals/CheckoutModal'), {
  ssr: false,
});

const MyTicketsModal = dynamic(() => import('@/components/modals/MyTicketsModal'), {
  ssr: false,
});

const FullscreenTrailerModal = dynamic(() => import('@/components/modals/FullscreenTrailerModal'), {
  ssr: false,
});

export default function HomePage() {
  const activeModal = useCinemaStore((state) => state.activeModal);

  return (
    <main className="relative min-h-screen bg-[#030307] text-slate-100 flex flex-col pt-20">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero 3D Panorama & Featured Movie Section */}
      <section id="hero-section" className="relative w-full pt-4 pb-12 bg-gradient-to-b from-[#070a1a] via-[#050713] to-[#030307]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2 text-center">
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white">
            Immersive <span className="text-amber-400">3D Premiere</span> Carousel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Drag to rotate the 360° panorama · Click any poster to preview and book tickets
          </p>
        </div>

        {/* 3D Panorama Canvas */}
        <HeroPanorama3D />

        {/* Floating Movie Info & CTA Card */}
        <HeroMovieCard />
      </section>

      {/* Movies Catalog (Now Showing / Upcoming) */}
      <MovieCatalog />

      {/* 3 Distinct Architectural Models Showcase */}
      <TheatreShowcase />

      {/* Footer */}
      <Footer />

      {/* Interactive Booking Modals */}
      {activeModal === 'showtimes' && <ShowtimeModal />}
      {activeModal === 'cinema' && <CinemaHall3D />}
      {activeModal === 'snacks' && <SnacksModal />}
      {activeModal === 'checkout' && <CheckoutModal />}
      {activeModal === 'my-tickets' && <MyTicketsModal />}
      {activeModal === 'fullscreen-trailer' && <FullscreenTrailerModal />}
    </main>
  );
}
