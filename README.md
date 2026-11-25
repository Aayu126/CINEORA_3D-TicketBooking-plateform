# CINEORA - Next-Gen 3D Cinema Experience & Ticket Booking Platform

An ultra-realistic 3D cinema booking platform built with the modern cutting-edge frontend ecosystem:

- **Next.js 14 (App Router)** - Server & Client architecture, optimized routing, and static generation.
- **React 18** - Component hierarchy and state synchronization.
- **TypeScript** - 100% strict type safety for movies, auditoriums, seats, and booking models.
- **Three.js & React Three Fiber (@react-three/fiber, @react-three/drei)** - Real-time 3D WebGL rendering.
- **GSAP 3 (@gsap/react)** - Smooth camera transitions, carousel inertia, and 3D positioning.
- **Motion (Framer Motion)** - Fluid UI modal animations and card transitions.
- **Lenis** - Smooth kinetic momentum scrolling.
- **Tailwind CSS** - Modern dark-mode cinema aesthetic with obsidian `#030307` and amber `#f59e0b`.
- **Zustand** - High-performance reactive state management with `subscribeWithSelector`.
- **Vercel** - Production build verified with zero compilation errors, ready for 1-click Vercel deployment.

---

## Key Features

1. **360° Hero 3D Cylindrical Panorama Carousel**:
   - Interactive rotating cylinder featuring all 9 authentic movie posters.
   - Smooth mouse/touch drag interaction with GSAP damping and auto-centering.

2. **3 Distinct Architectural Auditoriums**:
   - **Grand Royal Wood Auditorium**: 400 seats with cantilevered balcony, warm oak acoustic ribs, stepped risers, and VIP daybeds.
   - **IMAX Laser Multiplex**: 400 seats with dark acoustic grooves, surround speakers, and sloped seating.
   - **Luxe VIP Boutique & Balcony**: 220 seats with velvet acoustic walls and couple recliners.

3. **Curved 2.39:1 Cinemascope Screen with Live Video Streaming**:
   - Real-time video frame rendering onto curved 3D cinema mesh.
   - Streams authentic, official HD movie trailers matching the selected movie (**Jailer 2**, **Leo**, **Animal**, **Coolie**, **Toxic**, **War 2**, **Vikram**, **Varanasi**, and **Ramayana**).
   - Dynamic real-time auditorium light spill synchronized with trailer frames.

4. **Interactive 3D Seating & Booking Suite**:
   - Raycaster-based interactive seat picking across 4 tiers (Royal Recliner, Balcony, Prime Sweet Spot, Classic Riser).
   - Live hover tooltips, multi-seat selection, quick-pick shortcuts, and instant pricing calculations.
   - Gourmet cinema F&B ordering (Popcorn, Loaded Nachos, Pepsi, VIP Combos).
   - Golden digital e-ticket pass with QR code generation.

---

## Getting Started

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
Deploy directly to Vercel via the Vercel CLI or by linking your Git repository:
```bash
npx vercel
```
