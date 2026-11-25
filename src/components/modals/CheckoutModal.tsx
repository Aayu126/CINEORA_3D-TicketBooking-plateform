'use client';

import React, { useState, useMemo } from 'react';
import { useCinemaStore } from '@/store/useCinemaStore';
import { SNACKS, SEAT_TIERS } from '@/data/cineData';
import { BookedTicket } from '@/types';
import { X, CheckCircle, Ticket, QrCode, Download, RotateCcw, Sparkles, FolderHeart } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutModal() {
  const selectedMovie = useCinemaStore((state) => state.selectedMovie);
  const selectedTheatre = useCinemaStore((state) => state.selectedTheatre);
  const selectedShowtime = useCinemaStore((state) => state.selectedShowtime);
  const selectedSeats = useCinemaStore((state) => state.selectedSeats);
  const snacks = useCinemaStore((state) => state.snacks);
  const closeModal = useCinemaStore((state) => state.closeModal);
  const resetBooking = useCinemaStore((state) => state.resetBooking);
  const saveBookedTicket = useCinemaStore((state) => state.saveBookedTicket);
  const openMyTickets = useCinemaStore((state) => state.openMyTickets);

  const [confirmedTicket, setConfirmedTicket] = useState<BookedTicket | null>(null);

  // Seat Price subtotal
  const seatSubtotal = useMemo(() => {
    return selectedSeats.reduce((sum, id) => {
      const row = id.charAt(0);
      let tierPrice = SEAT_TIERS.classic.basePrice;
      if (row === 'K') tierPrice = SEAT_TIERS.recliner.basePrice;
      else if (['M', 'N', 'P'].includes(row)) tierPrice = SEAT_TIERS.balcony.basePrice;
      else if (['E', 'F', 'G', 'H'].includes(row)) tierPrice = SEAT_TIERS.prime.basePrice;
      return sum + Math.round(tierPrice * selectedShowtime.priceFactor);
    }, 0);
  }, [selectedSeats, selectedShowtime]);

  // Snacks subtotal
  const snacksSubtotal = useMemo(() => {
    return Object.entries(snacks).reduce((sum, [id, qty]) => {
      const item = SNACKS.find((s) => s.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [snacks]);

  const convenienceFee = selectedSeats.length * 35;
  const gst = Math.round((seatSubtotal + snacksSubtotal + convenienceFee) * 0.18);
  const grandTotal = seatSubtotal + snacksSubtotal + convenienceFee + gst;

  const handleConfirmPay = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const structCode = selectedTheatre.structure.slice(0, 2).toUpperCase();
    const newTicket: BookedTicket = {
      id: `CIN-${randomCode}-${structCode}`,
      movieTitle: selectedMovie.title,
      poster: selectedMovie.poster,
      theatreName: selectedTheatre.name,
      theatreLocation: selectedTheatre.location,
      showtime: `${selectedShowtime.time} · ${selectedShowtime.format}`,
      format: selectedShowtime.format,
      seats: [...selectedSeats],
      totalAmount: grandTotal,
      bookedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    saveBookedTicket(newTicket);
    setConfirmedTicket(newTicket);
  };

  if (confirmedTicket) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl bg-[#0c1024] border border-amber-500/50 p-6 sm:p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h3 className="font-display font-black text-2xl text-white mb-1">
            Booking Confirmed!
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Ticket ID <span className="font-mono font-bold text-amber-400">{confirmedTicket.id}</span> generated and saved to <span className="text-white font-bold">&ldquo;My Tickets&rdquo;</span>.
          </p>

          {/* Ticket Pass Badge */}
          <div className="p-5 rounded-2xl bg-[#141830] border border-slate-700/80 text-left mb-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-3">
              <div>
                <h4 className="font-display font-black text-amber-400 text-base">{confirmedTicket.movieTitle}</h4>
                <p className="text-xs text-slate-300">{confirmedTicket.theatreName}</p>
                <p className="text-[10px] text-slate-400">{confirmedTicket.theatreLocation}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 flex flex-col items-center">
                <QrCode className="w-9 h-9" />
                <span className="text-[8px] font-mono mt-1 text-slate-400">{confirmedTicket.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Showtime</span>
                <span className="text-white font-extrabold">{confirmedTicket.showtime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Seats</span>
                <span className="text-amber-400 font-black">{confirmedTicket.seats.join(', ')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Paid:</span>
              <span className="text-white font-black text-sm">₹{confirmedTicket.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                closeModal();
                openMyTickets();
              }}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <FolderHeart className="w-4 h-4 text-rose-400" />
              <span>View in My Tickets</span>
            </button>
            <button
              onClick={resetBooking}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Book Another</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0c1022] border border-slate-700/80 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-[#13172e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-white">
                Review & Checkout
              </h3>
              <p className="text-xs text-slate-400">
                Confirm your 3D multiplex movie booking
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
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-[#141830] border border-slate-700/80 flex items-center gap-4">
            <div className="relative w-14 h-20 rounded-xl overflow-hidden border border-amber-500/40 shrink-0">
              <Image
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-black text-white text-base">
                {selectedMovie.title}
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {selectedTheatre.name}
              </p>
              <p className="text-xs text-amber-400 font-bold mt-0.5">
                {selectedShowtime.time} · {selectedShowtime.format}
              </p>
              <div className="text-xs text-slate-400 mt-1">
                Seats: <span className="font-bold text-white">{selectedSeats.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Tickets Subtotal ({selectedSeats.length} seats)</span>
              <span className="font-bold text-white">₹{seatSubtotal}</span>
            </div>

            {snacksSubtotal > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Food & Beverages</span>
                <span className="font-bold text-white">₹{snacksSubtotal}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Convenience Fee</span>
              <span>₹{convenienceFee}</span>
            </div>

            <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>Integrated GST (18%)</span>
              <span>₹{gst}</span>
            </div>

            <div className="flex justify-between text-sm font-black pt-1">
              <span className="text-white">Total Amount</span>
              <span className="text-amber-400 font-display text-lg">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Footer Confirm */}
        <div className="p-6 bg-[#0f1329] border-t border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Grand Total</span>
            <span className="text-2xl font-black text-amber-400 font-display">
              ₹{grandTotal}
            </span>
          </div>

          <button
            onClick={handleConfirmPay}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
          >
            Pay & Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
