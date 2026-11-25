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
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
            <Film className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-wider text-slate-950">
                CINE<span className="text-amber-600">ORA</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-800 border border-amber-300">
                3D PLATFORM
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">
              Ultra-Realistic 3D Multiplex & Ticket Booking
            </p>
          </div>
        </div>

        {/* City Selector */}
        <div className="relative">
          <button
            onClick={() => setCityOpen(!cityOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-sm font-semibold text-slate-800 transition-all hover:border-amber-400"
          >
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>{currentCityName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
          </button>

          {cityOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Select Your City
              </div>
              {CINE_CITIES.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setCity(city.id);
                    setCityOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 transition-colors ${city.id === userCity ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-700'
                    }`}
                >
                  <span>{city.name}</span>
                  {city.popular && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Popular
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#hero-section" className="hover:text-amber-600 transition-colors">
            Featured 3D
          </a>
          <a href="#movies-section" className="hover:text-amber-600 transition-colors">
            Now Showing
          </a>
          <a href="#theatres-section" className="hover:text-amber-600 transition-colors">
            Architectures
          </a>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search movies, theatres..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors shadow-sm"
            />
          </div>

          {/* My Tickets Button */}
          <button
            onClick={openMyTickets}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 hover:text-slate-950 transition-all shadow-sm relative"
          >
            <FolderHeart className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">My Tickets</span>
            {bookedTickets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {bookedTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => useCinemaStore.getState().openShowtimes()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
          >
            <Ticket className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden lg:inline">Book Tickets</span>
          </button>
        </div>
      </div>
    </header>
  );
}
