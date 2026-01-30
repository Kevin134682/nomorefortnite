
import React from 'react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <div 
      onClick={() => onClick(game)}
      className="group relative flex flex-col glass rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.thumbnail} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {game.isHot && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-red-600 to-orange-500 text-[10px] font-bold uppercase rounded-md tracking-wider shadow-lg">
            Hot
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-1">
          {game.category}
        </span>
        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
          {game.title}
        </h3>
        <p className="text-slate-400 text-xs line-clamp-2 mt-2 leading-relaxed">
          {game.description}
        </p>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
    </div>
  );
};

export default GameCard;
