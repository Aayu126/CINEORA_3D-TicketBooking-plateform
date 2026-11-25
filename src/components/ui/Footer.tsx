'use client';

import React from 'react';
import { Film, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  const techStack = [
    'Next.js 14',
    'React 18',
    'TypeScript',
    'Three.js / React Three Fiber',
    'GSAP 3',
    'Motion (Framer)',
    'Lenis',
    'Tailwind CSS',
    'Zustand',
    'Vercel Ready',
  ];

  return (
    <footer className="bg-[#050711] border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
                <Film className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-display font-black text-2xl text-white tracking-wider">
                CINE<span className="text-amber-400">ORA</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The world&apos;s first ultra-realistic 3D cinema booking platform. Featuring authentic movie trailers streaming onto 2.39:1 Cinemascope screens, dynamic auditorium lighting, and customizable architectural venues.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PCI-DSS Level 1 Secure Checkout · 256-Bit SSL Encrypted</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-white mb-4">
              Cinema Formats
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-amber-400 transition-colors cursor-pointer">IMAX Laser 4K Experience</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Dolby Atmos 128 Channels</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">4DX Motion & Sensory 3D</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Royal Daybed Balcony Suite</li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-white mb-4">
              Prime Multiplexes
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Jazz Cinemas Luxe, Phoenix Marketcity</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">PVR INOX Luxe, VR Chennai</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Cineora Exclusive VIP Lounge</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Mumbai & Bengaluru Flagships</li>
            </ul>
          </div>
        </div>

        {/* Tech Stack Banner */}
        <div className="p-4 rounded-2xl bg-[#090c1a] border border-slate-800/80 mb-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Tech Stack:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 font-semibold border border-slate-800 text-[11px]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} CINEORA Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for cinema lovers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
