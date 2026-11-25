'use client';

import React from 'react';
import { HALL_STRUCTURES, THEATRES } from '@/data/cineData';
import { useCinemaStore } from '@/store/useCinemaStore';
import { Sparkles, Eye, Armchair, Volume2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TheatreShowcase() {
  const selectShowtime = useCinemaStore((state) => state.selectShowtime);

  return (
    <section id="theatres-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-300 text-xs font-black uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>3 DISTINCT AUDITORIUM DESIGNS</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight mb-4">
          Architectural Cinema Marvels
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Switch between customized architectural auditoriums matching real-world luxury multiplex designs — complete with stepped risers, acoustic paneling, and VIP daybeds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {HALL_STRUCTURES.map((hall) => {
          const matchingTheatre = THEATRES.find((t) => t.structure === hall.id) || THEATRES[0];

          return (
            <motion.div
              key={hall.id}
              whileHover={{ y: -10, rotateX: 3, rotateY: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              className="rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/90 hover:border-amber-400 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Icon + Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm">
                    {hall.icon}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${hall.accentColor}15`,
                      color: hall.accentColor,
                      border: `1px solid ${hall.accentColor}35`,
                    }}
                  >
                    {hall.badge}
                  </span>
                </div>

                <h3 className="font-display font-black text-xl text-slate-950 mb-2 tracking-tight">
                  {hall.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {hall.description}
                </p>

                {/* Features Highlights */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Armchair className="w-4 h-4 text-amber-600" />
                    <span>Capacity: {hall.defaultSeats} luxury seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Volume2 className="w-4 h-4 text-sky-600" />
                    <span>Audio: Dolby Atmos 128-channel 3D Array</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Maximize2 className="w-4 h-4 text-emerald-600" />
                    <span>Curved 2.39:1 Cinemascope Screen</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => selectShowtime(matchingTheatre, matchingTheatre.shows[0])}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 text-white font-black text-xs uppercase tracking-wider border border-slate-800 hover:border-amber-400 transition-all flex items-center justify-center gap-2 group shadow-md"
              >
                <Eye className="w-4 h-4 text-amber-400 group-hover:text-slate-950 transition-colors" />
                <span>Enter 3D Hall ({hall.defaultSeats} Seats)</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
