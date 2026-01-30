
import React, { useState, useMemo, useEffect } from 'react';
import { Game, Category } from './types';
import GameCard from './components/GameCard';
import GamePlayer from './components/GamePlayer';

const CATEGORIES: Category[] = ['All', 'Action', 'Puzzle', 'Sports', 'Arcade', 'Adventure', 'Strategy'];

const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Load games from JSON file
  useEffect(() => {
    fetch('./data/games.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load games data');
        return response.json();
      })
      .then(data => {
        setGames(data as Game[]);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching games:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchQuery, selectedCategory]);

  const hotGames = useMemo(() => {
    return games.filter(g => g.isHot).slice(0, 4);
  }, [games]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-purple-400 font-arcane text-xl animate-pulse">Summoning Arcane...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'glass py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center glow-purple">
              <span className="font-arcane text-2xl">A</span>
            </div>
            <h1 className="font-arcane text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
              ARCANE
            </h1>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search magical realms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-full py-2.5 px-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <button className="hidden sm:block px-5 py-2 glass rounded-full text-sm font-semibold hover:bg-purple-600 transition-all duration-300">
              Join Discord
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-32">
        {/* Mobile Search */}
        <div className="md:hidden mb-8">
          <input 
            type="text" 
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-6 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Hero Section / Hot Games */}
        {selectedCategory === 'All' && !searchQuery && hotGames.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center text-white">
                <span className="text-orange-500 mr-2">🔥</span>
                Hot Right Now
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotGames.map(game => (
                <GameCard key={`hot-${game.id}`} game={game} onClick={setActiveGame} />
              ))}
            </div>
          </section>
        )}

        {/* Filter Bar */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-6 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-purple-600 text-white glow-purple shadow-purple-500/20 shadow-lg' 
                  : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery ? `Search results for "${searchQuery}"` : `${selectedCategory} Games`}
            </h2>
            <span className="text-slate-500 text-sm font-medium">
              {filteredGames.length} titles found
            </span>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredGames.map(game => (
                <GameCard key={game.id} game={game} onClick={setActiveGame} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <svg className="text-slate-600" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">No spells found here</h3>
              <p className="text-slate-500 max-w-xs">We couldn't find any games matching your current filter or search query.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 glass border-t-0">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <span className="font-arcane text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
              ARCANE
            </span>
            <span className="text-slate-600 text-sm">© 2024 Arcane Entertainment</span>
          </div>
          <div className="flex space-x-8 text-slate-400 text-sm">
            <a href="#" className="hover:text-purple-400 transition-colors">Discord</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Games</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Game Modal */}
      {activeGame && (
        <GamePlayer 
          game={activeGame} 
          onClose={() => setActiveGame(null)} 
        />
      )}
    </div>
  );
};

export default App;
