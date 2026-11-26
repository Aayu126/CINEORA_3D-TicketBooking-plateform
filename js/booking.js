/**
 * CINEORA - Booking State Machine & Transaction Coordinator
 * Orchestrates: Showtime Selection -> 3D Cinema Seat Picker -> Snacks -> Checkout -> Instant QR Ticket
 */

class BookingCoordinator {
  constructor() {
    this.state = {
      movie: null,
      theatre: null,
      date: 'Today, 29 Oct',
      showtime: null,
      selectedSeats: [],
      snacks: {},
      couponCode: null,
      discount: 0,
      baseConvenienceFeePerTicket: 28,
      gstRate: 0.18
    };

    this.tickets = this.loadTicketsFromStorage();
    this.cinemaHallInstance = null;
    this.init();
  }

  init() {
    this.updateTicketBadge();
  }

  loadTicketsFromStorage() {
    try {
      const data = localStorage.getItem('cineora_booked_tickets');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveTicketsToStorage() {
    try {
      localStorage.setItem('cineora_booked_tickets', JSON.stringify(this.tickets));
      this.updateTicketBadge();
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }

  updateTicketBadge() {
    const badge = document.getElementById('my-tickets-count-badge');
    if (badge) {
      badge.textContent = this.tickets.length;
      badge.style.display = this.tickets.length > 0 ? 'inline-flex' : 'none';
    }
  }

  startBooking(movie) {
    this.state.movie = movie;
    const currentCity = (window.activeBookingCity || 'mumbai').toLowerCase();
    const cityTheatres = window.CINE_DATA.theatres.filter(t => t.city === currentCity || (t.location && t.location.toLowerCase().includes(currentCity)));
    const activeTheatres = cityTheatres.length > 0 ? cityTheatres : window.CINE_DATA.theatres;

    this.state.theatre = activeTheatres[0];
    this.state.showtime = this.state.theatre.shows[0] || this.state.theatre.shows[3];
    this.state.selectedSeats = [];
    this.state.snacks = {};
    this.state.discount = 0;

    this.renderShowtimeModal();
  }

  renderShowtimeModal() {
    const modal = document.getElementById('showtime-modal');
    if (!modal) return;

    const movie = this.state.movie;
    document.getElementById('showtime-movie-title').textContent = movie.title;
    document.getElementById('showtime-movie-meta').textContent = `${movie.cert} · ${movie.genre} · ${movie.runtime} · ${movie.languages.join(', ')}`;
    
    const posterEl = document.getElementById('showtime-movie-poster');
    if (posterEl) {
      posterEl.dataset.triedPublic = '';
      posterEl.src = movie.poster || `images/posters/${movie.id}.jpg`;
      posterEl.onerror = () => {
        if (!posterEl.dataset.triedPublic) {
          posterEl.dataset.triedPublic = '1';
          posterEl.src = `public/${movie.poster || `images/posters/${movie.id}.jpg`}`;
        } else {
          posterEl.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%2314182e"/><text x="100" y="140" fill="%23f59e0b" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">${encodeURIComponent(movie.title)}</text><text x="100" y="165" fill="%23ffffff" font-family="sans-serif" font-weight="700" font-size="12" text-anchor="middle">CINEORA 4K</text></svg>`;
        }
      };
    }

    const container = document.getElementById('theatres-list-container');
    container.innerHTML = '';
    container.style.background = '#0c0f22';

    const currentCity = (window.activeBookingCity || 'mumbai').toLowerCase();
    const cityTheatres = window.CINE_DATA.theatres.filter(t => t.city === currentCity || (t.location && t.location.toLowerCase().includes(currentCity)));
    const activeTheatres = cityTheatres.length > 0 ? cityTheatres : window.CINE_DATA.theatres;

    activeTheatres.forEach(theatre => {
      const card = document.createElement('div');
      card.className = 'theatre-item-card p-5 rounded-2xl mb-4 shadow-md';
      card.style.cssText = 'background: #151930 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.14) !important; border-radius: 18px !important; margin-bottom: 16px; padding: 20px;';

      const showPills = theatre.shows.map(show => {
        const isSelected = this.state.theatre.id === theatre.id && this.state.showtime.time === show.time;
        return `
        <button class="showtime-pill px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          isSelected
            ? 'active shadow-lg shadow-amber-500/30'
            : ''
        }" style="${
          isSelected
            ? 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; color: #020617 !important; border: 1px solid #f59e0b !important;'
            : 'background: #21253e !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.16) !important;'
        }" onclick="window.bookingApp.selectShowtime('${theatre.id}', '${show.time}')">
          <div class="font-extrabold text-sm" style="color: ${isSelected ? '#020617' : '#ffffff'} !important;">${show.time}</div>
          <div class="text-[10px] font-bold" style="color: ${isSelected ? '#1e1b00' : '#fcd34d'} !important;">${show.format}</div>
        </button>
      `;
      }).join('');

      card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="font-black text-white text-lg font-display tracking-tight" style="color: #ffffff !important;">${theatre.name}</h4>
            <p class="text-xs flex items-center gap-1.5 mt-1 font-medium" style="color: #cbd5e1 !important;">
              <span class="text-rose-400">📍</span> <span class="font-semibold" style="color: #e2e8f0 !important;">${theatre.location}</span> · <span class="font-black text-amber-400" style="color: #f59e0b !important;">${theatre.distance} away</span>
            </p>
          </div>
          <div class="flex gap-1.5 flex-wrap justify-end">
            ${theatre.facilities.map(f => `<span class="showtime-facility-tag text-[10px] px-2.5 py-1 rounded-md font-semibold" style="background: #212643 !important; color: #cbd5e1 !important; border: 1px solid rgba(255, 255, 255, 0.12) !important;">${f}</span>`).join('')}
          </div>
        </div>
        <div class="flex gap-2.5 flex-wrap mt-3">
          ${showPills}
        </div>
      `;

      container.appendChild(card);
    });

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  selectShowtime(theatreId, showTime) {
    const theatre = window.CINE_DATA.theatres.find(t => t.id === theatreId);
    if (!theatre) return;
    const show = theatre.shows.find(s => s.time === showTime);
    if (!show) return;

    this.state.theatre = theatre;
    this.state.showtime = show;

    this.closeModal('showtime-modal');
    this.open3DCinemaHall();
  }

  open3DCinemaHall() {
    const hallOverlay = document.getElementById('cinema-hall-overlay');
    if (!hallOverlay) return;

    document.getElementById('hall-movie-title').textContent = this.state.movie.title;
    document.getElementById('hall-meta-text').textContent = 
      `${this.state.theatre.name} · ${this.state.date} · ${this.state.showtime.time} · ${this.state.showtime.format} · ${this.state.movie.primaryLang}`;
    document.getElementById('hall-cert-badge').textContent = this.state.movie.cert;

    hallOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Pause hero background carousel rotation so movie never auto-advances in theater
    if (window.heroInstance && typeof window.heroInstance.pauseAutoRotate === 'function') {
      window.heroInstance.pauseAutoRotate();
    }

    const activeStructure = (this.state.theatre && this.state.theatre.structure) || 'grand-wood';
    
    // Update active state in UI structure switcher buttons
    const structBtns = document.querySelectorAll('.hall-structure-btn');
    structBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-structure') === activeStructure;
      btn.classList.toggle('active', isMatch);
      btn.classList.toggle('text-slate-400', !isMatch);
    });

    const container = document.getElementById('cinema-canvas-container');
    if (this.cinemaHallInstance && typeof this.cinemaHallInstance.destroy === 'function') {
      this.cinemaHallInstance.destroy();
      this.cinemaHallInstance = null;
    }
    const oldCanvas = container.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    this.cinemaHallInstance = new window.CinemaHall3D('cinema-canvas-container', {
      structure: activeStructure,
      movie: this.state.movie,
      showtime: this.state.showtime,
      onSeatToggle: (selectedSeats) => this.handleSeatSelectionChanged(selectedSeats),
      onSeatHover: (hoveredSeat) => this.handleSeatHovered(hoveredSeat)
    });

    // Ensure camera aspect ratio and renderer size match after modal is displayed
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 60);

    this.renderSeatTiersList();
    this.updateSelectedSeatsSummary();
  }

  renderSeatTiersList() {
    const listEl = document.getElementById('seat-tiers-sidebar-list');
    if (!listEl) return;

    listEl.innerHTML = window.CINE_DATA.seatTiers.map(tier => {
      let leftCount = 0;
      if (window.cinema3D && window.cinema3D.seatData) {
        window.cinema3D.seatData.forEach(s => {
          if (s.tier && s.tier.id === tier.id && !s.isBooked) {
            leftCount++;
          }
        });
      }
      const leftDisplay = leftCount > 0 ? `${leftCount} left` : 'Available';

      return `
      <div class="seat-tier-card">
        <div class="flex items-center gap-3">
          <div class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color: ${tier.badgeColor}; box-shadow: 0 0 10px ${tier.badgeColor}80"></div>
          <div>
            <div class="text-sm font-bold text-white flex items-center gap-2">
              ${tier.name}
              ${tier.isSleeper ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/25 text-pink-300 font-bold border border-pink-500/30">180° Bed</span>' : ''}
              ${tier.isBalcony ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-300 font-bold border border-purple-500/30">Mezzanine</span>' : ''}
              ${tier.isCouple ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Couple</span>' : ''}
              ${tier.isSweetSpot ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Best View</span>' : ''}
            </div>
            <div class="text-[11px] text-slate-300 font-medium">${tier.description}</div>
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-base font-extrabold text-white">₹${tier.price}</div>
          <div class="text-[11px] text-emerald-400 font-medium">${leftDisplay}</div>
        </div>
      </div>
    `}).join('');
  }

  handleSeatSelectionChanged(selectedSeats) {
    this.state.selectedSeats = selectedSeats;
    this.updateSelectedSeatsSummary();
  }

  handleSeatHovered(seat) {
    const hintEl = document.getElementById('cinema-hover-hint');
    if (hintEl) {
      if (seat) {
        hintEl.innerHTML = `<span class="text-amber-400 font-bold">${seat.id}</span> · ${seat.tier.name} · <span class="text-white font-bold">₹${seat.price}</span>`;
      } else {
        hintEl.innerHTML = `Drag to rotate 360° · Scroll or use + / - to zoom`;
      }
    }
  }

  updateSelectedSeatsSummary() {
    const count = this.state.selectedSeats.length;
    const countEl = document.getElementById('sidebar-seats-count');
    const totalEl = document.getElementById('sidebar-total-amount');
    const tagsContainer = document.getElementById('sidebar-selected-seats-tags');
    const continueBtn = document.getElementById('sidebar-continue-btn');
    const viewSeatBtn = document.getElementById('view-selected-seat-btn');

    const totalTicketsPrice = this.state.selectedSeats.reduce((acc, s) => acc + s.price, 0);

    if (countEl) countEl.textContent = `${count} ticket${count === 1 ? '' : 's'}`;
    if (totalEl) totalEl.textContent = `₹${totalTicketsPrice}`;

    if (tagsContainer) {
      if (count === 0) {
        tagsContainer.innerHTML = `<p class="text-xs text-slate-400 italic">No seats selected. Click any seat in 3D or use "Best seats".</p>`;
        if (viewSeatBtn) viewSeatBtn.classList.add('hidden');
      } else {
        tagsContainer.innerHTML = this.state.selectedSeats.map(s => `
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <span>${s.id}</span>
            <span class="text-[10px] opacity-75">₹${s.price}</span>
            <button class="hover:text-white ml-1" onclick="window.bookingApp.cinemaHallInstance.toggleSeat('${s.id}')">✕</button>
          </div>
        `).join('');

        if (viewSeatBtn) {
          viewSeatBtn.classList.remove('hidden');
          viewSeatBtn.textContent = `👁️ View Screen from Seat ${this.state.selectedSeats[0].id}`;
          viewSeatBtn.onclick = () => {
            this.cinemaHallInstance.viewFromSeat(this.state.selectedSeats[0].id);
          };
        }
      }
    }

    if (continueBtn) {
      continueBtn.disabled = count === 0;
      continueBtn.classList.toggle('opacity-50', count === 0);
      continueBtn.classList.toggle('cursor-not-allowed', count === 0);
    }
  }

  quickPickBestSeats(quantity = 2) {
    if (this.cinemaHallInstance) {
      this.cinemaHallInstance.findBestSeats(quantity, 'prime');
    }
  }

  proceedToSnacks() {
    if (this.state.selectedSeats.length === 0) return;
    this.closeModal('cinema-hall-overlay');
    this.openSnacksModal();
  }

  openSnacksModal() {
    const modal = document.getElementById('snacks-modal');
    if (!modal) return;

    this.renderSnacksList();
    this.updateSnacksSummary();

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  renderSnacksList(activeCategory = 'All') {
    const container = document.getElementById('snacks-grid-container');
    if (!container) return;

    const items = window.CINE_DATA.snacks.filter(s => activeCategory === 'All' || s.category === activeCategory);

    container.innerHTML = items.map(snack => {
      const qty = this.state.snacks[snack.id] || 0;
      return `
        <div class="p-4 rounded-2xl border border-slate-700/80 bg-[#16192c] hover:bg-[#1c2037] hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-md">
          <div>
            <div class="text-4xl mb-3 text-center py-4 bg-[#20253f] rounded-xl border border-slate-700/60">${snack.image}</div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider font-black text-amber-400">${snack.size}</span>
              ${snack.badge ? `<span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">${snack.badge}</span>` : ''}
            </div>
            <h4 class="font-bold text-white text-base mt-1 font-display">${snack.name}</h4>
            <p class="text-xs text-slate-300 mt-1 line-clamp-2 font-medium">${snack.desc}</p>
          </div>

          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/80">
            <span class="font-black text-white text-base">₹${snack.price}</span>
            <div class="flex items-center gap-2 bg-[#22263e] rounded-xl px-2 py-1 border border-slate-700">
              <button class="w-6 h-6 rounded-lg bg-[#2e3454] text-white font-bold flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors"
                onclick="window.bookingApp.changeSnackQty('${snack.id}', -1)">-</button>
              <span class="text-sm font-bold w-5 text-center text-white" id="snack-qty-${snack.id}">${qty}</span>
              <button class="w-6 h-6 rounded-lg bg-[#2e3454] text-white font-bold flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors"
                onclick="window.bookingApp.changeSnackQty('${snack.id}', 1)">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  changeSnackQty(snackId, delta) {
    const current = this.state.snacks[snackId] || 0;
    const next = Math.max(0, current + delta);
    if (next === 0) {
      delete this.state.snacks[snackId];
    } else {
      this.state.snacks[snackId] = next;
    }

    const qtyEl = document.getElementById(`snack-qty-${snackId}`);
    if (qtyEl) qtyEl.textContent = next;
    this.updateSnacksSummary();
  }

  updateSnacksSummary() {
    let snacksTotal = 0;
    let snacksCount = 0;

    Object.entries(this.state.snacks).forEach(([id, qty]) => {
      const item = window.CINE_DATA.snacks.find(s => s.id === id);
      if (item) {
        snacksTotal += item.price * qty;
        snacksCount += qty;
      }
    });

    const snacksTotalEl = document.getElementById('snacks-total-price');
    if (snacksTotalEl) snacksTotalEl.textContent = `₹${snacksTotal}`;

    const itemsCountEl = document.getElementById('snacks-items-count');
    if (itemsCountEl) itemsCountEl.textContent = `${snacksCount} item${snacksCount === 1 ? '' : 's'}`;
  }

  proceedToCheckout() {
    this.closeModal('snacks-modal');
    this.openCheckoutModal();
  }

  openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const movie = this.state.movie;
    const seats = this.state.selectedSeats;
    const ticketsSubtotal = seats.reduce((acc, s) => acc + s.price, 0);

    let snacksSubtotal = 0;
    Object.entries(this.state.snacks).forEach(([id, qty]) => {
      const item = window.CINE_DATA.snacks.find(s => s.id === id);
      if (item && qty > 0) {
        snacksSubtotal += item.price * qty;
      }
    });

    const convenienceFee = (seats.length * this.state.baseConvenienceFeePerTicket);
    const gst = Math.round((convenienceFee + snacksSubtotal * 0.05) * this.state.gstRate);
    const grandTotal = Math.max(0, ticketsSubtotal + snacksSubtotal + convenienceFee + gst - this.state.discount);

    const checkoutPoster = document.getElementById('checkout-movie-poster');
    if (checkoutPoster) {
      checkoutPoster.src = movie.poster || `images/posters/${movie.id}.jpg`;
      checkoutPoster.onerror = () => { checkoutPoster.src = 'images/posters/jailer-2.jpg'; };
    }
    document.getElementById('checkout-movie-title').textContent = movie.title;
    document.getElementById('checkout-theatre-name').textContent = this.state.theatre.name;
    document.getElementById('checkout-show-meta').textContent = `${this.state.date} · ${this.state.showtime.time} · ${this.state.showtime.format}`;
    document.getElementById('checkout-seats-list').textContent = seats.map(s => s.id).join(', ');

    document.getElementById('checkout-tickets-subtotal').textContent = `₹${ticketsSubtotal}`;
    document.getElementById('checkout-snacks-subtotal').textContent = `₹${snacksSubtotal}`;
    document.getElementById('checkout-fees-subtotal').textContent = `₹${convenienceFee + gst}`;
    document.getElementById('checkout-discount-amount').textContent = `-₹${this.state.discount}`;
    document.getElementById('checkout-grand-total').textContent = `₹${grandTotal}`;
    document.getElementById('pay-button-amount').textContent = `Pay ₹${grandTotal}`;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  applyCoupon(code) {
    if (code.toUpperCase() === 'CINE3D') {
      this.state.discount = 100;
      this.showToast('🎉 Promo code CINE3D applied! You saved ₹100.');
      this.openCheckoutModal();
    } else {
      this.showToast('❌ Invalid coupon. Try using code "CINE3D"');
    }
  }

  processPayment(method = 'upi') {
    const payBtn = document.getElementById('pay-action-btn');
    if (payBtn) {
      payBtn.disabled = true;
      payBtn.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-3 inline text-black" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Securing Bank Authorization...
      `;
    }

    setTimeout(() => {
      this.issueConfirmedTicket();
    }, 1800);
  }

  issueConfirmedTicket() {
    const bookingId = 'CRA-' + Math.floor(100000 + Math.random() * 900000);
    const seats = this.state.selectedSeats;
    const ticketsSubtotal = seats.reduce((acc, s) => acc + s.price, 0);

    let snacksSubtotal = 0;
    Object.entries(this.state.snacks).forEach(([id, qty]) => {
      const item = window.CINE_DATA.snacks.find(s => s.id === id);
      if (item) snacksSubtotal += item.price * qty;
    });

    const fee = seats.length * this.state.baseConvenienceFeePerTicket;
    const finalAmount = Math.max(0, ticketsSubtotal + snacksSubtotal + fee - this.state.discount);

    const ticketObj = {
      bookingId: bookingId,
      movie: this.state.movie,
      theatre: this.state.theatre,
      date: this.state.date,
      showtime: this.state.showtime,
      seats: seats.map(s => s.id),
      screen: 'Audi 03 (CINEORA 4K Laser)',
      amount: finalAmount,
      bookedAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      qrData: `CINEORA:${bookingId}:${this.state.movie.id}:${seats.map(s => s.id).join(',')}`
    };

    this.tickets.unshift(ticketObj);
    this.saveTicketsToStorage();

    this.closeModal('checkout-modal');
    this.showTicketModal(ticketObj);

    this.triggerConfetti();
  }

  showTicketModal(ticket) {
    const modal = document.getElementById('ticket-modal');
    if (!modal) return;

    document.getElementById('ticket-booking-id').textContent = ticket.bookingId;
    document.getElementById('ticket-movie-title').textContent = ticket.movie.title;
    document.getElementById('ticket-theatre').textContent = ticket.theatre.name;
    document.getElementById('ticket-date-time').textContent = `${ticket.date} · ${ticket.showtime.time}`;
    document.getElementById('ticket-seats').textContent = ticket.seats.join(', ');
    document.getElementById('ticket-screen').textContent = ticket.screen;
    document.getElementById('ticket-amount').textContent = `₹${ticket.amount}`;
    const ticketPoster = document.getElementById('ticket-poster');
    if (ticketPoster) {
      ticketPoster.src = ticket.movie.poster || `images/posters/${ticket.movie.id}.jpg`;
      ticketPoster.onerror = () => { ticketPoster.src = 'images/posters/jailer-2.jpg'; };
    }

    this.drawCanvasQrCode(ticket.qrData);

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  drawCanvasQrCode(qrData) {
    const canvas = document.getElementById('ticket-qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 160;
    canvas.height = 160;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 160, 160);

    ctx.fillStyle = '#06060c';
    this.drawQrMarker(ctx, 10, 10, 36);
    this.drawQrMarker(ctx, 114, 10, 36);
    this.drawQrMarker(ctx, 10, 114, 36);

    let hash = 0;
    for (let i = 0; i < qrData.length; i++) hash = (hash * 31 + qrData.charCodeAt(i)) & 0xffffffff;

    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 14; c++) {
        if ((r < 5 && c < 5) || (r < 5 && c > 8) || (r > 8 && c < 5)) continue;
        const bit = ((hash >> ((r * 14 + c) % 31)) & 1);
        if (bit === 1 || (r * c) % 3 === 0) {
          ctx.fillRect(16 + c * 9, 16 + r * 9, 7, 7);
        }
      }
    }
  }

  drawQrMarker(ctx, x, y, size) {
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
    ctx.fillStyle = '#06060c';
    ctx.fillRect(x + 12, y + 12, size - 24, size - 24);
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 130,
        spread: 75,
        origin: { y: 0.6 }
      });
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl bg-amber-500 text-black font-extrabold shadow-2xl z-50 text-sm animate-bounce';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      if (window.gsap) {
        const contentBox = modal.querySelector('div');
        if (contentBox) {
          window.gsap.to(contentBox, {
            scale: 0.96,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
              modal.classList.add('hidden');
              document.body.style.overflow = '';
            }
          });
        } else {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      } else {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }

      if (modalId === 'cinema-hall-overlay' && this.cinemaHallInstance) {
        if (typeof this.cinemaHallInstance.destroy === 'function') {
          this.cinemaHallInstance.destroy();
        } else {
          this.cinemaHallInstance.stopTheaterTrailer();
        }
        this.cinemaHallInstance = null;
        if (window.heroInstance && typeof window.heroInstance.startAutoRotate === 'function') {
          window.heroInstance.startAutoRotate();
        }
      }
    }
  }
}

window.BookingCoordinator = BookingCoordinator;
