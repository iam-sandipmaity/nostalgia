import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
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
    <div className="w-full max-w-3xl flex flex-col items-center select-none">
      
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

      {/* Top Handle Bar */}
      <div className="w-3/4 h-8 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-t-lg border-x-4 border-t-4 border-zinc-700 shadow-lg flex items-center justify-between px-6 z-0 -mb-1">
        <div className="w-4 h-full bg-zinc-900 border-r border-zinc-700" />
        <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">HEAVY DUTY CARRY HANDLE</div>
        <div className="w-4 h-full bg-zinc-900 border-l border-zinc-700" />
      </div>

      {/* Main Boombox Cabinet */}
      <div className="w-full bg-gradient-to-b from-zinc-850 via-zinc-900 to-zinc-950 rounded-xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 border-zinc-700 relative z-10">
        
        {/* Top Mechanical Piano Push Buttons & Top Controls */}
        <div className="w-full bg-zinc-950 rounded-t-md p-2 border-b-2 border-zinc-800 flex flex-wrap items-center justify-between gap-2 mb-4 shadow-inner">
          
          {/* Piano Key Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {/* STOP / EJECT - Red Button */}
            <button
              onClick={() => setIsPlaying(false)}
              className="px-3 py-2 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-t font-mono text-[10px] font-bold uppercase tracking-tighter border-b-4 border-red-950 active:border-b-0 active:translate-y-1 shadow-md hover:brightness-110 transition-all flex flex-col items-center"
              title="Stop / Eject"
            >
              <span>STOP/EJECT</span>
            </button>

            {/* PAUSE */}
            <button
              onClick={() => setIsPlaying(false)}
              className={`px-3 py-2 rounded-t font-mono text-[10px] font-bold uppercase tracking-tighter border-b-4 active:border-b-0 active:translate-y-1 shadow-md transition-all flex flex-col items-center ${
                !isPlaying ? 'bg-zinc-700 border-zinc-900 text-amber-400' : 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-zinc-950 text-zinc-300'
              }`}
              title="Pause"
            >
              <span>PAUSE</span>
            </button>

            {/* REW */}
            <button
              onClick={prevTrack}
              className="px-3 py-2 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-300 rounded-t font-mono text-[10px] font-bold uppercase tracking-tighter border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 shadow-md hover:text-white transition-all flex flex-col items-center"
              title="Rewind / Previous Track"
            >
              <span>REW</span>
            </button>

            {/* F.FWD */}
            <button
              onClick={nextTrack}
              className="px-3 py-2 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-300 rounded-t font-mono text-[10px] font-bold uppercase tracking-tighter border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 shadow-md hover:text-white transition-all flex flex-col items-center"
              title="Fast Forward / Next Track"
            >
              <span>F.FWD</span>
            </button>

            {/* PLAY */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-t font-mono text-[10px] font-bold uppercase tracking-tighter border-b-4 active:border-b-0 active:translate-y-1 shadow-md transition-all flex flex-col items-center ${
                isPlaying ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 border-emerald-950 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-zinc-950 text-zinc-300'
              }`}
              title="Play"
            >
              <span>PLAY</span>
            </button>

            {/* RECORD */}
            <div className="px-3 py-2 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-600 rounded-t font-mono text-[10px] font-bold uppercase tracking-tighter border-b-4 border-zinc-950 flex flex-col items-center opacity-60">
              <span className="text-red-500">● RECORD</span>
            </div>
          </div>

          {/* Top Right Tuning Knobs */}
          <div className="flex items-center gap-4 px-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 shadow-inner flex items-center justify-center cursor-pointer hover:border-amber-500">
                <div className="w-1 h-3 bg-amber-400 rounded-full" />
              </div>
              <span className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">TUNING</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-600 shadow-inner flex items-center justify-center cursor-pointer hover:border-amber-500">
                <div className="w-0.5 h-2 bg-zinc-400 rounded-full" />
              </div>
              <span className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">FINE TUNING</span>
            </div>
          </div>

        </div>

        {/* Radio Frequency Scale Panel */}
        <div className="w-full bg-zinc-950 rounded-md p-3 mb-6 border border-zinc-800 shadow-inner relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-300 font-bold mb-2 px-2">
            <span className="tracking-widest text-zinc-400">STEREO</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">TUNING</span>
              <div className={`w-3 h-3 rounded-xs border border-zinc-600 ${isPlaying ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-zinc-800'}`} />
            </div>
          </div>

          {/* Frequency Bands & Needle */}
          <div className="relative bg-zinc-900/90 rounded border border-zinc-800 p-2 font-mono text-xs text-zinc-400">
            {/* FM Line */}
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-amber-500/90 w-8">FM</span>
              <div className="flex-1 flex justify-between px-4 text-[11px] text-zinc-300">
                <span>88</span>
                <span>92</span>
                <span>96</span>
                <span>100</span>
                <span>104</span>
                <span>108</span>
                <span className="text-zinc-500">MHz</span>
              </div>
            </div>

            {/* Scale Divider Bar with Slider Needle */}
            <div 
              onClick={handleSeekClick}
              className="w-full h-2 bg-zinc-950 rounded relative my-1 cursor-pointer overflow-hidden border border-zinc-800"
              title="Click frequency scale to seek"
            >
              <div 
                className="absolute top-0 bottom-0 w-1.5 bg-red-500 shadow-[0_0_8px_red] transition-all duration-300"
                style={{ left: `${duration > 0 ? (progress / duration) * 98 : 10}%` }}
              />
            </div>

            {/* SW Line */}
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-500/90 w-8">SW</span>
              <div className="flex-1 flex justify-between px-4 text-[11px] text-zinc-300">
                <span>5.9</span>
                <span>7.5</span>
                <span>9.5</span>
                <span>12.5</span>
                <span>15.0</span>
                <span>18.0</span>
                <span className="text-zinc-500">MHz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Body Grid: Dual Speakers + Center Deck & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Left Speaker Grill */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-3 bg-zinc-950 rounded-lg border border-zinc-800 shadow-inner">
            <div className={`w-32 h-32 md:w-36 md:h-36 rounded-full bg-zinc-900 border-4 border-zinc-700 shadow-2xl flex items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-pulse' : ''}`}>
              {/* Speaker Mesh Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:4px_4px] opacity-70" />
              {/* Center Speaker Cone */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border-2 border-zinc-600 shadow-inner flex items-center justify-center z-10">
                <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-700 shadow-md" />
              </div>
            </div>
            
            {/* Band & Function Selector Controls */}
            <div className="mt-4 w-full bg-zinc-900 rounded p-2 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex flex-col gap-1.5">
              <div className="flex justify-between border-b border-zinc-800 pb-1">
                <span className="text-amber-500 font-bold">FM</span>
                <span>SW</span>
                <span>MW</span>
              </div>
              <div className="text-center text-[9px] uppercase tracking-widest text-zinc-500">BAND SELECTOR</div>
              <div className="flex justify-between pt-1 text-[9px]">
                <span>TAPE</span>
                <span className="text-emerald-400 font-bold">RADIO</span>
                <span>OFF</span>
              </div>
            </div>
          </div>

          {/* Center Cassette Deck & Digital Screen */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* Cassette Deck Window */}
            <div className="bg-zinc-950 rounded-lg p-3 border-2 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col items-center">
              
              <div className="w-full flex justify-between items-center mb-2 px-1">
                <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase font-bold">STEREO CASSETTE RECORDER</span>
                <span className="font-mono text-[9px] text-amber-500 font-semibold">AUTO STOP</span>
              </div>

              {/* Glass Cassette Chamber */}
              <div className="w-full bg-zinc-900/90 rounded border-2 border-zinc-700 p-2 relative shadow-inner aspect-[2.4/1] flex flex-col justify-between">
                
                {/* Cassette Label */}
                <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 rounded p-1.5 border border-amber-300 flex justify-between items-center text-zinc-900 shadow">
                  <div className="font-mono text-[10px] font-bold uppercase">SIDE A</div>
                  <div className="font-[Gloria_Hallelujah,cursive,sans-serif] text-sm text-blue-900 truncate max-w-[65%] font-bold">
                    {memory?.title || 'Nostalgic Mixtape'}
                  </div>
                  <div className="font-mono text-[9px] text-zinc-600">60 MIN</div>
                </div>

                {/* Cassette Tape Spools Window */}
                <div className="bg-zinc-950 rounded h-12 my-1 flex justify-between items-center px-6 relative border border-zinc-800 shadow-inner">
                  {/* Left Reel */}
                  <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center relative shadow"
                  >
                    <div className="w-1.5 h-6 bg-zinc-900 absolute" />
                    <div className="h-1.5 w-6 bg-zinc-900 absolute" />
                    <div className="w-3 h-3 rounded-full bg-white z-10" />
                  </motion.div>

                  {/* Tape Spool Line */}
                  <div className="flex-1 mx-3 h-[2px] bg-amber-900/50 relative flex items-center justify-center">
                    <div className="w-12 h-6 border border-zinc-700 rounded-sm bg-zinc-950/80" />
                  </div>

                  {/* Right Reel */}
                  <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center relative shadow"
                  >
                    <div className="w-1.5 h-6 bg-zinc-900 absolute" />
                    <div className="h-1.5 w-6 bg-zinc-900 absolute" />
                    <div className="w-3 h-3 rounded-full bg-white z-10" />
                  </motion.div>
                </div>

                {/* Golden Dynamic Bass Boost Badge */}
                <div className="text-center font-mono text-[10px] font-bold tracking-widest text-amber-400 uppercase shadow-black drop-shadow">
                  DYNAMIC BASS BOOST
                </div>

              </div>

            </div>

            {/* LCD Digital Song Metadata Display */}
            <div className="w-full bg-zinc-950 rounded-md p-3 font-mono text-emerald-400 shadow-inner border border-zinc-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase text-emerald-600 tracking-widest font-bold">● NOW PLAYING</span>
                <span className="text-xs text-emerald-500 font-semibold">{formatTime(progress)} / {formatTime(duration)}</span>
              </div>
              
              <div className="text-base font-bold truncate text-emerald-300" title={displayTitle}>
                {displayTitle}
              </div>
              
              <div className="text-xs text-emerald-500 truncate mt-0.5" title={displayArtist}>
                {displayArtist}
              </div>

              {/* Progress Seek Bar */}
              <div
                onClick={handleSeekClick}
                className="w-full h-2 bg-zinc-900 mt-2.5 rounded-full overflow-hidden cursor-pointer relative border border-zinc-800 hover:border-emerald-600 transition-colors"
                title="Click to seek position"
              >
                <div 
                  className="h-full bg-emerald-400 transition-all duration-150 shadow-[0_0_8px_#34d399]" 
                  style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

          </div>

          {/* Right Speaker Grill & Bottom Controls */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-3 bg-zinc-950 rounded-lg border border-zinc-800 shadow-inner">
            <div className={`w-32 h-32 md:w-36 md:h-36 rounded-full bg-zinc-900 border-4 border-zinc-700 shadow-2xl flex items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-pulse' : ''}`}>
              {/* Speaker Mesh Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:4px_4px] opacity-70" />
              {/* Center Speaker Cone */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border-2 border-zinc-600 shadow-inner flex items-center justify-center z-10">
                <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-700 shadow-md" />
              </div>
            </div>

            {/* Bottom Dials: Volume & Tone */}
            <div className="mt-4 w-full flex justify-around items-center bg-zinc-900 rounded p-2 border border-zinc-800">
              
              {/* Volume Dial */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  onClick={() => setVolume(v => (v >= 100 ? 0 : v + 25))}
                  title={`Volume: ${volume}% (Click to change)`}
                  className="w-9 h-9 rounded-full bg-zinc-800 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)] border-2 border-zinc-600 flex justify-center cursor-pointer relative select-none hover:border-amber-500 transition-colors"
                >
                  <div 
                    className="w-1 h-3 bg-amber-400 rounded-full mt-1 transition-transform duration-200 origin-bottom"
                    style={{ transform: `rotate(${(volume / 100) * 270 - 135}deg)` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">
                  VOL: {volume}%
                </span>
              </div>

              {/* Tone Dial */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  onClick={() => setTone(t => (t >= 100 ? 0 : t + 25))}
                  title={`Tone: ${tone}% (Click to change)`}
                  className="w-9 h-9 rounded-full bg-zinc-800 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)] border-2 border-zinc-600 flex justify-center cursor-pointer relative select-none hover:border-amber-500 transition-colors"
                >
                  <div 
                    className="w-1 h-3 bg-amber-400 rounded-full mt-1 transition-transform duration-200 origin-bottom"
                    style={{ transform: `rotate(${(tone / 100) * 270 - 135}deg)` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">
                  TONE: {tone}%
                </span>
              </div>

            </div>

            {/* Retro Indian Branding Badge */}
            <div className="mt-3 text-center">
              <div className="font-mono text-xs font-bold tracking-widest text-zinc-300 uppercase">AKASHBANI</div>
              <div className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">MADE IN INDIA</div>
            </div>

          </div>

        </div>

        {/* External Platform Links */}
        {currentTrack && (
          <div className="w-full border-t border-zinc-800/80 pt-4 mt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Listen on streaming platforms</span>
            <div className="flex flex-wrap gap-2">
              {currentTrack.links?.youtube && (
                 <a href={currentTrack.links.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors text-[11px] font-medium border border-zinc-800">
                   <ExternalLink size={10} /> YouTube
                 </a>
              )}
              {currentTrack.links?.ytmusic && (
                 <a href={currentTrack.links.ytmusic} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors text-[11px] font-medium border border-zinc-800">
                   <ExternalLink size={10} /> YT Music
                 </a>
              )}
              {currentTrack.links?.spotify && (
                 <a href={currentTrack.links.spotify} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-green-500 transition-colors text-[11px] font-medium border border-zinc-800">
                   <ExternalLink size={10} /> Spotify
                 </a>
              )}
              {currentTrack.links?.jiosaavn && (
                 <a href={currentTrack.links.jiosaavn} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors text-[11px] font-medium border border-zinc-800">
                   <ExternalLink size={10} /> JioSaavn
                 </a>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
