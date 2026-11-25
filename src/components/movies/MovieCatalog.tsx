'use client';

import React from 'react';
import { useCinemaStore } from '@/store/useCinemaStore';
import { MOVIES, CINE_CATEGORIES } from '@/data/cineData';
import { Star, Ticket, Play, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function MovieCatalog() {
  const selectedCategory = useCinemaStore((state) => state.selectedCategory);
  const setCategory = useCinemaStore((state) => state.setCategory);
  const selectMovie = useCinemaStore((state) => state.selectMovie);
  const openShowtimes = useCinemaStore((state) => state.openShowtimes);
  const openFullscreenTrailer = useCinemaStore((state) => state.openFullscreenTrailer);
  const selectedMovie = useCinemaStore((state) => state.selectedMovie);

  const filteredMovies = MOVIES.filter((movie) => {
    if (selectedCategory === 'All') return true;
    return movie.languages.includes(selectedCategory);
  });

  return (
    <section id="movies-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NOW SHOWING & ADVANCE PREMIERE</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            Explore Blockbusters
          </h2>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CINE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25'
                  : 'bg-[#0e1329] text-slate-300 border border-white/10 hover:border-amber-400/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
        {filteredMovies.map((movie) => {
          const isSelected = selectedMovie.id === movie.id;
          return (
            <motion.div
              key={movie.id}
              whileHover={{ y: -8, scale: 1.025, rotateY: 2.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformStyle: 'preserve-3d', perspective: 800 }}
              onClick={() => selectMovie(movie)}
              className={`group relative rounded-2xl overflow-hidden bg-[#0a0e22] border transition-all cursor-pointer flex flex-col ${
                isSelected
                  ? 'border-amber-400 shadow-2xl shadow-amber-500/30 ring-2 ring-amber-400/50'
                  : 'border-white/10 hover:border-amber-400/80 shadow-xl hover:shadow-2xl'
              }`}
            >
              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Cert Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-amber-500/30 text-[10px] font-black text-amber-400 uppercase">
                  {movie.cert}
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-white/20 text-[11px] font-black text-white">
                  <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                  <span>{movie.rating}</span>
                </div>

                {/* Hover Play Button Overlay */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullscreenTrailer(movie);
                  }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/40 hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Movie Meta Content */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-black text-sm sm:text-base text-white truncate mb-1">
                    {movie.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mb-2 font-medium">
                    {movie.genre} · {movie.primaryLang}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {movie.formats.slice(0, 2).map((fmt) => (
                      <span
                        key={fmt}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-amber-300 font-semibold border border-white/10"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5 pt-2 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openShowtimes(movie);
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFullscreenTrailer(movie);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
