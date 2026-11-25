export type StructureId = 'grand-wood' | 'multiplex-dark' | 'vip-lounge';

export interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: string;
  votes: string;
  cert: string;
  genre: string;
  runtime: string;
  languages: string[];
  primaryLang: string;
  releaseDate: string;
  isPreBooking: boolean;
  tagline: string;
  description: string;
  heroColor: string;
  gradient: string;
  backdrop: string;
  youtubeId: string;
  trailerUrl: string;
  formats: string[];
  cast: string[];
}

export interface HallStructure {
  id: StructureId;
  name: string;
  badge: string;
  description: string;
  icon: string;
  accentColor: string;
  defaultSeats: number;
}

export interface ShowSlot {
  time: string;
  format: string;
  priceFactor: number;
  available: number;
}

export interface Theatre {
  id: string;
  name: string;
  city: string;
  location: string;
  distance: string;
  structure: StructureId;
  structureName: string;
  facilities: string[];
  shows: ShowSlot[];
}

export interface SeatTier {
  id: string;
  name: string;
  basePrice: number;
  color: number;
  hexColor: string;
  desc: string;
  isCouple?: boolean;
}

export interface SeatInfo {
  id: string;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  isBooked: boolean;
  position: [number, number, number];
  rotationY?: number;
}

export interface SnackItem {
  id: string;
  name: string;
  category: string;
  price: number;
  calories: string;
  description: string;
  badge?: string;
  icon: string;
  image: string;
}

export interface BookedTicket {
  id: string;
  movieTitle: string;
  poster: string;
  theatreName: string;
  theatreLocation: string;
  showtime: string;
  format: string;
  seats: string[];
  totalAmount: number;
  bookedAt: string;
}

export interface City {
  id: string;
  name: string;
  popular: boolean;
}

export type CameraPreset = 
  | 'overview' 
  | 'sleeper' 
  | 'balcony' 
  | 'balcony_left' 
  | 'balcony_right' 
  | 'stage' 
  | 'bird' 
  | 'tour' 
  | 'orbit' 
  | 'seat-view';

export type ModalType = 'showtimes' | 'cinema' | 'snacks' | 'checkout' | 'my-tickets' | 'fullscreen-trailer' | null;

