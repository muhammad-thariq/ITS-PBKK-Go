'use client';
import './globals.css';
import { Instrument_Sans } from 'next/font/google';
import Script from 'next/script';
import Navigation from '@/components/Navigation';

const instrumentSans = Instrument_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  const initParticles = () => {
    // @ts-ignore
    if (window.particlesJS) {
      // @ts-ignore
      window.particlesJS("particles-js", {
        "particles":{
          "number":{"value":20,"density":{"enable":true,"value_area":800}},
          "color":{"value":"#ffffff"},
          "shape":{"type":"circle","stroke":{"width":0,"color":"#000000"},
            "polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},
          "opacity":{"value":0.5,"random":false,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},
          "size":{"value":3,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},
          "line_linked":{"enable":true,"distance":150,"color":"#ffffff","opacity":0.75,"width":1},
          "move":{"enable":true,"speed":3,"direction":"none","random":false,"straight":false,"out_mode":"out","bounce":false,
            "attract":{"enable":false,"rotateX":600,"rotateY":1200}}
        },
        "interactivity":{
          "detect_on": "window", // Keeps the mouse connection working everywhere
          "events":{"onhover":{"enable":true,"mode":"grab"},"onclick":{"enable":true,"mode":"push"},"resize":true},
          "modes":{
            "grab":{"distance":400,"line_linked":{"opacity":1}},
            "bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},
            "repulse":{"distance":200,"duration":0.4},
            "push":{"particles_nb":4},
            "remove":{"particles_nb":2}
          }
        },
        "retina_detect":true
      });
    }
  };

  return (
    <html lang="en" className="h-full">
      <body className={`${instrumentSans.className} font-sans antialiased bg-black min-h-full text-white`}>
        
        {/* PARTICLES: Z-0 (Background) 
            It sits behind everything. No pointer-events-none needed because it is behind.
        */}
        <div id="particles-js" className="fixed top-0 left-0 w-full h-full z-0"></div>
        
        <Script src="/js/particles.min.js" onLoad={initParticles} />
        <Script src="/js/stats.min.js" />

        {/* NAVIGATION: Z-50 (Very Top) */}
        <Navigation />

        {/* WAVE: Z-0 (Background with particles) */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 38" className="absolute top-[64px] left-0 w-full z-0 pointer-events-none">
          <path d="M0 34L60 38L120 1L180 23L240 30L300 12L360 24L420 12L480 19L540 37L600 10L660 21L720 23L780 1L840 24L900 3L960 19L1020 5L1080 15L1080 0L1020 0L960 0L900 0L840 0L780 0L720 0L660 0L600 0L540 0L480 0L420 0L360 0L300 0L240 0L180 0L120 0L60 0L0 0Z" fill="#ffffff" strokeLinecap="square" strokeLinejoin="bevel"/>
        </svg>

        <div className="sm:py-0 py-12"></div>
        
        {/* MAIN CONTENT: Z-10 (Foreground) 
            This ensures buttons sit ON TOP of particles and are fully clickable.
        */}
        <main className="relative z-10 text-black pt-12">
            {children}
        </main>

      </body>
    </html>
  );
}