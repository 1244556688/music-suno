
import React, { useState, useRef, useEffect } from 'react';
import { Track, PlayerState } from './types';
import Visualizer from './components/Visualizer';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80';

const SAMPLE_TRACKS: Track[] = [
  { id: '1', title: '示例：未來之光', artist: 'Sonic Artist', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: DEFAULT_COVER, duration: 0 },
];

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<Track[]>(SAMPLE_TRACKS);
  const [playerState, setPlayerState] = useState<PlayerState>({ 
    isPlaying: false, 
    currentTrackIndex: 0, 
    progress: 0, 
    volume: 0.8 
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentTrack = playlist[playerState.currentTrackIndex] || SAMPLE_TRACKS[0];

  useEffect(() => {
    if (!audioRef.current) return;
    const updateProgress = () => {
      setPlayerState(prev => ({
        ...prev,
        progress: (audioRef.current!.currentTime / audioRef.current!.duration) * 100 || 0
      }));
    };
    audioRef.current.addEventListener('timeupdate', updateProgress);
    return () => audioRef.current?.removeEventListener('timeupdate', updateProgress);
  }, [playerState.currentTrackIndex]);

  const initAudio = () => {
    if (audioContextRef.current) return;
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = context.createMediaElementSource(audioRef.current!);
    const newAnalyser = context.createAnalyser();
    newAnalyser.fftSize = 256;
    source.connect(newAnalyser);
    newAnalyser.connect(context.destination);
    audioContextRef.current = context;
    setAnalyser(newAnalyser);
  };

  const togglePlay = () => {
    initAudio();
    if (playerState.isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setPlayerState(p => ({ ...p, isPlaying: !p.isPlaying }));
  };

  // Fixed: Added explicit type 'File' to resolve 'unknown' type error on file properties
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks = Array.from(files).map((file: File, i) => ({
      id: `local-${Date.now()}-${i}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: '本地音訊',
      url: URL.createObjectURL(file),
      cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80',
      duration: 0
    }));
    setPlaylist(prev => [...newTracks, ...prev]);
  };

  const exportHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${currentTrack.title} - Sonic Player</title>
    <style>
        body { background: #020617; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(20px); padding: 40px; border-radius: 40px; text-align: center; border: 1px solid rgba(255,255,255,0.1); width: 320px; }
        .cover { width: 240px; height: 240px; border-radius: 30px; object-fit: cover; margin-bottom: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        h1 { margin: 10px 0 5px; font-size: 24px; }
        p { color: #94a3b8; font-size: 14px; margin-bottom: 30px; }
        audio { width: 100%; filter: invert(1); opacity: 0.5; }
    </style>
</head>
<body>
    <div class="card">
        <img src="${currentTrack.cover}" class="cover">
        <h1>${currentTrack.title}</h1>
        <p>${currentTrack.artist}</p>
        <audio controls src="${currentTrack.url}"></audio>
    </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sonic-player-export.html';
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 動態背景光暈 */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full"></div>

      <header className="z-10 px-10 py-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40">
            <i className="fas fa-bolt-lightning text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter neon-text">SONIC AURA PRO</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Engine Active</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={exportHtml}
            className="glass hover:bg-white/10 text-slate-300 px-6 py-3 rounded-2xl text-xs font-bold transition-all border border-white/5 flex items-center gap-3"
          >
            <i className="fas fa-file-export text-purple-400"></i> 導出 HTML
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-slate-950 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-cyan-500/20 flex items-center gap-3"
          >
            <i className="fas fa-plus"></i> 上傳音樂
          </button>
        </div>
        {/* Fixed: Renamed handler from handleFileUpload to handleUpload to match definition */}
        <input type="file" ref={fileInputRef} onChange={handleUpload} accept="audio/*" multiple className="hidden" />
      </header>

      <main className="z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 px-10 pb-12 max-w-7xl mx-auto w-full h-full items-center">
        {/* 播放器核心 */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative group w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="glass rounded-[3rem] p-10 flex flex-col items-center shadow-3xl border-white/10 relative overflow-hidden">
              
              <div className={`w-72 h-72 rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl border-4 border-slate-900 transition-all duration-700 ${playerState.isPlaying ? 'scale-105 rotate-2' : ''}`}>
                <img src={currentTrack.cover} className="w-full h-full object-cover" alt="Cover" />
              </div>

              <div className="text-center w-full mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight mb-2 truncate">{currentTrack.title}</h2>
                <p className="text-cyan-400 font-bold text-xs tracking-[0.3em] uppercase opacity-70">{currentTrack.artist}</p>
              </div>

              <Visualizer analyser={analyser} isPlaying={playerState.isPlaying} />

              <div className="w-full space-y-8 mt-4">
                <div className="space-y-3">
                  <div className="relative h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-300" 
                      style={{ width: `${playerState.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-500 tracking-tighter">
                    <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
                    <span>{audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4">
                  <button className="text-slate-500 hover:text-white transition-colors"><i className="fas fa-random"></i></button>
                  <div className="flex items-center gap-10">
                    <button onClick={() => setPlayerState(p => ({...p, currentTrackIndex: (p.currentTrackIndex - 1 + playlist.length) % playlist.length, isPlaying: false}))} className="text-2xl text-slate-300 hover:text-white transition-all"><i className="fas fa-backward-step"></i></button>
                    <button 
                      onClick={togglePlay}
                      className="w-20 h-20 bg-white text-slate-950 rounded-full flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all"
                    >
                      <i className={`fas ${playerState.isPlaying ? 'fa-pause' : 'fa-play'} ${!playerState.isPlaying && 'ml-1'}`}></i>
                    </button>
                    <button onClick={() => setPlayerState(p => ({...p, currentTrackIndex: (p.currentTrackIndex + 1) % playlist.length, isPlaying: false}))} className="text-2xl text-slate-300 hover:text-white transition-all"><i className="fas fa-forward-step"></i></button>
                  </div>
                  <button className="text-slate-500 hover:text-white transition-colors"><i className="fas fa-repeat"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 側邊列表 */}
        <div className="lg:col-span-5 h-[600px] flex flex-col gap-6">
          <div className="glass rounded-[2.5rem] p-8 flex-1 flex flex-col overflow-hidden border-white/5">
            <h3 className="text-xs font-black tracking-[0.4em] text-slate-500 uppercase mb-8 flex items-center gap-3">
              <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
              播放隊列
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {playlist.map((track, idx) => (
                <div 
                  key={track.id}
                  onClick={() => setPlayerState(p => ({ ...p, currentTrackIndex: idx, isPlaying: false }))}
                  className={`group p-4 rounded-3xl cursor-pointer transition-all flex items-center gap-4 ${playerState.currentTrackIndex === idx ? 'bg-white/10 border-white/10 border' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden relative shadow-lg">
                    <img src={track.cover} className="w-full h-full object-cover" alt="" />
                    {playerState.currentTrackIndex === idx && playerState.isPlaying && (
                      <div className="absolute inset-0 bg-cyan-500/40 flex items-center justify-center">
                        <div className="flex gap-1 items-end h-4">
                          <div className="w-1 bg-white animate-[bounce_0.6s_infinite]"></div>
                          <div className="w-1 bg-white animate-[bounce_1s_infinite]"></div>
                          <div className="w-1 bg-white animate-[bounce_0.8s_infinite]"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm truncate ${playerState.currentTrackIndex === idx ? 'text-cyan-400' : 'text-slate-200'}`}>{track.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1">{track.artist}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">
                    <i className="fas fa-ellipsis-v"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 border-white/5 flex items-center gap-6 bg-gradient-to-br from-indigo-500/10 to-transparent">
             <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
               <i className="fas fa-info-circle"></i>
             </div>
             <div className="flex-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">提示</p>
               <p className="text-[11px] text-slate-500 leading-relaxed">您可以拖放多個音樂檔案到畫面上傳，或使用「導出 HTML」保存播放器。</p>
             </div>
          </div>
        </div>
      </main>

      <audio ref={audioRef} src={currentTrack.url} onEnded={() => setPlayerState(p => ({...p, currentTrackIndex: (p.currentTrackIndex + 1) % playlist.length, isPlaying: false}))} />
    </div>
  );
};

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00';
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

export default App;
