'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCinemaStore } from '@/store/useCinemaStore';
import { MOVIES } from '@/data/cineData';
import { Star, Clock, Globe, Ticket, Play, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function HeroMovieCard() {
  const selectedMovie = useCinemaStore((state) => state.selectedMovie);
  const openShowtimes = useCinemaStore((state) => state.openShowtimes);
  const selectShowtime = useCinemaStore((state) => state.selectShowtime);
  const openFullscreenTrailer = useCinemaStore((state) => state.openFullscreenTrailer);
  const selectedTheatre = useCinemaStore((state) => state.selectedTheatre);
  const nextMovie = useCinemaStore((state) => state.nextMovie);
  const prevMovie = useCinemaStore((state) => state.prevMovie);
  const [imgError, setImgError] = useState(false);

  const movieIdx = MOVIES.findIndex((m) => m.id === selectedMovie.id);
  const currentIndex = movieIdx !== -1 ? movieIdx + 1 : 1;

  const fallbackPoster = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="300" height="450" rx="20" fill="url(%23g)"/><text x="150" y="200" fill="%23f59e0b" font-family="sans-serif" font-weight="900" font-size="24" text-anchor="middle">${encodeURIComponent(selectedMovie.title)}</text><text x="150" y="235" fill="%23ffffff" font-family="sans-serif" font-weight="700" font-size="14" text-anchor="middle">CINEORA 4K</text></svg>`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMovie.id}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl shadow-slate-300/50 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          {/* Left: Thumbnail + Title & Meta */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left flex-1">
            {/* Thumbnail with prev/next overlays */}
            <div className="relative group shrink-0">
              <div className="relative w-28 h-40 sm:w-32 sm:h-48 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl bg-slate-900">
                <Image
                  src={imgError ? fallbackPoster : (selectedMovie.poster || fallbackPoster)}
                  alt={selectedMovie.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                  onError={() => setImgError(true)}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-md">
                  {selectedMovie.cert}
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                  {selectedMovie.primaryLang}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                  {selectedMovie.genre}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
                  {selectedMovie.releaseDate}
                </span>

                {/* Left / Right Carousel Navigation Controls */}
                <div className="flex items-center gap-1.5 sm:ml-auto">
                  <span className="text-xs font-mono font-bold text-slate-500 mr-1">
                    {String(currentIndex).padStart(2, '0')} / {String(MOVIES.length).padStart(2, '0')}
                  </span>
                  <button
                    onClick={prevMovie}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 flex items-center justify-center transition-all border border-slate-200 active:scale-95"
                    title="Previous Movie (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={nextMovie}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 flex items-center justify-center transition-all border border-slate-200 active:scale-95"
                    title="Next Movie (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-950 tracking-tight mb-2">
                {selectedMovie.title}
              </h1>

              <p className="text-xs sm:text-sm text-amber-800/90 font-medium italic mb-3">
                &ldquo;{selectedMovie.tagline}&rdquo;
              </p>

              {/* Badges Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-1.5 font-bold text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500 stroke-none" />
                  <span className="text-slate-950 text-sm font-black">{selectedMovie.rating}</span>
                  <span className="text-slate-400 text-[10px]">({selectedMovie.votes} votes)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedMovie.runtime}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedMovie.languages.join(', ')}</span>
                </div>
              </div>

              {/* Cast & Synopsis */}
              <p className="text-xs text-slate-600 max-w-2xl line-clamp-2 leading-relaxed mb-3">
                {selectedMovie.description}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Starring:</span>
                {selectedMovie.cast.map((actor) => (
                  <span
                    key={actor}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => openShowtimes(selectedMovie)}
              className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Ticket className="w-5 h-5 stroke-[2.5]" />
              <span>Book Tickets</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => openFullscreenTrailer(selectedMovie)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Trailer</span>
              </button>

              <button
                onClick={() => {
                  selectShowtime(selectedTheatre, selectedTheatre.shows[0]);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>3D Hall</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
