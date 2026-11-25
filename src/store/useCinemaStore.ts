import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Movie, Theatre, ShowSlot, StructureId, SeatInfo, BookedTicket, ModalType, CameraPreset } from '@/types';
import { MOVIES, THEATRES } from '@/data/cineData';

export type { CameraPreset };

export interface CinemaState {
  userCity: string;
  selectedCategory: string;
  selectedMovie: Movie;
  selectedTheatre: Theatre;
  selectedShowtime: ShowSlot;
  activeStructure: StructureId;
  selectedSeats: string[];
  hoveredSeat: SeatInfo | null;
  cameraPreset: CameraPreset;
  activeSeatView: string | null;
  isTrailerPlaying: boolean;
  isTrailerStopped: boolean;
  isTrailerMuted: boolean;
  houseLights: boolean;
  hdMode: boolean;
  activeModal: ModalType;
  snacks: Record<string, number>;
  bookedTickets: BookedTicket[];
}

export interface CinemaActions {
  setCity: (city: string) => void;
  setCategory: (category: string) => void;
  selectMovie: (movie: Movie) => void;
  nextMovie: () => void;
  prevMovie: () => void;
  openShowtimes: (movie?: Movie) => void;
  selectShowtime: (theatre: Theatre, show: ShowSlot) => void;
  openCinemaModal: () => void;
  openMyTickets: () => void;
  openFullscreenTrailer: (movie?: Movie) => void;
  closeModal: () => void;
  toggleSeat: (seatId: string) => void;
  clearSeats: () => void;
  quickPickSeats: (count: number, tierId?: string) => void;
  setHoveredSeat: (seat: SeatInfo | null) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  viewFromSeat: (seatId: string) => void;
  toggleTrailer: (force?: boolean) => void;
  playTrailer: () => void;
  pauseTrailer: () => void;
  stopTrailer: () => void;
  toggleMute: () => void;
  toggleHouseLights: () => void;
  toggleHdMode: () => void;
  openSnacks: () => void;
  openCheckout: () => void;
  updateSnackQty: (id: string, delta: number) => void;
  saveBookedTicket: (ticket: BookedTicket) => void;
  resetBooking: () => void;
}

export type CinemaStore = CinemaState & CinemaActions;

const defaultMovie = MOVIES[1]; // Jailer 2
const defaultTheatre = THEATRES[0]; // Luxe Phoenix Marketcity
const defaultShowtime = defaultTheatre.shows[0];

const getStoredTickets = (): BookedTicket[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('cineora_my_tickets');
      if (data) return JSON.parse(data);
    } catch (e) {}
  }
  return [];
};

