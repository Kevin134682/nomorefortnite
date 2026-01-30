import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const GameCard = ({ game, onClick }) => {
  return html`
    <div 
      onClick=${() => onClick(game)}
      className="group bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-900">
        <img 
          src=${game.thumbnail} 
          alt=${game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        ${game.isHot && html`
          <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-red-600 to-orange-500 text-[9px] font-black uppercase rounded-md text-white z-10 shadow-lg tracking-wider">
            Hot
          </div>
        `}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
      </div>
      
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate mb-1">
            ${game.title}
          </h3>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
            ${game.category}
          </p>
        </div>
        
        <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="text-[10px] text-purple-400 font-bold">PLAY NOW</span>
           <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
        </div>
      </div>
    </div>
  `;
};

export default GameCard;