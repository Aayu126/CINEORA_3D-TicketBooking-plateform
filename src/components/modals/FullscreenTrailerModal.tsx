'use client';

import React, { useRef, useState } from 'react';
import { useCinemaStore } from '@/store/useCinemaStore';
import { X, Play, Pause, Volume2, VolumeX, Ticket, ChevronDown } from 'lucide-react';

export default function FullscreenTrailerModal() {
  const selectedMovie = useCinemaStore((state) => state.selectedMovie);
  const closeModal = useCinemaStore((state) => state.closeModal);
  const openShowtimes = useCinemaStore((state) => state.openShowtimes);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleBookNow = () => {
    closeModal();
    openShowtimes(selectedMovie);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
      {/* Fullscreen Video */}
      <video
        ref={videoRef}
        src={selectedMovie.trailerUrl}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-contain bg-black z-0"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Top Floating Header */}
      <div className="relative z-20 h-20 px-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight">
            {selectedMovie.title} — Official Trailer
          </h2>
          <p className="text-xs text-amber-400 font-bold">
            {selectedMovie.cert} · {selectedMovie.genre} · {selectedMovie.runtime}
          </p>
        </div>

        <button
          onClick={closeModal}
          className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Floating Bar */}
      <div className="relative z-20 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white hover:bg-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Scroll to Details & Book CTA */}
        <button
          onClick={handleBookNow}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
        >
          <Ticket className="w-4 h-4 stroke-[2.5]" />
          <span>Scroll to Details & Book Tickets</span>
          <ChevronDown className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
