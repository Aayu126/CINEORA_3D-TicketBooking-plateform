'use client';

import React, { useState } from 'react';
import { useCinemaStore } from '@/store/useCinemaStore';
import { THEATRES } from '@/data/cineData';
import { X, MapPin, Sparkles, Clock } from 'lucide-react';
import Image from 'next/image';

export default function ShowtimeModal() {
  const selectedMovie = useCinemaStore((state) => state.selectedMovie);
  const closeModal = useCinemaStore((state) => state.closeModal);
  const selectShowtime = useCinemaStore((state) => state.selectShowtime);
  const [imgError, setImgError] = useState(false);

  // SVG Data URI Fallback ensures no broken image can EVER display
  const posterFallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="200" height="300" rx="16" fill="url(%23g)"/><text x="100" y="130" fill="%23f59e0b" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">${encodeURIComponent(selectedMovie?.title || 'CINEORA')}</text><text x="100" y="155" fill="%2338bdf8" font-family="sans-serif" font-weight="700" font-size="12" text-anchor="middle">IMAX LASER</text><text x="100" y="180" fill="%2394a3b8" font-family="sans-serif" font-size="10" text-anchor="middle">4K DOLBY ATMOS</text></svg>`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden my-auto shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          background: '#0c0f22',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          color: '#ffffff'
        }}
      >
        {/* Modal Header */}
        <div 
          className="p-6 border-b flex items-start justify-between gap-4"
          style={{
            background: '#14182e',
            borderBottom: '1px solid rgba(255, 255, 255, 0.14)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-24 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-[#1c2038] shadow-lg">
              <Image
                src={imgError ? posterFallback : (selectedMovie.poster || posterFallback)}
                alt={selectedMovie.title}
                fill
                className="object-cover"
                unoptimized
                onError={() => setImgError(true)}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-black text-2xl text-white tracking-tight">
                  {selectedMovie.title}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                  {selectedMovie.cert}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">
                {selectedMovie.genre} · {selectedMovie.runtime} · {selectedMovie.languages.join(', ')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>CINEORA Laser Experience</span>
                </span>
                <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1">
                  ⚡ Fast Filling
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theatres List - Deep Luxury Dark Background & High Contrast */}
        <div 
          className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"
          style={{ background: '#0c0f22' }}
        >
          {THEATRES.map((theatre) => (
            <div
              key={theatre.id}
              className="p-5 rounded-2xl transition-all shadow-md"
              style={{
                background: '#151930',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                color: '#ffffff'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="font-display font-black text-white text-base sm:text-lg">
                    {theatre.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-slate-200 font-medium">{theatre.location}</span>
                    <span className="text-amber-400 font-black">· {theatre.distance}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {theatre.facilities.map((fac) => (
                    <span
                      key={fac}
                      className="text-[10px] px-2.5 py-1 rounded-md font-semibold"
                      style={{
                        background: '#212643',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Showtimes Pills */}
              <div className="flex flex-wrap gap-2.5 mt-4">
                {theatre.shows.map((show) => (
                  <button
                    key={show.time}
                    onClick={() => selectShowtime(theatre, show)}
                    className="group px-4 py-2.5 rounded-xl transition-all text-left shadow-sm hover:shadow-lg hover:shadow-amber-500/25 cursor-pointer"
                    style={{
                      background: '#21253e',
                      border: '1px solid rgba(255, 255, 255, 0.16)'
                    }}
                  >
                    <div className="font-extrabold text-white group-hover:text-amber-300 text-sm flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{show.time}</span>
                    </div>
                    <div className="text-[10px] text-amber-300 group-hover:text-amber-200 font-bold mt-0.5">
                      {show.format}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