export const useCinemaStore = create<CinemaStore>()(
  subscribeWithSelector((set, get) => ({
    userCity: 'chennai',
    selectedCategory: 'All',
    selectedMovie: defaultMovie,
    selectedTheatre: defaultTheatre,
    selectedShowtime: defaultShowtime,
    activeStructure: defaultTheatre.structure,
    selectedSeats: [],
    hoveredSeat: null,
    cameraPreset: 'overview',
    activeSeatView: null,
    isTrailerPlaying: true,
    isTrailerStopped: false,
    isTrailerMuted: true,
    houseLights: false,
    hdMode: true,
    activeModal: null,
    snacks: {},
    bookedTickets: getStoredTickets(),

    setCity: (city) => {
      const cityTheatres = THEATRES.filter((t) => t.city === city);
      const newTheatre = cityTheatres.length > 0 ? cityTheatres[0] : THEATRES[0];
      set({
        userCity: city,
        selectedTheatre: newTheatre,
        selectedShowtime: newTheatre.shows[0],
        activeStructure: newTheatre.structure,
      });
    },
    setCategory: (category) => set({ selectedCategory: category }),
    
    selectMovie: (movie) => {
      set({ selectedMovie: movie });
    },

    nextMovie: () => {
      const { selectedMovie } = get();
      const idx = MOVIES.findIndex((m) => m.id === selectedMovie.id);
      const nextIdx = (idx + 1) % MOVIES.length;
      set({ selectedMovie: MOVIES[nextIdx] });
    },

    prevMovie: () => {
      const { selectedMovie } = get();
      const idx = MOVIES.findIndex((m) => m.id === selectedMovie.id);
      const prevIdx = (idx - 1 + MOVIES.length) % MOVIES.length;
      set({ selectedMovie: MOVIES[prevIdx] });
    },

    openShowtimes: (movie) => {
      if (movie) set({ selectedMovie: movie });
      set({ activeModal: 'showtimes' });
    },

    selectShowtime: (theatre, show) => {
      set({
        selectedTheatre: theatre,
        selectedShowtime: show,
        activeStructure: theatre.structure,
        selectedSeats: [],
        activeSeatView: null,
        cameraPreset: 'overview',
        snacks: {},
        activeModal: 'cinema',
        isTrailerPlaying: true,
      });
    },

    openCinemaModal: () => set({ activeModal: 'cinema' }),
    openMyTickets: () => set({ activeModal: 'my-tickets' }),
    openFullscreenTrailer: (movie) => {
      if (movie) set({ selectedMovie: movie });
      set({ activeModal: 'fullscreen-trailer' });
    },
    closeModal: () => set({ activeModal: null }),

    toggleSeat: (seatId) => {
      const current = get().selectedSeats;
      if (current.includes(seatId)) {
        set({ selectedSeats: current.filter((id) => id !== seatId) });
      } else {
        if (current.length >= 8) {
          alert('Maximum 8 seats can be selected per transaction.');
          return;
        }
        set({ selectedSeats: [...current, seatId] });
      }
    },

    clearSeats: () => set({ selectedSeats: [], activeSeatView: null }),

    quickPickSeats: (count, tierId) => {
      const prefix = tierId === 'recliner' ? 'K' : tierId === 'balcony' ? 'B' : tierId === 'prime' ? 'F' : 'D';
      const newSeats: string[] = [];
      const startNum = 8;
      for (let i = 0; i < count; i++) {
        newSeats.push(`${prefix}${startNum + i}`);
      }
      set({ selectedSeats: newSeats });
    },

    setHoveredSeat: (seat) => set({ hoveredSeat: seat }),
    setCameraPreset: (preset) => set({ cameraPreset: preset, activeSeatView: null }),
    
    viewFromSeat: (seatId) => {
      set({ activeSeatView: seatId, cameraPreset: 'seat-view' });
    },

    toggleTrailer: (force) => {
      const current = get().isTrailerPlaying;
      const next = typeof force === 'boolean' ? force : !current;
      set({ isTrailerPlaying: next, isTrailerStopped: !next ? get().isTrailerStopped : false });
    },
    playTrailer: () => set({ isTrailerPlaying: true, isTrailerStopped: false }),
    pauseTrailer: () => set({ isTrailerPlaying: false }),
    stopTrailer: () => set({ isTrailerPlaying: false, isTrailerStopped: true }),
    toggleMute: () => set((state) => ({ isTrailerMuted: !state.isTrailerMuted })),
    toggleHouseLights: () => set((state) => ({ houseLights: !state.houseLights })),
    toggleHdMode: () => set((state) => ({ hdMode: !state.hdMode })),

    openSnacks: () => set({ activeModal: 'snacks' }),
    openCheckout: () => set({ activeModal: 'checkout' }),

    updateSnackQty: (id, delta) => {
      const current = { ...get().snacks };
      const currentQty = current[id] || 0;
      const nextQty = Math.max(0, currentQty + delta);
      if (nextQty === 0) {
        delete current[id];
      } else {
        current[id] = nextQty;
      }
      set({ snacks: current });
    },

    saveBookedTicket: (ticket) => {
      const current = [ticket, ...get().bookedTickets];
      set({ bookedTickets: current });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('cineora_my_tickets', JSON.stringify(current));
        } catch (e) {}
      }
    },

    resetBooking: () => {
      set({
        selectedSeats: [],
        snacks: {},
        activeSeatView: null,
        activeModal: null,
        isTrailerPlaying: false,
      });
    },
  }))
);
