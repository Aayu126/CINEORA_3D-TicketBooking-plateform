import type { Metadata } from 'next';
import './globals.css';
import SmoothScroll from '@/components/common/SmoothScroll';

export const metadata: Metadata = {
  title: 'CINEORA — Next-Gen 3D Cinema Experience & Ticket Booking',
  description: 'Immersive 3D interactive movie ticket booking with real-time auditorium screens, live trailer streaming, and 3 distinct theatre architectures.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#f8fafc] text-slate-900 min-h-screen selection:bg-amber-500 selection:text-slate-950">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
