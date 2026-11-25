'use client';

import React, { useMemo } from 'react';
import { useCinemaStore } from '@/store/useCinemaStore';
import { SNACKS } from '@/data/cineData';
import { X, Plus, Minus, Popcorn, ChevronRight, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function SnacksModal() {
  const snacks = useCinemaStore((state) => state.snacks);
  const updateSnackQty = useCinemaStore((state) => state.updateSnackQty);
  const closeModal = useCinemaStore((state) => state.closeModal);
  const openCheckout = useCinemaStore((state) => state.openCheckout);
  const openCinemaModal = useCinemaStore((state) => state.openCinemaModal);

  const totalSnacksAmount = useMemo(() => {
    return Object.entries(snacks).reduce((sum, [id, qty]) => {
      const item = SNACKS.find((s) => s.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [snacks]);

  const cartItems = useMemo(() => {
    return Object.entries(snacks)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = SNACKS.find((s) => s.id === id)!;
        return { ...item, qty, itemTotal: item.price * qty };
      });
  }, [snacks]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0c1022] border border-slate-700/80 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#13172e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Popcorn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white">
                Gourmet Cinema Bites & Live Cart
              </h3>
              <p className="text-xs text-slate-400">
                Freshly prepared and delivered right to your 3D selected seats
              </p>
            </div>
          </div>

          <button
            onClick={openCinemaModal}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Snacks List + Live Cart Sidebar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Snacks Catalog with Real Food Photos */}
          <div className="flex-1 p-5 sm:p-6 space-y-4 max-h-[55vh] overflow-y-auto">
            {SNACKS.map((snack) => {
              const qty = snacks[snack.id] || 0;

              return (
                <div
                  key={snack.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#141830] border border-slate-700/70 hover:border-amber-500/30 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    {/* Real Food Photo */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                      <Image
                        src={snack.image}
                        alt={snack.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <h4 className="font-bold text-white text-xs sm:text-sm">{snack.name}</h4>
                        {snack.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                            {snack.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mb-1.5">
                        {snack.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-black text-amber-400">₹{snack.price}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{snack.calories}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Counter Pill */}
                  <div className="flex items-center gap-2 bg-[#0b0e1d] p-1.5 rounded-xl border border-slate-700/80 shrink-0">
                    <button
                      disabled={qty === 0}
                      onClick={() => updateSnackQty(snack.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center text-xs font-bold transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-white text-xs">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateSnackQty(snack.id, 1)}
                      className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Live Cart Sidebar */}
          <div className="w-full lg:w-72 bg-[#0b0e1e] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 font-display font-black text-xs uppercase tracking-wider text-slate-300 mb-3">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Live Food Cart ({cartItems.reduce((acc, c) => acc + c.qty, 0)})</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-500">
                  Your cart is empty. Add popcorn, nachos or drinks!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white line-clamp-1">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.qty} × ₹{item.price}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-black text-amber-400">₹{item.itemTotal}</span>
                        <button
                          onClick={() => updateSnackQty(item.id, -item.qty)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-semibold">F&B Total</span>
                <span className="text-xl font-black text-amber-400 font-display">
                  ₹{totalSnacksAmount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openCheckout}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={openCheckout}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                >
                  <span>Checkout</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
