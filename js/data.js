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
    },
    {
      id: 'baipan-bhaari-deva',
      title: 'BAIPAN BHAARI DEVA',
      poster: 'images/posters/baipan-bhaari-deva.jpg',
      rating: '9.2',
      votes: '92.4K',
      cert: 'U',
      genre: 'Drama · Family Comedy',
      runtime: '2h 21m',
      languages: ['Marathi', 'Hindi'],
      primaryLang: 'Marathi',
      releaseDate: 'All Time Blockbuster',
      isPreBooking: false,
      tagline: 'Six Sisters, One Unforgettable Journey',
      description: 'Six estranged sisters reunite for a traditional Mangalagaur competition, overcoming past resentments through resilience and love.',
      heroColor: '#ec4899',
      gradient: 'linear-gradient(135deg, #1f0814 0%, #701a4f 50%, #db2777 100%)',
      backdrop: 'sisterhood',
      youtubeId: 'KBpH0xpYdvc',
      trailerUrl: 'videos/baipan-bhaari-deva.mp4',
      formats: ['2D Dolby Atmos', '4K Laser'],
      cast: ['Rohini Hattangadi', 'Vandana Gupte', 'Sukanya Kulkarni', 'Shilpa Navalkar']
    },
    {
      id: 'dharmaveer-2',
      title: 'DHARMAVEER 2',
      poster: 'images/posters/dharmaveer-2.jpg',
      rating: '9.0',
      votes: '64.8K',
      cert: 'UA',
      genre: 'Biographical · Political Drama',
      runtime: '2h 38m',
      languages: ['Marathi', 'Hindi'],
      primaryLang: 'Marathi',
      releaseDate: 'Massive Hit in Theaters',
      isPreBooking: false,
      tagline: 'Sahebanchi Gosht: The Legacy of Anand Dighe',
      description: 'The gripping biographical drama chronicling the life and political fortitude of the revered mass leader Anand Dighe.',
      heroColor: '#ea580c',
      gradient: 'linear-gradient(135deg, #180900 0%, #632200 50%, #ea580c 100%)',
      backdrop: 'politics',
      youtubeId: 'WBAW8sybWp4',
      trailerUrl: 'videos/dharmaveer-2.mp4',
      formats: ['2D Dolby Atmos', 'VIP Recliner'],
      cast: ['Prasad Oak', 'Kshitish Date', 'Snehal Tarde', 'Makarand Deshpande']
    }
  ],

  theatres: [
    // Mumbai
    {
      id: 'pvr-jio-drive-mumbai',
      name: 'PVR INOX Maison, Jio World Drive, BKC',
      location: 'Bandra Kurla Complex, Mumbai',
      city: 'mumbai',
      distance: '2.1 km away',
      structure: 'grand-wood',
      structureName: 'Grand Royal Wood Auditorium (400 Seats)',
      facilities: ['400 Seats Capacity', 'Cantilevered Balcony Seating', 'Acoustic Oak Slats', 'VIP Sleeper Beds', 'Dolby Atmos 128ch'],
      shows: [
        { time: '10:30 AM', format: 'IMAX Laser 2D', priceFactor: 1.25, available: 312 },
        { time: '02:00 PM', format: 'LUXE VIP Recliner', priceFactor: 1.45, available: 164 },
        { time: '06:15 PM', format: 'Grand Wood Balcony Atmos', priceFactor: 1.35, available: 86 },
        { time: '09:45 PM', format: 'Dolby Atmos 2D', priceFactor: 1.15, available: 245 }
      ]
    },
    {
      id: 'inox-palladium-mumbai',
      name: 'INOX Insignia, Palladium High Street Phoenix',
      location: 'Lower Parel, Mumbai',
      city: 'mumbai',
      distance: '4.8 km away',
      structure: 'multiplex-dark',
      structureName: 'Urban Midnight Multiplex (320 Seats)',
      facilities: ['Laser 4K Projection', 'Plush Leather Recliners', 'Gourmet In-Seat Dining', 'Dolby Atmos'],
      shows: [
        { time: '11:15 AM', format: '4K Laser Insignia', priceFactor: 1.3, available: 220 },
        { time: '03:45 PM', format: '4DX Motion 3D', priceFactor: 1.5, available: 98 },
        { time: '07:30 PM', format: 'IMAX Laser 2D', priceFactor: 1.4, available: 45 },
        { time: '10:45 PM', format: 'Insignia Suite', priceFactor: 1.2, available: 180 }
      ]
    },
    {
      id: 'cineora-bandra-mumbai',
      name: 'CINEORA Premiere IMAX Hall, Bandra',
      location: 'Linking Road, Bandra West, Mumbai',
      city: 'mumbai',
      distance: '3.2 km away',
      structure: 'vip-lounge',
      structureName: 'Imperial Velvet VIP Lounge (180 Seats)',
      facilities: ['Private Velvet Suites', 'Motorized Daybed Risers', 'Champagne Bar Service', 'Dolby Atmos'],
      shows: [
        { time: '12:00 PM', format: 'VIP Boutique 4K', priceFactor: 1.4, available: 140 },
        { time: '04:15 PM', format: 'Dolby Cinema', priceFactor: 1.2, available: 110 },
        { time: '08:00 PM', format: 'Grand Premiere', priceFactor: 1.6, available: 32 }
      ]
    },

    // Chennai
    {
      id: 'luxe-phoenix',
      name: 'Jazz Cinemas Luxe, Phoenix Marketcity',
      location: 'Velachery, Chennai',
      city: 'chennai',
      distance: '5.1 km away',
      structure: 'grand-wood',
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
      city: 'chennai',
      distance: '2.4 km away',
      structure: 'grand-wood',
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
      city: 'chennai',
      distance: '6.8 km away',
      structure: 'vip-lounge',
      structureName: 'Grand Royal Wood Auditorium & Balcony',
      facilities: ['Private Balcony Box', 'Oak Acoustic Panels', 'Motorized Beds', 'Cocktail Tables'],
      shows: [
        { time: '11:30 AM', format: '4K Laser 2D', priceFactor: 0.95, available: 185 },
        { time: '03:00 PM', format: '4K Laser 2D', priceFactor: 0.95, available: 123 },
        { time: '07:00 PM', format: 'VIP Balcony Lounge', priceFactor: 1.3, available: 52 },
        { time: '10:15 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 160 }
      ]
    },

    // Bengaluru
    {
      id: 'pvr-vega-city-bengaluru',
      name: 'PVR Superplex, Vega City Mall',
      location: 'Bannerghatta Road, Bengaluru',
      city: 'bengaluru',
      distance: '3.6 km away',
      structure: 'grand-wood',
      structureName: 'Grand Royal Wood Auditorium (400 Seats)',
      facilities: ['400 Seats Capacity', 'IMAX Laser 3D', '4DX Sensory Hall', 'Dolby Atmos 128ch'],
      shows: [
        { time: '10:15 AM', format: 'IMAX Laser 3D', priceFactor: 1.3, available: 310 },
        { time: '01:45 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 220 },
        { time: '06:30 PM', format: 'Grand Wood Balcony', priceFactor: 1.35, available: 65 },
        { time: '10:15 PM', format: '4DX Motion 3D', priceFactor: 1.45, available: 140 }
      ]
    },
    {
      id: 'inox-forum-bengaluru',
      name: 'INOX Forum South Bengaluru',
      location: 'Konanakunte Cross, Bengaluru',
      city: 'bengaluru',
      distance: '5.2 km away',
      structure: 'multiplex-dark',
      structureName: 'Urban Midnight Multiplex (320 Seats)',
      facilities: ['Laser 4K Projection', 'Insignia Luxury Seats', 'Dolby Atmos'],
      shows: [
        { time: '11:00 AM', format: '4K Laser 2D', priceFactor: 1.1, available: 260 },
        { time: '03:15 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 195 },
        { time: '07:45 PM', format: 'Insignia Recliner', priceFactor: 1.4, available: 82 }
      ]
    },

    // Delhi-NCR
    {
      id: 'pvr-directors-cut-delhi',
      name: "PVR Director's Cut, Ambience Mall",
      location: 'Vasant Kunj, New Delhi',
      city: 'delhi',
      distance: '4.1 km away',
      structure: 'vip-lounge',
      structureName: 'Imperial Velvet VIP Lounge (180 Seats)',
      facilities: ['Boutique Balcony Suites', 'Japanese Laser 4K', 'Chef-Curated In-Seat Dining', 'Dolby Atmos'],
      shows: [
        { time: '11:30 AM', format: "Director's Cut 4K", priceFactor: 1.6, available: 130 },
        { time: '04:00 PM', format: 'Dolby Atmos VIP', priceFactor: 1.4, available: 95 },
        { time: '08:30 PM', format: 'Premiere Night Luxury', priceFactor: 1.75, available: 28 }
      ]
    },
    {
      id: 'cineora-select-citywalk-delhi',
      name: 'CINEORA Luxe, Select CITYWALK',
      location: 'Saket, New Delhi',
      city: 'delhi',
      distance: '6.3 km away',
      structure: 'grand-wood',
      structureName: 'Grand Royal Wood Auditorium (400 Seats)',
      facilities: ['400 Seats Capacity', 'IMAX Laser', 'Acoustic Oak Slats', 'VIP Sleeper Balcony'],
      shows: [
        { time: '10:00 AM', format: 'IMAX Laser 2D', priceFactor: 1.2, available: 320 },
        { time: '02:30 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 210 },
        { time: '07:15 PM', format: 'Grand Wood Balcony', priceFactor: 1.35, available: 74 }
      ]
    },

    // Hyderabad
    {
      id: 'prasads-multiplex-hyderabad',
      name: 'Prasads Multiplex Large Screen',
      location: 'Necklace Road, Hyderabad',
      city: 'hyderabad',
      distance: '3.0 km away',
      structure: 'grand-wood',
      structureName: 'Grand Royal Wood Auditorium (400 Seats)',
      facilities: ['Giant Screen Laser 4K', 'Dual Christie Projectors', 'Dolby Atmos 64ch', '400 Seats Capacity'],
      shows: [
        { time: '10:45 AM', format: 'Giant Screen Laser', priceFactor: 1.25, available: 360 },
        { time: '02:15 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 240 },
        { time: '06:45 PM', format: 'Giant Screen Laser', priceFactor: 1.3, available: 42 },
        { time: '10:30 PM', format: 'Dolby Atmos 2D', priceFactor: 1.1, available: 190 }
      ]
    },
    {
      id: 'amb-cinemas-hyderabad',
      name: 'AMB Cinemas: Mahesh Babu Superplex',
      location: 'Gachibowli, Hyderabad',
      city: 'hyderabad',
      distance: '7.5 km away',
      structure: 'multiplex-dark',
      structureName: 'Urban Midnight Multiplex (320 Seats)',
      facilities: ['Laser 4K Projection', 'M-Lounge VIP Suites', 'Dolby Atmos 128ch'],
      shows: [
        { time: '11:00 AM', format: 'Laser 4K Atmos', priceFactor: 1.15, available: 275 },
        { time: '03:30 PM', format: 'M-Lounge VIP Recliner', priceFactor: 1.5, available: 85 },
        { time: '07:15 PM', format: 'Laser 4K Atmos', priceFactor: 1.2, available: 60 }
      ]
    },

    // Pune
    {
      id: 'pvr-phoenix-pune',
      name: 'PVR Superplex, Phoenix Marketcity',
      location: 'Viman Nagar, Pune',
      city: 'pune',
      distance: '3.9 km away',
      structure: 'grand-wood',
      structureName: 'Grand Royal Wood Auditorium (400 Seats)',
      facilities: ['400 Seats Capacity', 'IMAX Laser 3D', '4DX Motion Cinema', 'VIP Sleeper Beds'],
      shows: [
        { time: '10:30 AM', format: 'IMAX Laser 3D', priceFactor: 1.25, available: 305 },
        { time: '02:00 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 230 },
        { time: '06:30 PM', format: 'Grand Wood Balcony', priceFactor: 1.35, available: 70 },
        { time: '10:00 PM', format: '4DX Motion 3D', priceFactor: 1.4, available: 110 }
      ]
    },
    {
      id: 'cinepolis-westend-pune',
      name: 'Cinépolis VIP, Westend Mall',
      location: 'Aundh, Pune',
      city: 'pune',
      distance: '5.8 km away',
      structure: 'vip-lounge',
      structureName: 'Imperial Velvet VIP Lounge (180 Seats)',
      facilities: ['VIP Recliner Service', 'RealD 3D Laser', 'Coffee House & Lounge'],
      shows: [
        { time: '11:15 AM', format: 'Cinépolis VIP 4K', priceFactor: 1.35, available: 150 },
        { time: '03:45 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 180 },
        { time: '07:30 PM', format: 'VIP Recliner Suite', priceFactor: 1.45, available: 55 }
      ]
    },

    // Kochi
    {
      id: 'pvr-lulu-kochi',
      name: 'PVR Superplex, LuLu International Mall',
      location: 'Edappally, Kochi',
      city: 'kochi',
      distance: '2.8 km away',
      structure: 'grand-wood',
      structureName: 'Grand Royal Wood Auditorium (400 Seats)',
      facilities: ['400 Seats Capacity', 'IMAX 3D Laser', '4DX Motion', 'Dolby Atmos 128ch'],
      shows: [
        { time: '10:00 AM', format: 'IMAX Laser 3D', priceFactor: 1.2, available: 310 },
        { time: '01:30 PM', format: 'Dolby Atmos 2D', priceFactor: 1.0, available: 250 },
        { time: '05:45 PM', format: 'Grand Wood Balcony', priceFactor: 1.3, available: 80 },
        { time: '09:30 PM', format: '4DX Motion 3D', priceFactor: 1.35, available: 125 }
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
