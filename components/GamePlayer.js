import React, { useState, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const GamePlayer = ({ game, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const elem = document.getElementById('game-wrapper');
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return html`
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050505] animate-in fade-in zoom-in-95 duration-200">
      <!-- Player Header -->
      <div className="flex items-center justify-between px-6 py-4 bg-[#0a0a0a] border-b border-neutral-900">
        <div className="flex items-center space-x-4">
          <button 
            onClick=${onClose}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white leading-none">${game.title}</h2>
            <p className="text-[10px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">ARCANE PROXY</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick=${toggleFullscreen}
            className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors text-xs font-bold text-neutral-300 hover:text-white"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="hidden sm:inline">FULLSCREEN</span>
          </button>
          <button 
            onClick=${onClose}
            className="p-2 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Iframe Container -->
      <div id="game-wrapper" className="flex-grow bg-black relative">
        <iframe 
          src=${game.iframeUrl} 
          className="w-full h-full border-none absolute inset-0"
          scrolling="no"
          allow="autoplay; payment; fullscreen; microphone; focus-without-user-activation *; screen-wake-lock; gamepad; clipboard-read; clipboard-write; accelerometer; gyroscope;"
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"
          title=${game.title}
          loading="eager"
        />
      </div>
    </div>
  `;
};

export default GamePlayer;