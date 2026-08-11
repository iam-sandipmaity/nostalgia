import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { TRACKS } from '../data/songs';
import { YouTubeDriver } from './YouTubeDriver';
import { ambientEngine } from '../utils/ambientAudio';

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
  const [tuningAngle, setTuningAngle] = useState(0);

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
    setTuningAngle(0);
  }, [memoryId]);

  const handleProgress = (currentTime: number, dur: number) => {
    setProgress(currentTime);
    if (dur > 0) {
      setDuration(dur);
      setTuningAngle((currentTime / dur) * 360);
    }
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

  const handleTune = (deltaDegrees: number) => {
    ambientEngine.playTuningStatic();
    setTuningAngle((prev) => {
      const nextAngle = (prev + deltaDegrees + 360) % 360;
      const pct = nextAngle / 360;
      if (duration > 0) {
        const targetSec = pct * duration;
        setProgress(targetSec);
        setSeekTarget(targetSec);
      }
      return nextAngle;
    });
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    ambientEngine.playTuningStatic();
    setTuningAngle(pct * 360);
    if (duration > 0) {
      const targetSec = pct * duration;
      setProgress(targetSec);
      setSeekTarget(targetSec);
    }
  };

  const displayTitle = liveTrackInfo?.title || currentTrack?.title || 'Loading...';
  const displayArtist = liveTrackInfo?.author || currentTrack?.artist || 'Various Artists';

  // Calculate dynamic FM frequency (88.0 MHz to 108.0 MHz)
  const currentProgressPct = duration > 0 ? progress / duration : tuningAngle / 360;
  const currentFmFreq = (88.0 + currentProgressPct * 20.0).toFixed(1);

  return (
    <div className="w-full max-w-4xl flex flex-col items-center select-none p-2">
      
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
      <div className="w-4/5 h-9 bg-gradient-to-b from-zinc-700 via-zinc-850 to-zinc-950 rounded-t-xl border-x-4 border-t-4 border-zinc-600 shadow-[0_-5px_15px_rgba(0,0,0,0.6)] flex items-center justify-between px-8 z-0 -mb-1 relative">
        <div className="w-5 h-full bg-zinc-900 border-r border-zinc-700 shadow-inner" />
        <div className="text-[10px] font-mono tracking-[0.25em] text-zinc-400 uppercase font-semibold">HEAVY DUTY STEREO HANDLE</div>
        <div className="w-5 h-full bg-zinc-900 border-l border-zinc-700 shadow-inner" />
      </div>

      {/* Main Boombox Cabinet */}
      <div className="w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-950 rounded-2xl p-4 md:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-4 border-zinc-700/80 relative z-10 overflow-hidden">
        
        {/* Realistic Metallic Corner Screws */}
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800 border border-zinc-400 shadow-inner flex items-center justify-center">
          <div className="w-2 h-[1px] bg-zinc-950 transform rotate-45" />
        </div>
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800 border border-zinc-400 shadow-inner flex items-center justify-center">
          <div className="w-2 h-[1px] bg-zinc-950 transform -rotate-12" />
        </div>
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800 border border-zinc-400 shadow-inner flex items-center justify-center">
          <div className="w-2 h-[1px] bg-zinc-950 transform rotate-90" />
        </div>
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800 border border-zinc-400 shadow-inner flex items-center justify-center">
          <div className="w-2 h-[1px] bg-zinc-950 transform rotate-30" />
        </div>

        {/* Top Mechanical Piano Push Buttons & Top Controls */}
        <div className="w-full bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-t-xl p-2.5 border-b-2 border-zinc-800 flex flex-wrap items-center justify-between gap-3 mb-5 shadow-2xl">
          
          {/* Piano Key Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {/* STOP / EJECT - Red Button */}
            <button
              onClick={() => setIsPlaying(false)}
              className="px-3.5 py-2.5 bg-gradient-to-b from-red-600 via-red-700 to-red-900 text-white rounded-t-md font-mono text-[10px] font-bold uppercase tracking-tight border-b-4 border-red-950 active:border-b-0 active:translate-y-1 shadow-[0_4px_8px_rgba(0,0,0,0.5)] hover:brightness-110 transition-all flex flex-col items-center border-t border-red-400/30"
              title="Stop / Eject"
            >
              <span>STOP/EJECT</span>
            </button>

            {/* PAUSE */}
            <button
              onClick={() => setIsPlaying(false)}
              className={`px-3.5 py-2.5 rounded-t-md font-mono text-[10px] font-bold uppercase tracking-tight border-b-4 active:border-b-0 active:translate-y-1 shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-all flex flex-col items-center ${
                !isPlaying ? 'bg-gradient-to-b from-zinc-700 to-zinc-850 border-zinc-950 text-amber-400 border-t border-zinc-500' : 'bg-gradient-to-b from-zinc-800 to-zinc-950 border-zinc-950 text-zinc-300 border-t border-zinc-700'
              }`}
              title="Pause"
            >
              <span>PAUSE</span>
            </button>

            {/* REW */}
            <button
              onClick={prevTrack}
              className="px-3.5 py-2.5 bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-950 text-zinc-200 rounded-t-md font-mono text-[10px] font-bold uppercase tracking-tight border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 shadow-[0_4px_8px_rgba(0,0,0,0.5)] hover:text-white transition-all flex flex-col items-center border-t border-zinc-600"
              title="Rewind / Previous Track"
            >
              <span>REW</span>
            </button>

            {/* F.FWD */}
            <button
              onClick={nextTrack}
              className="px-3.5 py-2.5 bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-950 text-zinc-200 rounded-t-md font-mono text-[10px] font-bold uppercase tracking-tight border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 shadow-[0_4px_8px_rgba(0,0,0,0.5)] hover:text-white transition-all flex flex-col items-center border-t border-zinc-600"
              title="Fast Forward / Next Track"
            >
              <span>F.FWD</span>
            </button>

            {/* PLAY */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4.5 py-2.5 rounded-t-md font-mono text-[10px] font-bold uppercase tracking-tight border-b-4 active:border-b-0 active:translate-y-1 shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-all flex flex-col items-center ${
                isPlaying ? 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 border-emerald-950 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] border-t border-emerald-400' : 'bg-gradient-to-b from-zinc-800 to-zinc-950 border-zinc-950 text-zinc-300 border-t border-zinc-600'
              }`}
              title="Play"
            >
              <span>PLAY</span>
            </button>

            {/* RECORD */}
            <div className="px-3 py-2.5 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-600 rounded-t-md font-mono text-[10px] font-bold uppercase tracking-tight border-b-4 border-zinc-950 flex flex-col items-center opacity-60">
              <span className="text-red-500">● RECORD</span>
            </div>
          </div>

          {/* Top Right Realistic Metallic Tuning Controls */}
          <div className="flex items-center gap-5 px-3">
            
            {/* Functional TUNING Dial */}
            <div className="flex flex-col items-center">
              <div 
                onClick={() => handleTune(20)}
                onWheel={(e) => handleTune(e.deltaY > 0 ? 15 : -15)}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-2 border-zinc-500 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer relative select-none hover:border-amber-400 transition-colors"
                title="Tuning Dial: Click or Scroll Wheel to tune frequency!"
              >
                {/* Metallic Ridge Rings */}
                <div className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center bg-zinc-900/80">
                  <div 
                    className="w-1 h-3.5 bg-amber-400 rounded-full transition-transform duration-100 origin-bottom shadow-[0_0_5px_#fbbf24]"
                    style={{ transform: `rotate(${tuningAngle}deg)` }}
                  />
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-400 mt-1 uppercase tracking-wider">TUNING</span>
            </div>

            {/* Fine Tuning Dial */}
            <div className="flex flex-col items-center">
              <div 
                onClick={() => handleTune(5)}
                className="w-8 h-8 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-2 border-zinc-600 shadow-inner flex items-center justify-center cursor-pointer relative select-none hover:border-amber-400"
                title="Fine Tuning Dial"
              >
                <div 
                  className="w-0.5 h-2.5 bg-zinc-300 rounded-full transition-transform duration-100 origin-bottom"
                  style={{ transform: `rotate(${tuningAngle * 2}deg)` }}
                />
              </div>
              <span className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-tighter">FINE TUNE</span>
            </div>

          </div>

        </div>

        {/* Radio Frequency Scale Panel (Glass Window with Tuning Needle) */}
        <div className="w-full bg-zinc-950 rounded-lg p-3.5 mb-6 border-2 border-zinc-700/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] relative overflow-hidden">
          
          {/* Glass Glare Highlight */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent z-20" />

          <div className="flex justify-between items-center text-xs font-mono text-zinc-300 font-bold mb-2 px-2 relative z-10">
            <div className="flex items-center gap-3">
              <span className="tracking-[0.2em] text-zinc-300 font-extrabold text-sm">STEREO</span>
              <span className="bg-amber-900/40 text-amber-400 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                {currentFmFreq} MHz
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-bold">STATION TUNING</span>
              <div className={`w-3.5 h-3.5 rounded-xs border border-zinc-600 ${isPlaying ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-zinc-800'}`} />
            </div>
          </div>

          {/* Frequency Bands & Interactive Needle */}
          <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-md border border-zinc-800 p-2.5 font-mono text-xs text-zinc-400 shadow-inner relative z-10">
            
            {/* FM Scale Line */}
            <div className="flex justify-between items-center mb-1">
              <span className="font-extrabold text-amber-400 text-sm w-8">FM</span>
              <div className="flex-1 flex justify-between px-6 text-[12px] text-zinc-200 font-bold tracking-wider">
                <span>88</span>
                <span>92</span>
                <span>96</span>
                <span>100</span>
                <span>104</span>
                <span>108</span>
                <span className="text-zinc-500 text-[10px]">MHz</span>
              </div>
            </div>

            {/* Scale Track Glass Window with Interactive Red Tuning Needle */}
            <div 
              onClick={handleSeekClick}
              className="w-full h-3 bg-zinc-950 rounded relative my-1.5 cursor-pointer overflow-hidden border border-zinc-700 shadow-inner"
              title="Click or drag frequency scale to tune radio!"
            >
              {/* Scale Ticks */}
              <div className="absolute inset-0 flex justify-between px-4 items-center opacity-30">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className={`bg-white ${i % 5 === 0 ? 'h-full w-[1.5px]' : 'h-1/2 w-[1px]'}`} />
                ))}
              </div>

              {/* Red Vertical Needle Indicator */}
              <div 
                className="absolute top-0 bottom-0 w-2 bg-gradient-to-b from-red-500 via-red-600 to-red-700 shadow-[0_0_12px_#ef4444] transition-all duration-150 z-10 border-x border-red-300"
                style={{ left: `${Math.max(1, Math.min(97, currentProgressPct * 98))}%` }}
              >
                <div className="w-3 h-1 bg-amber-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow" />
              </div>
            </div>

            {/* SW Scale Line */}
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-amber-400 text-sm w-8">SW</span>
              <div className="flex-1 flex justify-between px-6 text-[11px] text-zinc-300 font-semibold tracking-wider">
                <span>5.9</span>
                <span>7.5</span>
                <span>9.5</span>
                <span>12.5</span>
                <span>15.0</span>
                <span>18.0</span>
                <span className="text-zinc-500 text-[10px]">MHz</span>
              </div>
            </div>

          </div>
        </div>

        {/* Main Body Grid: Dual Speakers + Center Deck & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Left Speaker Grill */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-xl border border-zinc-800 shadow-2xl relative">
            <div className={`w-36 h-36 md:w-40 md:h-40 rounded-full bg-zinc-900 border-4 border-zinc-700 shadow-[0_10px_25px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden border-t-zinc-600 ${isPlaying ? 'animate-pulse' : ''}`}>
              {/* Speaker Mesh Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1.5px,transparent_1.5px)] [background-size:5px_5px] opacity-80 z-10" />
              {/* Center Speaker Cone */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border-2 border-zinc-600 shadow-2xl flex items-center justify-center z-20">
                <div className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-700 shadow-inner flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                </div>
              </div>
            </div>
            
            {/* Band & Function Selector Controls */}
            <div className="mt-4 w-full bg-zinc-950 rounded-lg p-2.5 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex flex-col gap-1.5 shadow-inner">
              <div className="flex justify-between border-b border-zinc-800 pb-1 px-1">
                <span className="text-amber-400 font-extrabold">FM</span>
                <span>SW</span>
                <span>MW</span>
              </div>
              <div className="text-center text-[9px] uppercase tracking-widest text-zinc-500 font-bold">BAND SELECTOR</div>
              <div className="flex justify-between pt-1 text-[9px] px-1">
                <span>TAPE</span>
                <span className="text-emerald-400 font-bold">RADIO</span>
                <span>OFF</span>
              </div>
            </div>
          </div>

          {/* Center Cassette Deck & Digital Screen */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* Cassette Deck Window */}
            <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-xl p-3.5 border-2 border-zinc-700 shadow-2xl relative overflow-hidden flex flex-col items-center">
              
              <div className="w-full flex justify-between items-center mb-2 px-1">
                <span className="font-mono text-[10px] tracking-widest text-zinc-300 uppercase font-extrabold">STEREO CASSETTE RECORDER</span>
                <span className="font-mono text-[9px] text-amber-400 font-bold">AUTO STOP</span>
              </div>

              {/* Glass Cassette Chamber */}
              <div className="w-full bg-zinc-950 rounded-lg border-2 border-zinc-700 p-2.5 relative shadow-2xl aspect-[2.4/1] flex flex-col justify-between overflow-hidden">
                
                {/* Glass Glare Sheen */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent z-30" />

                {/* Cassette Label */}
                <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 rounded-md p-1.5 border border-amber-300 flex justify-between items-center text-zinc-900 shadow-md relative z-10">
                  <div className="font-mono text-[10px] font-extrabold uppercase">SIDE A</div>
                  <div className="font-[Gloria_Hallelujah,cursive,sans-serif] text-sm text-blue-900 truncate max-w-[65%] font-extrabold">
                    {memory?.title || 'Nostalgic Mixtape'}
                  </div>
                  <div className="font-mono text-[9px] text-zinc-700 font-bold">60 MIN</div>
                </div>

                {/* Cassette Tape Spools Window */}
                <div className="bg-zinc-950 rounded-md h-12 my-1 flex justify-between items-center px-6 relative border border-zinc-800 shadow-inner z-10">
                  {/* Left Reel */}
                  <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center relative shadow-lg"
                  >
                    <div className="w-1.5 h-7 bg-zinc-950 absolute" />
                    <div className="h-1.5 w-7 bg-zinc-950 absolute" />
                    <div className="w-3.5 h-3.5 rounded-full bg-white z-10 shadow" />
                  </motion.div>

                  {/* Tape Spool Line */}
                  <div className="flex-1 mx-4 h-[2.5px] bg-amber-900/60 relative flex items-center justify-center">
                    <div className="w-14 h-6 border border-zinc-700 rounded-sm bg-zinc-950/90 shadow-inner" />
                  </div>

                  {/* Right Reel */}
                  <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center relative shadow-lg"
                  >
                    <div className="w-1.5 h-7 bg-zinc-950 absolute" />
                    <div className="h-1.5 w-7 bg-zinc-950 absolute" />
                    <div className="w-3.5 h-3.5 rounded-full bg-white z-10 shadow" />
                  </motion.div>
                </div>

                {/* Golden Dynamic Bass Boost Badge */}
                <div className="text-center font-mono text-[10px] font-extrabold tracking-[0.2em] text-amber-400 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] relative z-10">
                  DYNAMIC BASS BOOST
                </div>

              </div>

            </div>

            {/* LCD Digital Song Metadata Display */}
            <div className="w-full bg-zinc-950 rounded-lg p-3.5 font-mono text-emerald-400 shadow-inner border border-zinc-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase text-emerald-500 tracking-widest font-extrabold">● NOW PLAYING</span>
                <span className="text-xs text-emerald-400 font-bold">{formatTime(progress)} / {formatTime(duration)}</span>
              </div>
              
              <div className="text-base font-extrabold truncate text-emerald-300" title={displayTitle}>
                {displayTitle}
              </div>
              
              <div className="text-xs text-emerald-500 truncate mt-0.5" title={displayArtist}>
                {displayArtist}
              </div>

              {/* Progress Seek Bar */}
              <div
                onClick={handleSeekClick}
                className="w-full h-2.5 bg-zinc-900 mt-3 rounded-full overflow-hidden cursor-pointer relative border border-zinc-800 hover:border-emerald-500 transition-colors shadow-inner"
                title="Click to seek position"
              >
                <div 
                  className="h-full bg-emerald-400 transition-all duration-150 shadow-[0_0_10px_#34d399]" 
                  style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

          </div>

          {/* Right Speaker Grill & Bottom Controls */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-xl border border-zinc-800 shadow-2xl relative">
            <div className={`w-36 h-36 md:w-40 md:h-40 rounded-full bg-zinc-900 border-4 border-zinc-700 shadow-[0_10px_25px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden border-t-zinc-600 ${isPlaying ? 'animate-pulse' : ''}`}>
              {/* Speaker Mesh Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1.5px,transparent_1.5px)] [background-size:5px_5px] opacity-80 z-10" />
              {/* Center Speaker Cone */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border-2 border-zinc-600 shadow-2xl flex items-center justify-center z-20">
                <div className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-700 shadow-inner flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                </div>
              </div>
            </div>

            {/* Bottom Dials: Volume & Tone */}
            <div className="mt-4 w-full flex justify-around items-center bg-zinc-950 rounded-lg p-2.5 border border-zinc-800 shadow-inner">
              
              {/* Volume Dial */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  onClick={() => setVolume(v => (v >= 100 ? 0 : v + 25))}
                  title={`Volume: ${volume}% (Click to change)`}
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-950 shadow-[0_4px_8px_rgba(0,0,0,0.8)] border-2 border-zinc-600 flex justify-center cursor-pointer relative select-none hover:border-amber-400 transition-colors"
                >
                  <div 
                    className="w-1 h-3.5 bg-amber-400 rounded-full mt-1 transition-transform duration-200 origin-bottom shadow"
                    style={{ transform: `rotate(${(volume / 100) * 270 - 135}deg)` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-zinc-300 font-bold uppercase tracking-tighter">
                  VOL: {volume}%
                </span>
              </div>

              {/* Tone Dial */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  onClick={() => setTone(t => (t >= 100 ? 0 : t + 25))}
                  title={`Tone: ${tone}% (Click to change)`}
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-950 shadow-[0_4px_8px_rgba(0,0,0,0.8)] border-2 border-zinc-600 flex justify-center cursor-pointer relative select-none hover:border-amber-400 transition-colors"
                >
                  <div 
                    className="w-1 h-3.5 bg-amber-400 rounded-full mt-1 transition-transform duration-200 origin-bottom shadow"
                    style={{ transform: `rotate(${(tone / 100) * 270 - 135}deg)` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-zinc-300 font-bold uppercase tracking-tighter">
                  TONE: {tone}%
                </span>
              </div>

            </div>

            {/* Retro Indian Branding Badge */}
            <div className="mt-3 text-center">
              <div className="font-mono text-xs font-extrabold tracking-[0.2em] text-zinc-200 uppercase">AKASHBANI</div>
              <div className="font-mono text-[9px] tracking-wider text-zinc-400 font-bold uppercase">MADE IN INDIA</div>
            </div>

          </div>

        </div>

        {/* External Streaming Platform Links */}
        {currentTrack && (
          <div className="w-full border-t border-zinc-800 pt-4 mt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Listen on streaming platforms</span>
            <div className="flex flex-wrap gap-2">
              {currentTrack.links?.youtube && (
                 <a href={currentTrack.links.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 transition-colors text-[11px] font-medium border border-zinc-800">
                   <ExternalLink size={10} /> YouTube
                 </a>
              )}
              {currentTrack.links?.ytmusic && (
                 <a href={currentTrack.links.ytmusic} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-red-500 transition-colors text-[11px] font-medium border border-zinc-800">
                   <ExternalLink size={10} /> YT Music
                 </a>
              )}
              {currentTrack.links?.spotify && (
                 <a href={currentTrack.links.spotify} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-green-500 transition-colors text-[11px] font-medium border border-zinc-800">
                   <ExternalLink size={10} /> Spotify
                 </a>
              )}
              {currentTrack.links?.jiosaavn && (
                 <a href={currentTrack.links.jiosaavn} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors text-[11px] font-medium border border-zinc-800">
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
