import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, ExternalLink } from 'lucide-react';
import { TRACKS } from '../data/songs';
import { YouTubeDriver } from './YouTubeDriver';

interface CassettePlayerProps {
  memoryId: string;
  memory: any;
}

export function CassettePlayer({ memoryId, memory }: CassettePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [tone, setTone] = useState(50);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  const [skipAction, setSkipAction] = useState<{ type: 'next' | 'prev'; id: number } | null>(null);
  const [liveTrackInfo, setLiveTrackInfo] = useState<{ title: string; author: string } | null>(null);

  // Filter tracks for this memory
  const memoryTracks = useMemo(() => {
    const filtered = TRACKS.filter(t => t.memoryId === memoryId);
    return filtered.length > 0 ? filtered : TRACKS; // fallback if empty
  }, [memoryId]);

  const currentTrack = memoryTracks[0];

  useEffect(() => {
    setLiveTrackInfo(null);
    setIsPlaying(false);
    setProgress(0);
    setSeekTarget(null);
    setSkipAction(null);
  }, [memoryId]);

  const handleProgress = (currentTime: number, dur: number) => {
    setProgress(currentTime);
    if (dur > 0) setDuration(dur);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nextTrack = () => {
    setSkipAction({ type: 'next', id: Date.now() });
    setIsPlaying(true);
    setProgress(0);
    setSeekTarget(null);
  };

  const prevTrack = () => {
    setSkipAction({ type: 'prev', id: Date.now() });
    setIsPlaying(true);
    setProgress(0);
    setSeekTarget(null);
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    if (duration > 0) {
      const targetSec = pct * duration;
      setProgress(targetSec);
      setSeekTarget(targetSec);
    }
  };

  const displayTitle = liveTrackInfo?.title || currentTrack?.title || 'Loading...';
  const displayArtist = liveTrackInfo?.author || currentTrack?.artist || 'Various Artists';

  return (
    <div className="w-full max-w-2xl bg-zinc-900 rounded-lg p-6 md:p-8 shadow-2xl relative border border-zinc-800 flex flex-col items-center">
      
      {/* Off-screen YouTube Playlist Driver */}
      {currentTrack && (
        <YouTubeDriver
          playlistUrl={currentTrack.playlistUrl}
          isPlaying={isPlaying}
          volume={volume}
          seekTarget={seekTarget}
          skipAction={skipAction}
          onProgress={handleProgress}
          onEnded={nextTrack}
          onTrackChange={setLiveTrackInfo}
        />
      )}

      {/* Brand & Info */}
      <div className="w-full flex justify-between items-start mb-8">
        <div>
          <div className="text-zinc-500 font-mono text-xs mb-1 tracking-widest">AKASHBANI / STEREO</div>
          <div className="text-zinc-400 text-sm font-bold uppercase">Super Fidelity</div>
        </div>
        <div className="flex items-center gap-2 text-red-500">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-red-900'}`} />
          <span className="text-[10px] font-mono tracking-widest text-zinc-600">POWER</span>
        </div>
      </div>

      {/* Cassette Deck Window */}
      <div className="bg-zinc-800 rounded w-full md:w-3/4 aspect-[2/1] p-3 md:p-4 mb-8 shadow-inner border-t-2 border-zinc-950 flex flex-col justify-center relative overflow-hidden">
        
        {/* Cassette Body */}
        <div className="bg-zinc-200 w-full h-full rounded shadow-md relative p-2 flex flex-col">
          {/* Label */}
          <div className="bg-orange-100/90 flex-1 rounded-sm border border-orange-200 p-2 flex flex-col justify-between">
            <div className="flex justify-between items-start border-b border-orange-300 pb-1">
              <span className="font-mono text-xs text-orange-900/50">A</span>
              <span className="font-mono text-[10px] text-orange-900/50">NR-C</span>
            </div>
            <div className="text-center">
              <div className="font-mono text-xs uppercase text-zinc-500 tracking-widest mb-1">MEMORIES</div>
              <div className="font-[Gloria_Hallelujah,cursive,sans-serif] text-xl text-blue-900 transform -rotate-2">
                {memory?.title || 'Mixtape'}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[10px] text-zinc-500">60 MIN</span>
              <span className="font-mono text-[10px] text-zinc-500">NORMAL BIAS</span>
            </div>
          </div>
          
          {/* Tape Window */}
          <div className="bg-zinc-900 h-12 mt-2 rounded flex justify-between items-center px-6 relative overflow-hidden border border-zinc-700 shadow-inner">
             {/* Left Reel */}
             <motion.div 
               animate={{ rotate: isPlaying ? 360 : 0 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center relative"
             >
                <div className="w-2 h-6 bg-zinc-900 absolute" />
                <div className="h-2 w-6 bg-zinc-900 absolute" />
                <div className="w-3 h-3 rounded-full bg-white z-10" />
             </motion.div>

             {/* Center Window Line */}
             <div className="flex-1 mx-4 flex items-center justify-center relative">
               <div className="w-full h-[1px] bg-white/20 absolute top-1/2" />
               <div className="w-16 h-8 border border-white/20 rounded-sm relative bg-zinc-950/50">
                  <div className="absolute top-1/2 w-full h-4 bg-zinc-800 -translate-y-1/2 opacity-50" />
               </div>
             </div>

             {/* Right Reel */}
             <motion.div 
               animate={{ rotate: isPlaying ? 360 : 0 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center relative"
             >
                <div className="w-2 h-6 bg-zinc-900 absolute" />
                <div className="h-2 w-6 bg-zinc-900 absolute" />
                <div className="w-3 h-3 rounded-full bg-white z-10" />
             </motion.div>
          </div>
          
        </div>
      </div>

      {/* Track Info Display */}
      <div className="w-full md:w-3/4 bg-zinc-950 rounded-sm p-4 mb-6 font-mono text-green-500 shadow-inner border border-zinc-800">
        <div className="text-[10px] uppercase text-green-700 mb-1">Now Playing</div>
        <div className="text-lg md:text-xl truncate" title={displayTitle}>{displayTitle}</div>
        <div className="flex justify-between items-end mt-2">
          <div className="text-xs text-green-600 truncate max-w-[70%]" title={displayArtist}>
            {displayArtist}
          </div>
          <div className="text-sm font-semibold">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
        </div>
        {/* Interactive Seekable Progress Bar UI */}
        <div
          onClick={handleSeekClick}
          className="w-full h-2 bg-zinc-800 mt-3 rounded-full overflow-hidden cursor-pointer relative hover:bg-zinc-700 transition-colors"
          title="Click to seek"
        >
          <div 
            className="h-full bg-green-500 transition-all duration-150" 
            style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="w-full md:w-3/4 flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
        
        {/* Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={prevTrack}
            className="w-12 h-8 bg-zinc-800 border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 rounded shadow-md flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-16 h-8 border-b-4 active:border-b-0 active:translate-y-1 rounded shadow-md flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-zinc-700 border-zinc-900 text-white' 
                : 'bg-zinc-800 border-zinc-950 text-zinc-400 hover:text-white'
            }`}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          
          <button 
            onClick={nextTrack}
            className="w-12 h-8 bg-zinc-800 border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 rounded shadow-md flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Interactive Dials */}
        <div className="flex gap-6">
          {/* Interactive Volume Dial */}
          <div className="flex flex-col items-center gap-2">
            <div 
              onClick={() => setVolume(v => (v >= 100 ? 0 : v + 25))}
              title={`Volume: ${volume}% (Click to change)`}
              className="w-10 h-10 rounded-full bg-zinc-800 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)] border-2 border-zinc-700 flex justify-center cursor-pointer relative select-none hover:border-zinc-500 transition-colors"
            >
              <div 
                className="w-1 h-3 bg-zinc-400 rounded-full mt-1 transition-transform duration-200 origin-bottom"
                style={{ transform: `rotate(${(volume / 100) * 270 - 135}deg)` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Vol: {volume}%
            </span>
          </div>
          
          {/* Interactive Tone Dial */}
          <div className="flex flex-col items-center gap-2">
            <div 
              onClick={() => setTone(t => (t >= 100 ? 0 : t + 25))}
              title={`Tone: ${tone}% (Click to change)`}
              className="w-10 h-10 rounded-full bg-zinc-800 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)] border-2 border-zinc-700 flex justify-center cursor-pointer relative select-none hover:border-zinc-500 transition-colors"
            >
              <div 
                className="w-1 h-3 bg-zinc-400 rounded-full mt-1 transition-transform duration-200 origin-bottom"
                style={{ transform: `rotate(${(tone / 100) * 270 - 135}deg)` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Tone: {tone}%
            </span>
          </div>
        </div>
      </div>

      {/* External Links */}
      {currentTrack && (
        <div className="w-full border-t border-zinc-800 pt-6 mt-2">
          <div className="text-center text-xs text-zinc-500 uppercase tracking-widest mb-4">Listen on other platforms</div>
          <div className="flex flex-wrap justify-center gap-3">
            {currentTrack.links?.youtube && (
               <a href={currentTrack.links.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors text-xs font-medium border border-zinc-700">
                 <ExternalLink size={12} /> YouTube
               </a>
            )}
            {currentTrack.links?.ytmusic && (
               <a href={currentTrack.links.ytmusic} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors text-xs font-medium border border-zinc-700">
                 <ExternalLink size={12} /> YT Music
               </a>
            )}
            {currentTrack.links?.spotify && (
               <a href={currentTrack.links.spotify} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-green-500 transition-colors text-xs font-medium border border-zinc-700">
                 <ExternalLink size={12} /> Spotify
               </a>
            )}
            {currentTrack.links?.jiosaavn && (
               <a href={currentTrack.links.jiosaavn} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors text-xs font-medium border border-zinc-700">
                 <ExternalLink size={12} /> JioSaavn
               </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
