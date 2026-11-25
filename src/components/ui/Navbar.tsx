'use client';

import React, { useState } from 'react';
import { useCinemaStore } from '@/store/useCinemaStore';
import { CINE_CITIES } from '@/data/cineData';
import { Film, MapPin, Search, Ticket, ChevronDown, FolderHeart } from 'lucide-react';

export default function Navbar() {
  const userCity = useCinemaStore((state) => state.userCity);
  const setCity = useCinemaStore((state) => state.setCity);
  const bookedTickets = useCinemaStore((state) => state.bookedTickets);
  const openMyTickets = useCinemaStore((state) => state.openMyTickets);
  const [cityOpen, setCityOpen] = useState(false);

  const currentCityName = CINE_CITIES.find((c) => c.id === userCity)?.name || 'Chennai';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#060816]/90 backdrop-blur-2xl border-b border-amber-500/15 transition-all shadow-2xl shadow-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 font-black text-xl group-hover:scale-105 transition-transform">
            <Film className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-wider text-white">
                CINE<span className="text-amber-400">ORA</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/15 text-amber-300 border border-amber-400/40 shadow-sm">
                3D IMAX
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
              Ultra-Realistic 3D Multiplex & Ticket Booking
            </p>
          </div>
        </div>

        {/* City Selector */}
        <div className="relative">
          <button
            onClick={() => setCityOpen(!cityOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f142b] hover:bg-[#151c3d] border border-amber-500/25 text-sm font-semibold text-white transition-all hover:border-amber-400 shadow-md group"
          >
            <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-wide">{currentCityName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
          </button>

          {cityOpen && (
            <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl bg-[#0c1024] border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-2 z-50 backdrop-blur-2xl">
              <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-400/80 border-b border-white/10 mb-1">
                Select Your City
              </div>
              {CINE_CITIES.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setCity(city.id);
                    setCityOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-white/10 transition-colors ${
                    city.id === userCity ? 'text-amber-400 bg-amber-500/15 font-black' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${city.id === userCity ? 'bg-amber-400' : 'bg-transparent'}`} />
                    <span>{city.name}</span>
                  </div>
                  {city.popular && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-amber-300/80 border border-white/10">
                      Popular
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-300">
          <a href="#hero-section" className="hover:text-amber-400 transition-colors">
            Featured 3D
          </a>
          <a href="#movies-section" className="hover:text-amber-400 transition-colors">
            Now Showing
          </a>
          <a href="#theatres-section" className="hover:text-amber-400 transition-colors">
            Architectures
          </a>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-44 lg:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search movies, venues..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
            />
          </div>

          {/* My Tickets Button */}
          <button
            onClick={openMyTickets}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f142b] hover:bg-[#161c3d] border border-white/10 hover:border-amber-400/50 text-xs font-bold text-white transition-all shadow-md relative"
          >
            <FolderHeart className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">My Tickets</span>
            {bookedTickets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {bookedTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => useCinemaStore.getState().openShowtimes()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Ticket className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden lg:inline">Book Tickets</span>
          </button>
        </div>
      </div>
    </header>
  );
}
