import React, { useState, useMemo, useEffect, useRef } from 'react';
import htm from 'htm';
import GameCard from './components/GameCard.js';
import GamePlayer from './components/GamePlayer.js';

const html = htm.bind(React.createElement);

const CATEGORIES = ['All', 'Action', 'Puzzle', 'Sports', 'Arcade', 'Adventure', 'Strategy'];
const LOGO_URL = 'https://i.ibb.co/cPqZF2V/Arcanelogo.png';

const __uv$config = {
    prefix: '/uv/service/',
    encodeUrl: (url) => {
        if (!url) return url;
        return encodeURIComponent(url.split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''));
    }
};

const QUICK_LINKS = [
  { name: 'Google', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
  { name: 'Discord', url: 'https://discord.com', icon: 'https://discord.com/favicon.ico' },
  { name: 'Twitch', url: 'https://www.twitch.tv', icon: 'https://static.twitchcdn.net/assets/favicon-32-d602162b40e5170669ee.png' },
  { name: 'Spotify', url: 'https://www.spotify.com', icon: 'https://www.scdn.co/mirror/static/images/favicon.ico' },
  { name: 'Geforce Now', url: 'https://play.geforcenow.com', icon: 'https://play.geforcenow.com/favicon.ico' },
];

const App = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeGame, setActiveGame] = useState(null);
  const [currentTab, setCurrentTab] = useState('home'); 
  const [cloakType, setCloakType] = useState('none'); 
  
  const [proxyInput, setProxyInput] = useState('');
  const [activeProxyUrl, setActiveProxyUrl] = useState(null);
  const proxyIframeRef = useRef(null);

  const [latency, setLatency] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [startTime] = useState(Date.now());
  const [status, setStatus] = useState('Checking...');

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    const t0 = performance.now();
    
    // List of paths to try to find the games.json file
    const pathsToTry = [
      './data/games.json',
      'data/games.json',
      '/data/games.json'
    ];
    
    let lastError = null;
    let foundData = false;

    for (const path of pathsToTry) {
      try {
        console.log(`Arcane: Attempting to summon archives from ${path}`);
        // Removed the query parameter (?v=...) as some static servers block them for json files
        const response = await fetch(path);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const t1 = performance.now();
            setLatency(Math.round(t1 - t0));
            setGames(data);
            setStatus('Operational');
            foundData = true;
            console.log(`Arcane: Successfully summoned archives from ${path}`);
            break; // Stop trying paths once we find it
          } else {
            throw new Error('Mismatched data format (Not an array)');
          }
        } else {
          lastError = `HTTP ${response.status} at ${path}`;
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`Arcane: Failed to summon from ${path}: ${err.message}`);
      }
    }

    if (!foundData) {
      console.error('Arcane Summoning Error: All paths exhausted.');
      setError(lastError || 'Could not locate the Arcane archives.');
      setStatus('Offline');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const favicon = document.getElementById('favicon');
    if (!favicon) return;
    
    if (cloakType === 'drive') {
      document.title = 'My Drive - Google Drive';
      favicon.href = 'https://ssl.gstatic.com/docs/doclist/images/infinite_drive_2023q4.ico';
    } else if (cloakType === 'classroom') {
      document.title = 'Classes';
      favicon.href = 'https://ssl.gstatic.com/classroom/favicon.png';
    } else {
      document.title = 'Arcane';
      favicon.href = LOGO_URL;
    }
  }, [cloakType]);

  const handleProxySubmit = (url) => {
    const target = url || proxyInput;
    if (!target) return;
    
    let formattedUrl = target;
    if (!target.includes('.') && !target.startsWith('http')) {
        formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
    } else if (!target.startsWith('http')) {
        formattedUrl = `https://${target}`;
    }
    
    const proxied = __uv$config.prefix + __uv$config.encodeUrl(formattedUrl);
    setActiveProxyUrl(proxied);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + 'h ' : ''}${mins > 0 ? mins + 'm ' : ''}${secs}s`;
  };

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchQuery, selectedCategory]);

  const featuredGame = useMemo(() => games.find(g => g.id === 'galaxy-clicker') || games[0], [games]);
  
  const trendingGames = useMemo(() => {
    const hot = games.filter(g => g.isHot);
    const others = games.filter(g => !g.isHot);
    return [...hot, ...others].slice(0, 12);
  }, [games]);

  if (loading) {
    return html`
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] border border-purple-500/10 rounded-full animate-rune-spin opacity-20"></div>
        <div className="absolute w-[500px] h-[500px] border border-fuchsia-500/10 rounded-full animate-rune-spin-reverse opacity-20"></div>
        <div className="absolute w-[400px] h-[400px] border-dashed border-2 border-purple-600/5 rounded-full animate-rune-spin opacity-30"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-48 h-48 flex items-center justify-center animate-magic-pulse">
             <img src=${LOGO_URL} alt="Arcane" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]" />
          </div>
          
          <div className="mt-12 text-center">
            <h1 className="text-4xl font-black text-white tracking-[0.2em] mb-2 drop-shadow-lg uppercase tracking-widest">ARCANE</h1>
            <p className="text-purple-400/60 text-[10px] font-bold tracking-[0.4em] uppercase">Unlocking Mystical Realms</p>
          </div>

          <div className="mt-8 w-64 h-1 bg-neutral-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <div className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-600 shadow-[0_0_15px_rgba(167,139,250,0.6)] rounded-full animate-[casting-fill_2s_ease-in-out_forwards]"></div>
          </div>
        </div>
      </div>
    `;
  }

  if (error && games.length === 0) {
    return html`
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10 text-center">
         <div className="w-24 h-24 mb-8 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800 shadow-2xl">
            <svg className="w-12 h-12 text-red-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
         </div>
         <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Summoning Failed</h2>
         <p className="text-neutral-500 text-sm max-w-md mb-8">
           The Arcane archives could not be reached (Error: ${error}). 
           The archives folder might be misplaced or restricted.
         </p>
         <button 
           onClick=${fetchGames}
           className="px-10 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-900/40"
         >
           Try Again
         </button>
      </div>
    `;
  }

  return html`
    <div className="flex min-h-screen bg-[#050505] text-gray-200">
      
      <aside className="w-20 md:w-64 fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-neutral-900 flex flex-col z-50">
        <div className="p-6 mb-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick=${() => setCurrentTab('home')}>
            <div className="w-10 h-10 flex items-center justify-center">
              <img src=${LOGO_URL} className="w-full h-full object-contain" alt="A" />
            </div>
            <span className="hidden md:block font-black text-2xl tracking-tight text-white uppercase">ARCANE</span>
          </div>
        </div>

        <nav className="flex-grow">
          <button 
            onClick=${() => { setCurrentTab('home'); setActiveProxyUrl(null); }}
            className=${`w-full flex items-center p-4 md:px-6 transition-all ${currentTab === 'home' && !activeProxyUrl ? 'sidebar-item-active' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="hidden md:block ml-4 font-medium text-xs uppercase tracking-widest">Home</span>
          </button>

          <button 
            onClick=${() => { setCurrentTab('games'); setActiveProxyUrl(null); }}
            className=${`w-full flex items-center p-4 md:px-6 transition-all ${currentTab === 'games' && !activeProxyUrl ? 'sidebar-item-active' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span className="hidden md:block ml-4 font-medium text-xs uppercase tracking-widest">Games</span>
          </button>

          <button 
            onClick=${() => { setCurrentTab('proxy'); }}
            className=${`w-full flex items-center p-4 md:px-6 transition-all ${currentTab === 'proxy' || activeProxyUrl ? 'sidebar-item-active' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            <span className="hidden md:block ml-4 font-medium text-xs uppercase tracking-widest">Proxy</span>
          </button>

          <button 
            onClick=${() => { setCurrentTab('rip'); setActiveProxyUrl(null); }}
            className=${`w-full flex items-center p-4 md:px-6 transition-all ${currentTab === 'rip' ? 'sidebar-item-active' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="hidden md:block ml-4 font-medium text-xs uppercase tracking-widest">RIP</span>
          </button>
          
          <button 
            onClick=${() => { setCurrentTab('settings'); setActiveProxyUrl(null); }}
            className=${`w-full flex items-center p-4 md:px-6 transition-all ${currentTab === 'settings' ? 'sidebar-item-active' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="hidden md:block ml-4 font-medium text-xs uppercase tracking-widest">Settings</span>
          </button>
        </nav>
      </aside>

      <main className=${`flex-grow ml-20 md:ml-64 ${activeProxyUrl ? 'h-screen flex flex-col' : 'p-6 md:p-10 max-w-[1600px] mx-auto'}`}>
        
        ${!activeProxyUrl && html`
          <header className="flex items-center justify-between mb-10">
            <div className="relative flex-grow max-w-xl">
              <input 
                type="text" 
                placeholder="Search magical archives..."
                value=${searchQuery}
                onInput=${(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== 'games' && currentTab !== 'home') setCurrentTab('games');
                }}
                className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-2.5 px-12 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm text-white shadow-inner"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-white">Guest User</div>
                <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Active session</div>
              </div>
              <div className="w-10 h-10 flex items-center justify-center relative bg-neutral-900 rounded-full border border-neutral-800 p-1">
                <img src=${LOGO_URL} className="w-full h-full object-contain" alt="Arcane" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#050505] rounded-full"></div>
              </div>
            </div>
          </header>
        `}

        ${activeProxyUrl ? html`
           <div className="flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex items-center bg-[#0a0a0a] p-3 border-b border-neutral-900 space-x-3">
                 <button onClick=${() => setActiveProxyUrl(null)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                 </button>
                 <div className="flex-grow bg-neutral-900 border border-neutral-800 rounded-full px-4 py-1.5 text-xs text-neutral-500 truncate font-mono">
                    ${activeProxyUrl}
                 </div>
                 <div className="flex items-center space-x-2">
                    <button onClick=${() => { if(proxyIframeRef.current) proxyIframeRef.current.contentWindow.history.back(); }} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                       <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick=${() => { if(proxyIframeRef.current) proxyIframeRef.current.src = proxyIframeRef.current.src; }} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                       <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <button onClick=${() => { if(proxyIframeRef.current) proxyIframeRef.current.contentWindow.history.forward(); }} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                       <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                 </div>
              </div>
              <iframe 
                ref=${proxyIframeRef}
                src=${activeProxyUrl}
                className="flex-grow w-full bg-white"
                style=${{ border: 'none' }}
              />
           </div>
        ` : currentTab === 'home' ? html`
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            ${games.length > 0 ? html`
              <section className="relative h-80 rounded-[32px] overflow-hidden group cursor-pointer border border-neutral-800 shadow-2xl" onClick=${() => setActiveGame(featuredGame)}>
                <img 
                  src=${featuredGame?.thumbnail} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-10 left-10 max-w-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-3 py-1 bg-purple-600 text-[10px] font-black uppercase rounded-full text-white tracking-widest">TOP RATED</span>
                    <span className="text-neutral-300 text-[10px] font-bold tracking-widest uppercase">Verified Source</span>
                  </div>
                  <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">${featuredGame?.title}</h2>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">${featuredGame?.description}</p>
                  <button className="px-10 py-3.5 bg-white text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                    Play Now
                  </button>
                </div>
              </section>
            ` : html`
              <div className="h-80 rounded-[32px] bg-neutral-900/50 border border-dashed border-neutral-800 flex items-center justify-center">
                 <div className="text-center">
                    <div className="text-purple-500 mb-2 font-black uppercase tracking-widest text-xs">Archives offline</div>
                    <div className="text-neutral-500 text-sm">Waiting for mystical connection...</div>
                 </div>
              </div>
            `}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-[#0a0a0a] border border-neutral-900 p-6 rounded-3xl hover:border-neutral-800 transition-colors">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">CATALOG</div>
                <div className="text-2xl font-black text-white">${games.length} titles</div>
              </div>
              <div className="bg-[#0a0a0a] border border-neutral-900 p-6 rounded-3xl hover:border-neutral-800 transition-colors">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">STATUS</div>
                <div className=${`text-2xl font-black ${status === 'Operational' ? 'text-green-500' : 'text-orange-500'}`}>
                  ${status}
                </div>
              </div>
              <div className="bg-[#0a0a0a] border border-neutral-900 p-6 rounded-3xl hover:border-neutral-800 transition-colors">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">LATENCY</div>
                <div className="text-2xl font-black text-white">${latency}ms</div>
              </div>
              <div className="bg-[#0a0a0a] border border-neutral-900 p-6 rounded-3xl hover:border-neutral-800 transition-colors">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">SESSION</div>
                <div className="text-2xl font-black text-purple-500">${formatTime(sessionTime)}</div>
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase text-[12px] opacity-40">Handpicked Selection</h3>
                <button onClick=${() => setCurrentTab('games')} className="text-[10px] font-black tracking-widest text-purple-400 hover:text-purple-300 transition-colors uppercase">View All</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                ${trendingGames.map(game => html`<${GameCard} key=${`trending-${game.id}`} game=${game} onClick=${setActiveGame} />`)}
              </div>
            </section>
          </div>
        ` : currentTab === 'games' ? html`
          <div className="flex items-center space-x-3 overflow-x-auto pb-6 mb-8 scrollbar-hide">
            ${CATEGORIES.map(cat => html`
              <button
                key=${cat}
                onClick=${() => setSelectedCategory(cat)}
                className=${`whitespace-nowrap px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                  selectedCategory === cat 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-900/30' 
                    : 'bg-[#0a0a0a] border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white'
                }`}
              >
                ${cat}
              </button>
            `)}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8 animate-in fade-in duration-500">
            ${filteredGames.map(game => html`<${GameCard} key=${game.id} game=${game} onClick=${setActiveGame} />`)}
          </div>
        ` : currentTab === 'proxy' ? html`
          <div className="max-w-4xl mx-auto flex flex-col items-center py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-16">
               <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">Celestial Web</h2>
               <p className="text-neutral-500 text-sm font-medium tracking-widest uppercase opacity-60">Traverse the digital void through our mystical veil</p>
            </div>

            <div className="w-full relative max-w-2xl group">
               <div className="absolute inset-0 bg-purple-600/20 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000"></div>
               <div className="relative flex items-center bg-[#0a0a0a] border-2 border-neutral-800 rounded-[32px] p-2 pr-4 shadow-2xl focus-within:border-purple-600/50 transition-all duration-300">
                  <div className="pl-6 text-neutral-600">
                     <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter URL or search the unknown..."
                    value=${proxyInput}
                    onInput=${(e) => setProxyInput(e.target.value)}
                    onKeyDown=${(e) => e.key === 'Enter' && handleProxySubmit()}
                    className="flex-grow bg-transparent border-none py-6 px-4 text-white text-lg focus:outline-none placeholder:text-neutral-700 font-medium"
                  />
                  <button 
                    onClick=${() => handleProxySubmit()}
                    className="bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-neutral-200 transition-colors tracking-tighter"
                  >
                    GO
                  </button>
               </div>
            </div>

            <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 w-full px-4">
               ${QUICK_LINKS.map(link => html`
                 <button 
                   key=${link.name}
                   onClick=${() => handleProxySubmit(link.url)}
                   className="flex flex-col items-center p-6 bg-[#0a0a0a] border border-neutral-900 rounded-[24px] hover:border-purple-600/30 hover:bg-neutral-800/40 transition-all group"
                 >
                    <div className="w-12 h-12 bg-neutral-900 rounded-2xl mb-4 flex items-center justify-center p-3 border border-neutral-800 group-hover:scale-110 transition-transform">
                       <img src=${link.icon} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">${link.name}</span>
                 </button>
               `)}
            </div>
          </div>
        ` : currentTab === 'rip' ? html`
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center animate-in fade-in duration-1000">
             <div className="relative mb-12">
                <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full"></div>
                <svg className="relative w-32 h-32 text-neutral-800 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
             </div>
             <h2 className="text-6xl font-black text-white mb-6 tracking-tighter uppercase drop-shadow-2xl">Rest in Peace Arcade 4.0</h2>
             <div className="w-24 h-1 bg-neutral-900 mx-auto mb-8 rounded-full"></div>
             <p className="text-neutral-500 text-sm font-medium tracking-[0.4em] uppercase opacity-40 font-bold">A legendary era of unblocked gaming.</p>
          </div>
        ` : html`
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">Preferences</h2>
            <p className="text-neutral-500 text-sm font-medium mb-12 uppercase tracking-widest text-[10px]">Fine-tune your Arcane experience.</p>
            
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 mb-8">
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">Stealth Mode</h3>
              <p className="text-xs text-neutral-500 mb-8 font-medium">Instantly mask your presence from prying eyes.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick=${() => setCloakType('none')}
                  className=${`flex flex-col items-center p-6 rounded-2xl border transition-all ${cloakType === 'none' ? 'border-purple-600 bg-purple-600/5 shadow-xl' : 'border-neutral-900 bg-neutral-900/20'}`}
                >
                  <div className="w-10 h-10 bg-neutral-900 rounded-lg mb-4 flex items-center justify-center border border-neutral-800">
                    <img src=${LOGO_URL} className="w-6 h-6 opacity-40" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Standard</span>
                </button>
                <button 
                  onClick=${() => setCloakType('drive')}
                  className=${`flex flex-col items-center p-6 rounded-2xl border transition-all ${cloakType === 'drive' ? 'border-purple-600 bg-purple-600/5 shadow-xl' : 'border-neutral-900 bg-neutral-900/20'}`}
                >
                  <div className="w-10 h-10 bg-neutral-900 rounded-lg mb-4 flex items-center justify-center border border-neutral-800">
                    <img src="https://ssl.gstatic.com/docs/doclist/images/infinite_drive_2023q4.ico" className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Drive</span>
                </button>
                <button 
                  onClick=${() => setCloakType('classroom')}
                  className=${`flex flex-col items-center p-6 rounded-2xl border transition-all ${cloakType === 'classroom' ? 'border-purple-600 bg-purple-600/5 shadow-xl' : 'border-neutral-900 bg-neutral-900/20'}`}
                >
                  <div className="w-10 h-10 bg-neutral-900 rounded-lg mb-4 flex items-center justify-center border border-neutral-800">
                    <img src="https://ssl.gstatic.com/classroom/favicon.png" className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Classroom</span>
                </button>
              </div>
            </div>
          </div>
        `}
      </main>

      ${activeGame && html`
        <${GamePlayer} 
          game=${activeGame} 
          onClose=${() => setActiveGame(null)} 
        />
      `}
    </div>
  `;
};

export default App;