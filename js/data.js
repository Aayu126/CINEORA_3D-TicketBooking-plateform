/**
 * CINEORA - Data Store & Visual Asset Helpers
 * Comprehensive movie data, theatre showtimes, seat classifications, and snack menus.
 */

window.CINE_DATA = {
  cities: [
    { id: 'chennai', name: 'Chennai', popular: true },
    { id: 'mumbai', name: 'Mumbai', popular: true },
    { id: 'bengaluru', name: 'Bengaluru', popular: true },
    { id: 'delhi', name: 'Delhi-NCR', popular: true },
    { id: 'hyderabad', name: 'Hyderabad', popular: true },
    { id: 'kochi', name: 'Kochi', popular: false }
  ],

  categories: ['All', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi'],

  // 3 Distinct Theater Architectural Models matching the user's reference images
  hallStructures: [
    {
      id: 'grand-wood',
      name: 'Grand Royal Wood Auditorium',
      badge: '400 Seats · Balcony',
      description: 'Grand 400-seat auditorium with tiered stalls, cantilevered balcony seating, stepped risers, surround sound speakers, and VIP sleeper beds',
      icon: '🏛️',
      accentColor: '#d97706',
      defaultSeats: 400
    },
    {
      id: 'multiplex-dark',
      name: 'IMAX Laser Multiplex',
      badge: 'Modern Acoustic',
      description: 'Dark charcoal acoustic groove panels, wall-mounted surround speakers, sloped stepped seating, and neon aisle guides',
      icon: '🎬',
      accentColor: '#06b6d4',
      defaultSeats: 400
    },
    {
      id: 'vip-lounge',
      name: 'Luxe VIP Boutique & Balcony',
      badge: 'VIP Recliners',
      description: 'Plush velvet acoustic walls, private elevated VIP balcony boxes, motorized couple recliners, and warm amber sconces',
      icon: '👑',
      accentColor: '#a855f7',
      defaultSeats: 220
    }
  ],

  movies: [
    {
      id: 'varanasi',
      title: 'VARANASI',
      poster: 'images/posters/varanasi.jpg',
      rating: '9.6',
      votes: '84.2K',
      cert: 'UA',
      genre: 'Adventure · Mythology',
      runtime: '3h 05m',
      languages: ['Telugu', 'Tamil', 'Hindi', 'Kannada', 'Malayalam'],
      primaryLang: 'Telugu',
      releaseDate: 'In Theatres',
      isPreBooking: true,
      tagline: 'The Cosmic Convergence in the Eternal City',
      description: 'An ancient cosmological mystery surfaces in the sacred ghats of Varanasi, unraveling a celestial force that transcends mortal reality.',
      heroColor: '#ff9800',
      gradient: 'linear-gradient(135deg, #1f0b00 0%, #4a1f00 40%, #ff9800 100%)',
      backdrop: 'cosmic',
      youtubeId: '7V6k7k7b2tM',
      trailerUrl: 'videos/varanasi.mp4',
      formats: ['IMAX 3D', '4DX', 'Dolby Atmos 2D'],
      cast: ['Mahesh Babu', 'Deepika Padukone', 'Prithviraj Sukumaran', 'Nassar']
    },
    {
      id: 'jailer-2',
      title: 'JAILER 2',
      poster: 'images/posters/jailer-2.jpg',
      rating: '9.1',
      votes: '69.1K',
      cert: 'UA 16+',
      genre: 'Action · Thriller',
      runtime: '2h 45m',
      languages: ['Tamil', 'Telugu', 'Hindi', 'Kannada'],
      primaryLang: 'Tamil',
      releaseDate: 'Today, 29 Oct',
      isPreBooking: false,
      tagline: 'Tiger Muthuvel Pandian is Back to Reclaim Order',
      description: 'Muthuvel Pandian embarks on an international crusade to dismantle the syndicate that resurfaces from his forgotten past.',
      heroColor: '#ffd700',
      gradient: 'linear-gradient(135deg, #171505 0%, #3d2f0a 40%, #d4af37 100%)',
      backdrop: 'action',
      youtubeId: 'xenOE1Tma0A',
      trailerUrl: 'videos/jailer-2.mp4',
      formats: ['Dolby Atmos 2D', '4DX', 'IMAX 2D'],
      cast: ['Rajinikanth', 'Mohanlal', 'Shivarajkumar', 'Ramya Krishnan']
    },
    {
      id: 'toxic',
      title: 'TOXIC',
      poster: 'images/posters/toxic.jpg',
      rating: '8.8',
      votes: '89.1K',
      cert: 'A',
      genre: 'Gangster · Period',
      runtime: '2h 55m',
      languages: ['Kannada', 'Tamil', 'Telugu', 'Hindi', 'Malayalam'],
      primaryLang: 'Kannada',
      releaseDate: 'In Theatres',
      isPreBooking: false,
      tagline: 'A Fairy Tale for Grown-ups',
      description: 'Set against the ruthless narcotics underbelly of the 1960s, a lone prodigy rises through underworld dominion.',
      heroColor: '#00e5ff',
      gradient: 'linear-gradient(135deg, #021217 0%, #063440 50%, #00e5ff 100%)',
      backdrop: 'neon',
      youtubeId: 'aF08WVSvCok',
      trailerUrl: 'videos/toxic.mp4',
      formats: ['IMAX 2D', 'Dolby Atmos 2D'],
      cast: ['Yash', 'Nayanthara', 'Kiara Advani', 'Huma Qureshi']
    },
    {
      id: 'coolie',
      title: 'COOLIE',
      poster: 'images/posters/coolie.jpg',
      rating: '8.4',
      votes: '45.1K',
      cert: 'UA',
      genre: 'Action · Thriller',
      runtime: '2h 40m',
      languages: ['Tamil', 'Telugu', 'Hindi'],
      primaryLang: 'Tamil',
      releaseDate: 'Releasing Aug 14',
      isPreBooking: true,
      tagline: 'Power Has a New Code',
      description: 'Gold syndicates and harbour cartels collide when an elusive master planner orchestrates the ultimate heist.',
      heroColor: '#ff3d00',
      gradient: 'linear-gradient(135deg, #1a0800 0%, #4a1505 50%, #ff3d00 100%)',
      backdrop: 'gold',
      youtubeId: '6xqNk5Sf5jo',
      trailerUrl: 'videos/coolie.mp4',
      formats: ['Dolby Atmos 2D', 'IMAX 2D'],
      cast: ['Rajinikanth', 'Sathyaraj', 'Nagarjuna', 'Shruti Haasan']
    },
    {
      id: 'leo',
      title: 'LEO',
      poster: 'images/posters/leo.jpg',
      rating: '8.1',
      votes: '210K',
      cert: 'UA 13+',
      genre: 'Action · Crime',
      runtime: '2h 44m',
      languages: ['Tamil', 'Telugu', 'Hindi'],
      primaryLang: 'Tamil',
      releaseDate: 'Now Showing',
      isPreBooking: false,
      tagline: 'Bloody Sweet',
      description: 'A mild-mannered cafe owner in Himachal Pradesh becomes the target of a ruthless cartel claiming he is someone else.',
      heroColor: '#e040fb',
      gradient: 'linear-gradient(135deg, #1c0024 0%, #450359 50%, #e040fb 100%)',
      backdrop: 'snow',
      youtubeId: 'Po3jStA673E',
      trailerUrl: 'videos/leo.mp4',
      formats: ['Dolby Atmos 2D', 'IMAX 2D'],
      cast: ['Thalapathy Vijay', 'Sanjay Dutt', 'Trisha', 'Arjun Sarja']
    },
    {
      id: 'animal',
      title: 'ANIMAL',
      poster: 'images/posters/animal.jpg',
      rating: '7.9',
      votes: '116K',
      cert: 'A',
      genre: 'Action · Crime',
      runtime: '3h 24m',
      languages: ['Hindi', 'Tamil', 'Telugu'],
      primaryLang: 'Hindi',
      releaseDate: 'Now Showing',
      isPreBooking: false,
      tagline: 'Father Son Bond Beyond Boundaries',
      description: 'A son who harbors obsessive devotion to his father descends into unrestrained violence to avenge an assassination attempt.',
      heroColor: '#ff1744',
      gradient: 'linear-gradient(135deg, #240007 0%, #540212 50%, #ff1744 100%)',
      backdrop: 'crimson',
      youtubeId: 'Dydmpfo68DA',
      trailerUrl: 'videos/animal.mp4',
      formats: ['Dolby Atmos 2D', 'IMAX 2D'],
      cast: ['Ranbir Kapoor', 'Anil Kapoor', 'Bobby Deol', 'Rashmika Mandanna']
    },
    {
      id: 'war-2',
      title: 'WAR 2',
      poster: 'images/posters/war-2.jpg',
      rating: '7.2',
      votes: '126K',
      cert: 'UA',
      genre: 'Spy · Action',
      runtime: '2h 35m',
      languages: ['Hindi', 'Tamil', 'Telugu'],
      primaryLang: 'Hindi',
      releaseDate: 'Now Showing',
      isPreBooking: false,
      tagline: 'The Ultimate Shadow Showdown',
      description: 'Two elite intelligence operatives are pitted in a deadly cat-and-mouse game across icy fjords and treacherous rooftops.',
      heroColor: '#00e676',
      gradient: 'linear-gradient(135deg, #001f11 0%, #034527 50%, #00e676 100%)',
      backdrop: 'ice',
      youtubeId: 'tQ0mzXRk-oM',
      trailerUrl: 'videos/war-2.mp4',
      formats: ['IMAX 3D', '4DX', 'Dolby Atmos 2D'],
      cast: ['Hrithik Roshan', 'N.T. Rama Rao Jr.', 'Kiara Advani']
    },
    {
      id: 'vikram',
      title: 'VIKRAM',
      poster: 'images/posters/vikram.jpg',
      rating: '9.0',
      votes: '185K',
      cert: 'UA',
      genre: 'Action · Thriller',
      runtime: '2h 53m',
      languages: ['Tamil', 'Telugu', 'Hindi'],
      primaryLang: 'Tamil',
      releaseDate: 'Special Screenings',
      isPreBooking: false,
      tagline: 'Once Upon a Time There Lived a Ghost',
      description: 'A special investigator uncovers a clandestine squad of retired black-ops soldiers targeting a rogue syndicate.',
      heroColor: '#ffab00',
      gradient: 'linear-gradient(135deg, #1a1200 0%, #473200 50%, #ffab00 100%)',
      backdrop: 'ghost',
      youtubeId: 'OKBMCL-frPU',
      trailerUrl: 'videos/vikram.mp4',
      formats: ['Dolby Atmos 2D', 'IMAX 2D'],
      cast: ['Kamal Haasan', 'Vijay Sethupathi', 'Fahadh Faasil', 'Suriya']
    },
    {
      id: 'ramayana',
      title: 'RAMAYANA',
      poster: 'images/posters/ramayana.jpg',
      rating: '9.4',
      votes: '95K',
      cert: 'UA',
      genre: 'Epic · Mythology',
      runtime: '3h 15m',
      languages: ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'],
      primaryLang: 'Hindi',
      releaseDate: 'Releasing Diwali',
      isPreBooking: true,
      tagline: 'The Eternal Dharma Epic',
      description: 'A monumental cinematic adaptation of the timeless Indian epic rendered in breathtaking visual grandeur.',
      heroColor: '#ff6d00',
      gradient: 'linear-gradient(135deg, #1c0a00 0%, #592300 50%, #ff6d00 100%)',
      backdrop: 'mythic',
      youtubeId: 'T0Uduwg2W2w',
      trailerUrl: 'videos/ramayana.mp4',
      formats: ['IMAX 3D', 'Dolby Cinema', '4DX'],
      cast: ['Ranbir Kapoor', 'Sai Pallavi', 'Yash', 'Sunny Deol']
    }
  ],

  theatres: [
    {
      id: 'luxe-phoenix',
      name: 'Jazz Cinemas Luxe, Phoenix Marketcity',
      location: 'Velachery, Chennai',
      distance: '5.1 km away',
      structure: 'grand-wood', // The Grand 400-Seat Auditorium with Balcony & Stepped Risers
      structureName: 'Grand Royal Wood Auditorium (400 Seats)',
      facilities: ['400 Seats Capacity', 'Cantilevered Balcony Seating', 'Acoustic Panel Walls', 'VIP Sleeper Beds', 'Dolby Atmos'],
      shows: [
        { time: '11:00 AM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 312 },
        { time: '02:30 PM', format: 'LUXE VIP Recliner', priceFactor: 1.4, available: 164 },
        { time: '06:15 PM', format: 'Grand Wood Balcony Atmos', priceFactor: 1.25, available: 86 },
        { time: '09:30 PM', format: 'Dolby Atmos 2D', priceFactor: 1.1, available: 245 }
      ]
    },
    {
      id: 'pvr-palazzo',
      name: 'PVR INOX: SPI Palazzo, Nexus Vijaya Mall',
      location: 'Vadapalani, Chennai',
      distance: '2.4 km away',
      structure: 'grand-wood', // The Authentic Grand Wood Auditorium Architecture from Image 3!
      structureName: 'Grand Royal Wood Auditorium (400 Seats)',
      facilities: ['400 Seats Capacity', 'IMAX Laser', 'Acoustic Oak Slats', 'Surround Sound', 'F&B In-Seat'],
      shows: [
        { time: '10:30 AM', format: 'IMAX Laser 2D', priceFactor: 1.2, available: 298 },
        { time: '01:45 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 182 },
        { time: '04:30 PM', format: '4DX 3D', priceFactor: 1.35, available: 94 },
        { time: '06:30 PM', format: 'IMAX Laser 2D', priceFactor: 1.0, available: 48 },
        { time: '09:45 PM', format: 'IMAX Laser 2D', priceFactor: 1.25, available: 210 },
        { time: '11:15 PM', format: 'Dolby Atmos 2D', priceFactor: 0.9, available: 320 }
      ]
    },
    {
      id: 'ags-villivakkam',
      name: 'AGS Cinemas 4K Laser & Boutique VIP',
      location: 'Villivakkam, Chennai',
      distance: '6.8 km away',
      structure: 'grand-wood', // The Authentic Grand Wood Auditorium Architecture from Image 3!
      structureName: 'Grand Royal Wood Auditorium & Balcony',
      facilities: ['Private Balcony Box', 'Oak Acoustic Panels', 'Motorized Beds', 'Cocktail Tables'],
      shows: [
        { time: '11:30 AM', format: '4K Laser 2D', priceFactor: 0.95, available: 185 },
        { time: '03:00 PM', format: '4K Laser 2D', priceFactor: 0.95, available: 123 },
        { time: '07:00 PM', format: 'VIP Balcony Lounge', priceFactor: 1.3, available: 52 },
        { time: '10:15 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 160 }
      ]
    }
  ],

  // Seat classification tiers - 400 Total Seats Capacity across Stalls & Elevated Balcony
  seatTiers: [
    {
      id: 'sleeper',
      name: '👑 VIP Royal Sleeper Bed',
      badgeColor: '#ec4899',
      hexColor: 0xec4899,
      price: 750,
      description: 'Balcony top tier luxury 180° flat daybed · dual pillows & nightstand',
      rows: ['P'],
      seatsPerRow: 12,
      isSleeper: true,
      isCouple: true,
      level: 'balcony'
    },
    {
      id: 'balcony',
      name: 'Balcony VIP Mezzanine',
      badgeColor: '#a855f7',
      hexColor: 0xa855f7,
      price: 320,
      description: 'Elevated mezzanine deck · center aligned premium view',
      rows: ['K', 'L', 'M', 'N'],
      seatsPerRow: 32,
      isBalcony: true,
      level: 'balcony'
    },
    {
      id: 'recliner',
      name: 'Royal Recliner',
      badgeColor: '#f59e0b',
      hexColor: 0xf59e0b,
      price: 550,
      description: 'Motorised leather recliners · extended footrest · F&B to seat',
      rows: ['I', 'J'],
      seatsPerRow: 24,
      isCouple: true,
      level: 'stalls'
    },
    {
      id: 'prime',
      name: 'Prime Stalls',
      badgeColor: '#10b981',
      hexColor: 0x10b981,
      price: 240,
      description: 'Sweet spot for sound & picture · ergonomic plush seats',
      rows: ['D', 'E', 'F', 'G', 'H'],
      seatsPerRow: 28,
      isSweetSpot: true,
      level: 'stalls'
    },
    {
      id: 'classic',
      name: 'Classic Front Stalls',
      badgeColor: '#06b6d4',
      hexColor: 0x06b6d4,
      price: 160,
      description: 'Front rows · big screen immersive energy',
      rows: ['A', 'B', 'C'],
      seatsPerRow: 24,
      level: 'stalls'
    }
  ],

  snacks: [
    {
      id: 'popcorn-caramel',
      name: 'Crispy Caramel Popcorn',
      category: 'Popcorn',
      size: 'Large (150g)',
      price: 290,
      image: '🍿',
      badge: 'Best Seller',
      desc: 'Freshly popped warm corn with rich molten caramel glaze.'
    },
    {
      id: 'popcorn-cheese',
      name: 'Double Cheddar Popcorn',
      category: 'Popcorn',
      size: 'Large (140g)',
      price: 310,
      image: '🧀',
      badge: 'Popular',
      desc: 'Gourmet sharp cheddar cheese powder tossed onto hot crisp kernels.'
    },
    {
      id: 'nachos-salsa',
      name: 'Loaded Nachos & Warm Queso',
      category: 'Snacks',
      size: 'Sharing Tub',
      price: 240,
      image: '🌮',
      badge: 'Hot',
      desc: 'Stone-ground crispy corn tortilla chips with tangy salsa & creamy jalapeño cheese.'
    },
    {
      id: 'pepsi-fountain',
      name: 'Chilled Fountain Pepsi',
      category: 'Beverages',
      size: '540ml',
      price: 140,
      image: '🥤',
      badge: 'Chilled',
      desc: 'Ice-cold carbonated refreshing cola.'
    },
    {
      id: 'combo-duo',
      name: 'Duo Blockbuster Combo',
      category: 'Combos',
      size: '2 People',
      price: 490,
      image: '🎬',
      badge: 'Save ₹150',
      desc: '1 Large Tub Gourmet Popcorn (Salt/Caramel) + 2 Chilled Fountain Drinks.'
    },
    {
      id: 'combo-royal',
      name: 'Royal Cinema Feast',
      category: 'Combos',
      size: 'Family / 3-4 People',
      price: 640,
      image: '👑',
      badge: 'VIP Pick',
      desc: '1 Caramel Popcorn + 1 Loaded Nachos + 2 Drinks + Molten Lava Brownie.'
    }
  ]
};

/**
 * Returns real high-definition movie poster image path
 */
window.createMoviePosterSvg = function(movie) {
  if (movie && movie.poster) {
    return movie.poster;
  }
  if (movie && movie.id) {
    return `images/posters/${movie.id}.jpg`;
  }
  return 'images/posters/jailer-2.jpg';
};
