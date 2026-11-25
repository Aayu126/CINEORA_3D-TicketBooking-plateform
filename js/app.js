/**
 * CINEORA - Main Application Coordinator
 * Handles Navigation, Filtering, 3D Hero integration, Trailer Modal, and UI Events.
 */

document.addEventListener('DOMContentLoaded', () => {
  window.bookingApp = new window.BookingCoordinator();

  let heroInstance = null;
  let activeFilter = 'All';
  let activeCity = 'Mumbai';
  window.activeBookingCity = 'mumbai';

  // 1. Initialize 3D Panorama Hero
  const heroContainer = document.getElementById('hero-3d-canvas-container');
  if (heroContainer) {
    heroInstance = new window.HeroPanorama3D('hero-3d-canvas-container', {
      onSelectMovie: (movie) => {
        window.bookingApp.startBooking(movie);
      },
      onActiveChange: (movie, index, total) => {
        updateHeroFloatingCard(movie, index, total);
      }
    });
    window.heroInstance = heroInstance;

    const prevBtn = document.getElementById('hero-prev-btn');
    const nextBtn = document.getElementById('hero-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => heroInstance.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => heroInstance.next());

    const heroBookBtn = document.getElementById('hero-book-btn');
    if (heroBookBtn) {
      heroBookBtn.addEventListener('click', () => {
        const activeMovie = heroInstance.movies[heroInstance.activeIndex];
        if (activeMovie) {
          window.bookingApp.startBooking(activeMovie);
        }
      });
    }

    const heroTrailerBtn = document.getElementById('hero-trailer-btn');
    if (heroTrailerBtn) {
      heroTrailerBtn.addEventListener('click', () => {
        const activeMovie = heroInstance.movies[heroInstance.activeIndex];
        if (activeMovie) {
          openTrailerModal(activeMovie);
        }
      });
    }
  }

  // Global helper to select any movie and rotate 3D carousel to front
  window.selectAndPreviewMovie = function(movieId) {
    if (window.heroInstance) {
      window.heroInstance.selectMovieById(movieId);
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  function updateHeroFloatingCard(movie, index, total) {
    if (!movie) return;
    const titleEl = document.getElementById('hero-card-title');
    const metaEl = document.getElementById('hero-card-meta');
    const tagEl = document.getElementById('hero-card-tag');
    const counterEl = document.getElementById('hero-card-counter');
    const ctaBtn = document.getElementById('hero-book-btn');
    const posterImg = document.getElementById('hero-card-poster');

    if (posterImg) {
      posterImg.src = movie.poster || `images/posters/${movie.id}.jpg`;
      posterImg.alt = movie.title;
    }

    if (titleEl) titleEl.textContent = movie.title;
    if (metaEl) {
      metaEl.textContent = `${movie.cert} | ${movie.primaryLang} · ${movie.genre} · ${movie.runtime} · ★ ${movie.rating}`;
    }
    if (tagEl) {
      tagEl.textContent = movie.isPreBooking ? 'PRE-BOOKING OPEN' : 'NOW SHOWING';
      tagEl.className = movie.isPreBooking
        ? 'inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20'
        : 'inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20';
    }
    if (counterEl) {
      const idxStr = (index + 1).toString().padStart(2, '0');
      const totStr = total.toString().padStart(2, '0');
      counterEl.textContent = `${idxStr} / ${totStr}`;
    }
    if (ctaBtn) {
      ctaBtn.textContent = movie.isPreBooking ? 'Pre-book' : 'Book tickets →';
    }
  }

  // 2. Render Now Showing Section
  function renderNowShowingMovies(filter = 'All', searchQuery = '') {
    const grid = document.getElementById('now-showing-grid');
    if (!grid) return;

    let movies = window.CINE_DATA.movies;

    if (filter !== 'All') {
      movies = movies.filter(m => m.languages.includes(filter) || m.primaryLang === filter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      movies = movies.filter(m => 
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.languages.some(l => l.toLowerCase().includes(q))
      );
    }

    grid.innerHTML = '';

    if (movies.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400">
          <p class="text-4xl mb-3">🎬</p>
          <p class="text-lg font-bold text-white">No movies found</p>
          <p class="text-sm">Try selecting a different language or clearing your search.</p>
        </div>
      `;
      return;
    }

    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'glass-card group rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between';

      card.innerHTML = `
        <div class="relative aspect-[2/3] w-full overflow-hidden bg-slate-900 rounded-t-2xl cursor-pointer" onclick="window.selectAndPreviewMovie('${movie.id}')" title="Click to view in 3D Carousel">
          <img src="${movie.poster || window.createMoviePosterSvg(movie)}" alt="${movie.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          
          <div class="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 shadow-sm">
            ${movie.cert}
          </div>
          <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-black text-amber-400 border border-white/10 shadow-sm">
            <span>★ ${movie.rating}</span>
            <span class="text-slate-300 font-normal text-[10px]">(${movie.votes})</span>
          </div>

          <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider font-bold text-amber-300">${movie.genre}</span>
              <span class="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">🎡 View in 3D</span>
            </div>
            <h3 class="text-xl font-black text-white tracking-tight mt-0.5 line-clamp-1 font-display">${movie.title}</h3>
            <p class="text-xs text-slate-300 mt-0.5 font-medium">${movie.languages.slice(0, 3).join(' · ')}</p>
          </div>
        </div>

        <div class="p-3 bg-white border-t border-slate-100 rounded-b-2xl flex items-center gap-2">
          <button class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200/80 transition-all shadow-sm"
            onclick="event.stopPropagation(); window.openTrailerModal(window.CINE_DATA.movies.find(m => m.id === '${movie.id}'))" title="Watch Trailer">
            ▶
          </button>
          <button class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            onclick="window.bookingApp.startBooking(window.CINE_DATA.movies.find(m => m.id === '${movie.id}'))">
            <span>${movie.isPreBooking ? 'Pre-book' : 'Book tickets'}</span>
            <span>→</span>
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    // GSAP Staggered Card Entrance Animation
    if (window.gsap) {
      window.gsap.fromTo('#now-showing-grid > div',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }

  // 3. Language Filter Pills
  const filterPills = document.querySelectorAll('.lang-filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-md', 'shadow-slate-900/10');
        p.classList.add('bg-white', 'text-slate-700', 'border-slate-200/90', 'shadow-sm');
      });

      pill.classList.remove('bg-white', 'text-slate-700', 'border-slate-200/90', 'shadow-sm');
      pill.classList.add('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-md', 'shadow-slate-900/10');

      activeFilter = pill.getAttribute('data-lang');
      const searchVal = document.getElementById('navbar-search-input')?.value || '';
      renderNowShowingMovies(activeFilter, searchVal);
    });
  });

  // 4. Search Filter
  const searchInput = document.getElementById('navbar-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderNowShowingMovies(activeFilter, e.target.value);
    });
  }

  // 5. City Selector Modal
  const cityBtn = document.getElementById('city-selector-btn');
  const cityModal = document.getElementById('city-modal');
  if (cityBtn && cityModal) {
    cityBtn.addEventListener('click', () => {
      cityModal.classList.remove('hidden');
    });

    document.querySelectorAll('.city-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.getAttribute('data-city');
        activeCity = city;
        window.activeBookingCity = city;
        document.getElementById('current-city-name').textContent = city;
        document.getElementById('now-showing-city-label').textContent = city;
        cityModal.classList.add('hidden');
        if (window.bookingApp && window.bookingApp.state && window.bookingApp.state.movie) {
          window.bookingApp.startBooking(window.bookingApp.state.movie);
        }
      });
    });
  }

  // 6. Trailer Modal Player (Supports Full YouTube Official Player & Direct HD Video)
  function openTrailerModal(movie) {
    if (!movie) return;
    const trailerModal = document.getElementById('trailer-modal');
    const trailerVideo = document.getElementById('trailer-video-player');
    const trailerIframe = document.getElementById('trailer-iframe-player');
    const trailerTitle = document.getElementById('trailer-modal-title');
    if (!trailerModal) return;

    trailerTitle.textContent = `${movie.title} — Official Trailer`;

    if (movie.youtubeId && trailerIframe) {
      trailerIframe.src = `https://www.youtube-nocookie.com/embed/${movie.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
      trailerIframe.classList.remove('hidden');
      if (trailerVideo) {
        trailerVideo.classList.add('hidden');
        trailerVideo.pause();
      }
    } else if (trailerVideo) {
      if (trailerIframe) {
        trailerIframe.src = '';
        trailerIframe.classList.add('hidden');
      }
      trailerVideo.classList.remove('hidden');
      trailerVideo.src = movie.trailerUrl;
      trailerVideo.play().catch(() => {});
    }

    trailerModal.classList.remove('hidden');
  }

  window.openTrailerModal = openTrailerModal;

  const closeTrailerBtn = document.getElementById('close-trailer-btn');
  if (closeTrailerBtn) {
    closeTrailerBtn.addEventListener('click', () => {
      const trailerModal = document.getElementById('trailer-modal');
      const trailerVideo = document.getElementById('trailer-video-player');
      const trailerIframe = document.getElementById('trailer-iframe-player');
      if (trailerIframe) {
        trailerIframe.src = '';
        trailerIframe.classList.add('hidden');
      }
      if (trailerVideo) {
        trailerVideo.pause();
        trailerVideo.src = '';
      }
      if (trailerModal) trailerModal.classList.add('hidden');
    });
  }

  // 7. My Tickets Drawer
  const myTicketsBtn = document.getElementById('my-tickets-btn');
  const myTicketsDrawer = document.getElementById('my-tickets-drawer');
  const closeTicketsBtn = document.getElementById('close-my-tickets-btn');

  if (myTicketsBtn && myTicketsDrawer) {
    myTicketsBtn.addEventListener('click', () => {
      renderMyTicketsDrawer();
      myTicketsDrawer.classList.remove('hidden');
    });
  }
  if (closeTicketsBtn && myTicketsDrawer) {
    closeTicketsBtn.addEventListener('click', () => {
      myTicketsDrawer.classList.add('hidden');
    });
  }

  function renderMyTicketsDrawer() {
    const listContainer = document.getElementById('my-tickets-list');
    if (!listContainer) return;

    const tickets = window.bookingApp.tickets;
    if (tickets.length === 0) {
      listContainer.innerHTML = `
        <div class="py-16 text-center text-slate-400">
          <p class="text-4xl mb-3">🎟️</p>
          <p class="font-bold text-white text-base">No tickets booked yet</p>
          <p class="text-xs mt-1">Book your first 3D cinema experience today!</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = tickets.map(t => `
      <div class="p-4 rounded-2xl mb-4 border border-slate-700/80 bg-[#14172c] relative overflow-hidden shadow-md">
        <div class="flex items-start gap-4">
          <img src="${window.createMoviePosterSvg(t.movie)}" class="w-16 h-24 object-cover rounded-xl shadow-md border border-slate-700" />
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CONFIRMED</span>
              <span class="text-xs font-mono font-bold text-amber-400">${t.bookingId}</span>
            </div>
            <h4 class="font-black text-white text-base mt-1 font-display">${t.movie.title}</h4>
            <p class="text-xs text-slate-300 font-medium">${t.theatre.name}</p>
            <p class="text-xs text-white font-semibold mt-1">🗓️ ${t.date} · ⏰ ${t.showtime.time}</p>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-xs">
              <span class="text-slate-300">Seats: <strong class="text-emerald-400">${t.seats.join(', ')}</strong></span>
              <span class="font-extrabold text-white">₹${t.amount}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 8. 3D Hall Camera Presets & Balcony View Controls
  const presetBtns = document.querySelectorAll('.hall-preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.getAttribute('data-preset');
      if (window.bookingApp.cinemaHallInstance) {
        if (preset === 'tour') {
          window.bookingApp.cinemaHallInstance.startTour();
        } else if (preset === 'balcony_left' || preset === 'balcony_right') {
          window.bookingApp.cinemaHallInstance.setCameraPreset(preset);
        } else {
          window.bookingApp.cinemaHallInstance.setCameraPreset(preset);
        }
      }
    });
  });

  // 3D Theater Architecture Switcher (Grand Wood Balcony, IMAX Multiplex, VIP Lounge)
  const structureBtns = document.querySelectorAll('.hall-structure-btn');
  structureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      structureBtns.forEach(b => {
        b.classList.remove('active');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('active');
      btn.classList.remove('text-slate-400');
      const structId = btn.getAttribute('data-structure');
      if (window.bookingApp && window.bookingApp.cinemaHallInstance) {
        window.bookingApp.cinemaHallInstance.switchStructure(structId);

        // Update the active theater name in header to match the selected 3D structure
        const matchingTheatre = window.CINE_DATA.theatres.find(t => t.structure === structId);
        if (matchingTheatre && window.bookingApp.state) {
          window.bookingApp.state.theatre = matchingTheatre;
          const metaEl = document.getElementById('hall-meta-text');
          if (metaEl) {
            const timeStr = window.bookingApp.state.showtime ? window.bookingApp.state.showtime.time : '6:30 PM';
            const fmtStr = window.bookingApp.state.showtime ? window.bookingApp.state.showtime.format : '3D';
            const langStr = window.bookingApp.state.movie ? window.bookingApp.state.movie.primaryLang : 'Tamil';
            metaEl.textContent = `${matchingTheatre.name} · ${window.bookingApp.state.date || 'Today, 29 Oct'} · ${timeStr} · ${fmtStr} · ${langStr}`;
          }
        }
      }
    });
  });

  // Zoom In / Zoom Out / Reset Controls
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const resetViewBtn = document.getElementById('reset-view-btn');
  const autoOrbitBtn = document.getElementById('auto-orbit-360-btn');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      if (window.bookingApp.cinemaHallInstance) {
        window.bookingApp.cinemaHallInstance.zoomIn();
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      if (window.bookingApp.cinemaHallInstance) {
        window.bookingApp.cinemaHallInstance.zoomOut();
      }
    });
  }

  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', () => {
      if (window.bookingApp.cinemaHallInstance) {
        window.bookingApp.cinemaHallInstance.resetView();
        presetBtns.forEach(b => b.classList.remove('active'));
        const overviewBtn = document.querySelector('.hall-preset-btn[data-preset="overview"]');
        if (overviewBtn) overviewBtn.classList.add('active');
      }
    });
  }

  if (autoOrbitBtn) {
    autoOrbitBtn.addEventListener('click', () => {
      if (window.bookingApp.cinemaHallInstance) {
        const isAuto = window.bookingApp.cinemaHallInstance.toggleAutoRotate360();
        autoOrbitBtn.classList.toggle('active-state', isAuto);
      }
    });
  }

  // Balcony Neon / Lighting Toggle Button
  const balconyNeonBtn = document.getElementById('balcony-neon-btn');
  if (balconyNeonBtn) {
    balconyNeonBtn.addEventListener('click', () => {
      if (window.bookingApp.cinemaHallInstance) {
        const isOn = window.bookingApp.cinemaHallInstance.toggleBalconyNeon();
        balconyNeonBtn.classList.toggle('text-purple-400', isOn);
        balconyNeonBtn.classList.toggle('text-slate-400', !isOn);
      }
    });
  }

  // House Lights Toggle
  const houseLightsBtn = document.getElementById('house-lights-toggle-btn');
  if (houseLightsBtn) {
    houseLightsBtn.addEventListener('click', () => {
      if (window.bookingApp.cinemaHallInstance) {
        const isOn = window.bookingApp.cinemaHallInstance.toggleHouseLights();
        houseLightsBtn.classList.toggle('bg-amber-400', isOn);
        houseLightsBtn.classList.toggle('text-black', isOn);
        houseLightsBtn.classList.toggle('bg-white/10', !isOn);
        houseLightsBtn.classList.toggle('text-white', !isOn);
      }
    });
  }

  // Interactive Theater Screen Trailer Controller Buttons
  const screenTrailerPlay = document.getElementById('screen-trailer-play-btn');
  const screenTrailerPause = document.getElementById('screen-trailer-pause-btn');
  const screenTrailerStop = document.getElementById('screen-trailer-stop-btn');
  const screenTrailerAudio = document.getElementById('screen-trailer-audio-btn');

  if (screenTrailerPlay) {
    screenTrailerPlay.addEventListener('click', () => {
      if (window.bookingApp && window.bookingApp.cinemaHallInstance) {
        window.bookingApp.cinemaHallInstance.playTheaterTrailer();
      }
    });
  }

  if (screenTrailerPause) {
    screenTrailerPause.addEventListener('click', () => {
      if (window.bookingApp && window.bookingApp.cinemaHallInstance) {
        window.bookingApp.cinemaHallInstance.pauseTheaterTrailer();
      }
    });
  }

  if (screenTrailerStop) {
    screenTrailerStop.addEventListener('click', () => {
      if (window.bookingApp && window.bookingApp.cinemaHallInstance) {
        window.bookingApp.cinemaHallInstance.stopTheaterTrailer();
      }
    });
  }

  if (screenTrailerAudio) {
    screenTrailerAudio.addEventListener('click', () => {
      if (window.bookingApp && window.bookingApp.cinemaHallInstance) {
        window.bookingApp.cinemaHallInstance.toggleTheaterAudio();
      }
    });
  }

  // Quick Pick Button ("✦ Best 2 seats")
  const bestSeatsBtn = document.getElementById('best-seats-quick-btn');
  if (bestSeatsBtn) {
    bestSeatsBtn.addEventListener('click', () => {
      const qtyEl = document.getElementById('quick-pick-qty-input');
      const qty = qtyEl ? parseInt(qtyEl.textContent) || 2 : 2;
      window.bookingApp.quickPickBestSeats(qty);
    });
  }

  // Quick Pick Stepper Buttons
  const qtyMinus = document.getElementById('qty-minus-btn');
  const qtyPlus = document.getElementById('qty-plus-btn');
  const qtyVal = document.getElementById('quick-pick-qty-input');
  if (qtyMinus && qtyPlus && qtyVal) {
    qtyMinus.addEventListener('click', () => {
      let q = parseInt(qtyVal.textContent) || 2;
      if (q > 1) {
        qtyVal.textContent = q - 1;
        bestSeatsBtn.textContent = `✦ Best ${q - 1} seats`;
      }
    });
    qtyPlus.addEventListener('click', () => {
      let q = parseInt(qtyVal.textContent) || 2;
      if (q < 8) {
        qtyVal.textContent = q + 1;
        bestSeatsBtn.textContent = `✦ Best ${q + 1} seats`;
      }
    });
  }

  renderNowShowingMovies();

  // Escape key listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModals = ['showtime-modal', 'cinema-hall-overlay', 'snacks-modal', 'checkout-modal', 'ticket-modal', 'city-modal', 'trailer-modal', 'my-tickets-drawer'];
      openModals.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.classList.contains('hidden')) {
          el.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
      const video = document.getElementById('trailer-video-player');
      if (video) video.pause();
    }
  });
});
