'use client';

import React from 'react';
import { useCinemaStore } from '@/store/useCinemaStore';
import { X, Ticket, QrCode, Calendar, MapPin, Download, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function MyTicketsModal() {
  const bookedTickets = useCinemaStore((state) => state.bookedTickets);
  const closeModal = useCinemaStore((state) => state.closeModal);
  const openShowtimes = useCinemaStore((state) => state.openShowtimes);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c1022] border border-slate-700/80 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-[#13172e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-white">
                My Booked Tickets
              </h3>
              <p className="text-xs text-slate-400">
                Active 3D cinema passes and reservation barcodes
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {bookedTickets.length === 0 ? (
            <div className="py-12 text-center">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-300 text-sm mb-1">No Tickets Booked Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
                Pick a movie, explore the 3D cinema hall, select your seats, and confirm your booking.
              </p>
              <button
                onClick={() => {
                  closeModal();
                  openShowtimes();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
              >
                Browse Movies
              </button>
            </div>
          ) : (
            bookedTickets.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-[#141830] border border-slate-700/80 hover:border-amber-500/40 transition-all shadow-md relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/70 pb-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-amber-500/40 shrink-0">
                      <Image
                        src={t.poster}
                        alt={t.movieTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-white text-base">
                        {t.movieTitle}
                      </h4>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>{t.theatreName}</span>
                      </p>
                      <span className="text-[10px] text-amber-400 font-mono font-bold block mt-0.5">
                        Ticket ID: {t.id}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 flex flex-col items-center shrink-0">
                    <QrCode className="w-8 h-8" />
                    <span className="text-[8px] font-mono mt-0.5 text-slate-400">ENTRY PASS</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Showtime</span>
                    <span className="text-white font-bold">{t.showtime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Seats ({t.seats.length})</span>
                    <span className="text-amber-400 font-black">{t.seats.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Paid</span>
                    <span className="text-white font-black">₹{t.totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Booked On</span>
                    <span className="text-slate-300 font-medium">{t.bookedAt}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/40 flex justify-end">
                  <button
                    onClick={() => alert(`Downloaded E-Ticket for ${t.movieTitle} (ID: ${t.id})`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Ticket</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
