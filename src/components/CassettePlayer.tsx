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
  const [bassBoost, setBassBoost] = useState(true);
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

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
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
    <div className="w-full max-w-2xl flex flex-col items-center select-none px-1 sm:px-2">
      
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
      <div className="w-4/5 sm:w-3/4 h-6 sm:h-7 bg-gradient-to-b from-zinc-700 via-zinc-850 to-zinc-950 rounded-t-lg border-x-2 sm:border-x-4 border-t-2 sm:border-t-4 border-zinc-600 shadow-md flex items-center justify-between px-4 sm:px-6 z-0 -mb-1 relative">
        <div className="w-3 sm:w-4 h-full bg-zinc-900 border-r border-zinc-700" />
        <div className="text-[8px] sm:text-[9px] font-mono tracking-[0.15em] sm:tracking-[0.2em] text-zinc-400 uppercase font-semibold truncate">STEREO CASSETTE RECORDER</div>
        <div className="w-3 sm:w-4 h-full bg-zinc-900 border-l border-zinc-700" />
      </div>

      {/* Main Boombox Cabinet */}
      <div className="w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-950 rounded-xl p-2.5 sm:p-4 md:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.9)] border border-zinc-700/80 sm:border-2 relative z-10 overflow-hidden">
        
        {/* Corner Rivets */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-500 shadow-inner hidden sm:block" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-500 shadow-inner hidden sm:block" />

        {/* Top Mechanical Piano Keys & Tuning Controls */}
        <div className="w-full bg-zinc-950 rounded-t-lg p-2 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-3 sm:mb-4 shadow-inner">
          
          {/* Mechanical Piano Key Buttons */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto py-0.5">
            
            {/* STOP / EJECT - Red Button */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] sm:text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-tighter">STOP</span>
              <button
                onClick={() => setIsPlaying(false)}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-red-600 via-red-700 to-red-900 text-white rounded-t-sm font-mono text-[9px] sm:text-[10px] font-bold border-b-2 sm:border-b-4 border-red-950 active:border-b-0 active:translate-y-0.5 shadow-md hover:brightness-110 transition-all border-t border-red-400/40 min-h-[32px] sm:min-h-[36px]"
                title="Stop / Eject"
              >
                ■
              </button>
            </div>

            {/* PAUSE */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] sm:text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-tighter">PAUSE</span>
              <button
                onClick={() => setIsPlaying(false)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-t-sm font-mono text-[9px] sm:text-[10px] font-bold border-b-2 sm:border-b-4 active:border-b-0 active:translate-y-0.5 shadow-md transition-all min-h-[32px] sm:min-h-[36px] ${
                  !isPlaying ? 'bg-gradient-to-b from-zinc-700 to-zinc-850 border-zinc-950 text-amber-400 border-t border-zinc-500' : 'bg-gradient-to-b from-zinc-800 to-zinc-950 border-zinc-950 text-zinc-300 border-t border-zinc-700'
                }`}
                title="Pause"
              >
                ❚❚
              </button>
            </div>

            {/* REW (Prev Track) */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] sm:text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-tighter">REW</span>
              <button
                onClick={prevTrack}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-950 text-zinc-200 rounded-t-sm font-mono text-[9px] sm:text-[10px] font-bold border-b-2 sm:border-b-4 border-zinc-950 active:border-b-0 active:translate-y-0.5 shadow-md hover:text-white transition-all border-t border-zinc-600 min-h-[32px] sm:min-h-[36px]"
                title="Rewind / Previous Track"
              >
                ◄◄
              </button>
            </div>

            {/* F.FWD (Next Track) */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] sm:text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-tighter">F.FWD</span>
              <button
                onClick={nextTrack}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-950 text-zinc-200 rounded-t-sm font-mono text-[9px] sm:text-[10px] font-bold border-b-2 sm:border-b-4 border-zinc-950 active:border-b-0 active:translate-y-0.5 shadow-md hover:text-white transition-all border-t border-zinc-600 min-h-[32px] sm:min-h-[36px]"
                title="Fast Forward / Next Track"
              >
                ►►
              </button>
            </div>

            {/* PLAY */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] sm:text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-tighter">PLAY</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-t-sm font-mono text-[9px] sm:text-[10px] font-bold border-b-2 sm:border-b-4 active:border-b-0 active:translate-y-0.5 shadow-md transition-all min-h-[32px] sm:min-h-[36px] ${
                  isPlaying ? 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 border-emerald-950 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)] border-t border-emerald-400' : 'bg-gradient-to-b from-zinc-800 to-zinc-950 border-zinc-950 text-zinc-300 border-t border-zinc-600'
                }`}
                title="Play"
              >
                ►
              </button>
            </div>

            {/* RECORD */}
            <div className="flex flex-col items-center gap-0.5 opacity-50">
              <span className="text-[7px] sm:text-[8px] font-mono text-red-500 font-bold uppercase tracking-tighter">REC</span>
              <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-zinc-900 text-red-600 rounded-t-sm font-mono text-[9px] sm:text-[10px] font-bold border-b-2 sm:border-b-4 border-zinc-950 flex items-center justify-center min-h-[32px] sm:min-h-[36px]">
                ●
              </div>
            </div>

          </div>

          {/* Top Right Tuning Knobs */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 px-1">
            <div className="flex flex-col items-center">
              <div 
                onClick={() => handleTune(20)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-2 border-zinc-500 shadow-md flex items-center justify-center cursor-pointer relative select-none hover:border-amber-400 transition-colors"
                title="Tuning Dial: Tap or turn to tune frequency!"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-zinc-600 flex items-center justify-center bg-zinc-900/80">
                  <div 
                    className="w-1 h-2.5 sm:h-3 bg-amber-400 rounded-full transition-transform duration-100 origin-bottom shadow-[0_0_4px_#fbbf24]"
                    style={{ transform: `rotate(${tuningAngle}deg)` }}
                  />
                </div>
              </div>
              <span className="text-[7px] sm:text-[8px] font-mono font-bold text-amber-400 mt-0.5 uppercase">TUNING</span>
            </div>

            <div className="flex flex-col items-center">
              <div 
                onClick={() => handleTune(5)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-2 border-zinc-600 shadow-inner flex items-center justify-center cursor-pointer relative select-none hover:border-amber-400"
                title="Fine Tuning Dial"
              >
                <div 
                  className="w-0.5 h-2 bg-zinc-300 rounded-full transition-transform duration-100 origin-bottom"
                  style={{ transform: `rotate(${tuningAngle * 2}deg)` }}
                />
              </div>
              <span className="text-[7px] sm:text-[8px] font-mono text-zinc-400 mt-0.5 uppercase">FINE</span>
            </div>
          </div>

        </div>

        {/* Top Radio Scale Panel (Matching Screenshot: STEREO + FM / SW Frequency Glass Dial + Red Needle) */}
        <div className="w-full bg-zinc-950 rounded-md p-2 sm:p-2.5 mb-3 sm:mb-4 border border-zinc-800 shadow-inner relative overflow-hidden">
          
          <div className="flex justify-between items-center text-xs font-mono text-zinc-300 font-bold mb-1 px-1">
            <span className="tracking-[0.15em] sm:tracking-[0.2em] text-zinc-200 font-extrabold text-[11px] sm:text-xs">STEREO</span>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[8px] sm:text-[9px] text-amber-400 font-mono font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {currentFmFreq} MHz
              </span>
              <span className="text-[8px] sm:text-[9px] text-zinc-500 font-bold hidden sm:inline">TUNING</span>
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs border border-zinc-600 ${isPlaying ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-zinc-800'}`} />
            </div>
          </div>

          {/* Frequency Scale Track & Red Vertical Needle */}
          <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 rounded border border-zinc-800 p-1.5 sm:p-2 font-mono text-[10px] sm:text-[11px] text-zinc-300 shadow-inner">
            
            {/* FM Scale */}
            <div className="flex justify-between items-center mb-0.5">
              <span className="font-extrabold text-amber-400 w-5 sm:w-7 text-[10px] sm:text-xs">FM</span>
              <div className="flex-1 flex justify-between px-2 sm:px-4 font-bold text-[9px] sm:text-[10px]">
                <span>88</span>
                <span>92</span>
                <span>96</span>
                <span>100</span>
                <span>104</span>
                <span>108</span>
                <span className="text-zinc-500 text-[8px] hidden sm:inline">MHz</span>
              </div>
            </div>

            {/* Red Vertical Needle Slider Glass */}
            <div 
              onClick={handleSeekClick}
              onTouchStart={handleSeekClick}
              className="w-full h-2 sm:h-2.5 bg-zinc-950 rounded relative my-1 cursor-pointer overflow-hidden border border-zinc-800"
              title="Tap or drag scale to tune frequency!"
            >
              {/* Ticks */}
              <div className="absolute inset-0 flex justify-between px-2 items-center opacity-25">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`bg-white ${i % 4 === 0 ? 'h-full w-[1.5px]' : 'h-1/2 w-[1px]'}`} />
                ))}
              </div>

              {/* Red Vertical Needle Indicator */}
              <div 
                className="absolute top-0 bottom-0 w-1.5 bg-red-500 shadow-[0_0_8px_#ef4444] transition-all duration-150 z-10 border-x border-red-300"
                style={{ left: `${Math.max(1, Math.min(97, currentProgressPct * 98))}%` }}
              />
            </div>

            {/* SW Scale */}
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-amber-400 w-5 sm:w-7 text-[10px] sm:text-xs">SW</span>
              <div className="flex-1 flex justify-between px-2 sm:px-4 font-semibold text-[8px] sm:text-[9px]">
                <span>5.9</span>
                <span>7.5</span>
                <span>9.5</span>
                <span>12.5</span>
                <span>15.0</span>
                <span>18.0</span>
                <span className="text-zinc-500 text-[8px] hidden sm:inline">MHz</span>
              </div>
            </div>

          </div>
        </div>

        {/* Main Body Layout: Dual Speakers Flanking Cassette Deck */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-3 items-center">
          
          {/* Mobile Top Row: Dual Speakers side-by-side on Mobile! */}
          <div className="w-full md:hidden flex justify-between items-center px-1 mb-1">
            {/* Left Mini Speaker */}
            <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className={`w-14 h-14 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-md flex items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-pulse' : ''}`}>
                <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:3px_3px] opacity-80" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-600 flex items-center justify-center z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
                </div>
              </div>
              <div className="text-[8px] font-mono text-zinc-400 font-bold">FM/SW STEREO</div>
            </div>

            {/* Right Mini Speaker */}
            <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-[8px] font-mono text-zinc-400 font-bold text-right">AKASHBANI</div>
              <div className={`w-14 h-14 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-md flex items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-pulse' : ''}`}>
                <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:3px_3px] opacity-80" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-600 flex items-center justify-center z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
                </div>
              </div>
            </div>
          </div>

          {/* Left Speaker Compartment (Desktop) */}
          <div className="hidden md:flex md:col-span-3 flex-col items-center justify-center p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 shadow-inner">
            <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full bg-zinc-900 border-4 border-zinc-700 shadow-xl flex items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:4px_4px] opacity-80" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border-2 border-zinc-600 shadow-inner flex items-center justify-center z-10">
                <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-700 shadow-md" />
              </div>
            </div>
            
            {/* Band & Function Selector */}
            <div className="mt-3 w-full bg-zinc-900 rounded p-1.5 border border-zinc-800 text-[9px] font-mono text-zinc-400 flex flex-col gap-1">
              <div className="flex justify-between border-b border-zinc-800 pb-0.5 px-1 font-bold">
                <span className="text-amber-400">FM</span>
                <span>SW</span>
                <span>MW</span>
              </div>
              <div className="text-center text-[8px] uppercase tracking-widest text-zinc-500">BAND SELECTOR</div>
              <div className="flex justify-between pt-0.5 text-[8px] px-1 font-bold">
                <span>TAPE</span>
                <span className="text-emerald-400">RADIO</span>
                <span>OFF</span>
              </div>
            </div>
          </div>

          {/* Center Cassette Deck & Digital LCD Screen */}
          <div className="w-full md:col-span-6 flex flex-col gap-2.5">
            
            {/* Cassette Deck Window */}
            <div className="bg-zinc-950 rounded-lg p-2 sm:p-2.5 border-2 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col items-center">
              
              <div className="w-full flex justify-between items-center mb-1 px-1">
                <span className="font-mono text-[8px] sm:text-[9px] tracking-widest text-zinc-300 uppercase font-extrabold truncate">STEREO CASSETTE RECORDER</span>
                <span className="font-mono text-[7px] sm:text-[8px] text-amber-400 font-bold shrink-0">AUTO STOP</span>
              </div>

              {/* Glass Cassette Chamber */}
              <div className="w-full bg-zinc-900/90 rounded border-2 border-zinc-700 p-1.5 sm:p-2 relative shadow-inner aspect-[2.4/1] flex flex-col justify-between overflow-hidden">
                
                {/* Cassette Label */}
                <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 rounded p-1 border border-amber-300 flex justify-between items-center text-zinc-900 shadow-sm">
                  <div className="font-mono text-[8px] sm:text-[9px] font-extrabold uppercase">SIDE A</div>
                  <div className="font-[Gloria_Hallelujah,cursive,sans-serif] text-xs text-blue-900 truncate max-w-[60%] font-bold">
                    {memory?.title || 'Nostalgic Mixtape'}
                  </div>
                  <div className="font-mono text-[7px] sm:text-[8px] text-zinc-700 font-bold">60 MIN</div>
                </div>

                {/* Cassette Tape Spools Window */}
                <div className="bg-zinc-950 rounded h-9 sm:h-10 my-0.5 flex justify-between items-center px-4 sm:px-5 relative border border-zinc-800 shadow-inner">
                  {/* Left Reel */}
                  <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center relative shadow"
                  >
                    <div className="w-1 h-4 sm:h-5 bg-zinc-950 absolute" />
                    <div className="h-1 w-4 sm:w-5 bg-zinc-950 absolute" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white z-10" />
                  </motion.div>

                  {/* Tape Spool Line */}
                  <div className="flex-1 mx-2 sm:mx-3 h-[2px] bg-amber-900/60 relative flex items-center justify-center">
                    <div className="w-8 sm:w-10 h-4 sm:h-5 border border-zinc-700 rounded-sm bg-zinc-950/90" />
                  </div>

                  {/* Right Reel */}
                  <motion.div 
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center relative shadow"
                  >
                    <div className="w-1 h-4 sm:h-5 bg-zinc-950 absolute" />
                    <div className="h-1 w-4 sm:w-5 bg-zinc-950 absolute" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white z-10" />
                  </motion.div>
                </div>

                {/* Golden Dynamic Bass Boost Badge & BASS Toggle */}
                <div className="flex justify-between items-center px-1">
                  <span className="font-mono text-[8px] sm:text-[9px] font-extrabold tracking-widest text-amber-400 uppercase truncate">
                    DYNAMIC BASS BOOST
                  </span>
                  
                  {/* BASS Switch Toggle */}
                  <button 
                    onClick={() => setBassBoost(!bassBoost)}
                    className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-[7px] sm:text-[8px] font-mono shrink-0"
                    title="Toggle Bass Boost"
                  >
                    <span className="text-zinc-400">BASS</span>
                    <span className={`w-2 h-2 rounded-xs ${bassBoost ? 'bg-red-500' : 'bg-zinc-700'}`} />
                  </button>
                </div>

              </div>

            </div>

            {/* LCD Digital Song Metadata Display */}
            <div className="w-full bg-zinc-950 rounded-md p-2 sm:p-2.5 font-mono text-emerald-400 shadow-inner border border-zinc-800">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[8px] sm:text-[9px] uppercase text-emerald-600 tracking-widest font-extrabold">● NOW PLAYING</span>
                <span className="text-[10px] sm:text-xs text-emerald-400 font-bold">{formatTime(progress)} / {formatTime(duration)}</span>
              </div>
              
              <div className="text-xs sm:text-sm font-extrabold truncate text-emerald-300" title={displayTitle}>
                {displayTitle}
              </div>
              
              <div className="text-[10px] sm:text-[11px] text-emerald-500 truncate mt-0.5" title={displayArtist}>
                {displayArtist}
              </div>

              {/* Progress Seek Bar */}
              <div
                onClick={handleSeekClick}
                onTouchStart={handleSeekClick}
                className="w-full h-2 bg-zinc-900 mt-1.5 sm:mt-2 rounded-full overflow-hidden cursor-pointer relative border border-zinc-800 hover:border-emerald-500 transition-colors"
                title="Tap or click to seek position"
              >
                <div 
                  className="h-full bg-emerald-400 transition-all duration-150 shadow-[0_0_8px_#34d399]" 
                  style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

          </div>

          {/* Right Speaker Compartment (Desktop) & Volume/Tone controls */}
          <div className="w-full md:col-span-3 flex flex-col items-center justify-center p-2 sm:p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 shadow-inner">
            <div className={`hidden md:flex w-28 h-28 md:w-32 md:h-32 rounded-full bg-zinc-900 border-4 border-zinc-700 shadow-xl items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:4px_4px] opacity-80" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border-2 border-zinc-600 shadow-inner flex items-center justify-center z-10">
                <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-700 shadow-md" />
              </div>
            </div>

            {/* Dials: Volume & Tone */}
            <div className="w-full flex justify-around items-center bg-zinc-900 rounded p-1.5 border border-zinc-800">
              
              {/* Volume Dial */}
              <div className="flex flex-col items-center gap-0.5">
                <div 
                  onClick={() => setVolume(v => (v >= 100 ? 0 : v + 25))}
                  title={`Volume: ${volume}% (Tap to change)`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-950 shadow-md border-2 border-zinc-600 flex justify-center cursor-pointer relative select-none hover:border-amber-400 transition-colors"
                >
                  <div 
                    className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-amber-400 rounded-full mt-0.5 transition-transform duration-200 origin-bottom"
                    style={{ transform: `rotate(${(volume / 100) * 270 - 135}deg)` }}
                  />
                </div>
                <span className="text-[7px] sm:text-[8px] font-mono text-zinc-300 font-bold uppercase tracking-tighter">
                  VOL: {volume}%
                </span>
              </div>

              {/* Tone Dial */}
              <div className="flex flex-col items-center gap-0.5">
                <div 
                  onClick={() => setTone(t => (t >= 100 ? 0 : t + 25))}
                  title={`Tone: ${tone}% (Tap to change)`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-950 shadow-md border-2 border-zinc-600 flex justify-center cursor-pointer relative select-none hover:border-amber-400 transition-colors"
                >
                  <div 
                    className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-amber-400 rounded-full mt-0.5 transition-transform duration-200 origin-bottom"
                    style={{ transform: `rotate(${(tone / 100) * 270 - 135}deg)` }}
                  />
                </div>
                <span className="text-[7px] sm:text-[8px] font-mono text-zinc-300 font-bold uppercase tracking-tighter">
                  TONE: {tone}%
                </span>
              </div>

            </div>

            {/* Retro Indian Branding Badge */}
            <div className="mt-1.5 sm:mt-2.5 text-center">
              <div className="font-mono text-[10px] sm:text-xs font-extrabold tracking-[0.15em] sm:tracking-[0.2em] text-zinc-200 uppercase">PHILIPS</div>
              <div className="font-mono text-[7px] sm:text-[8px] tracking-wider text-zinc-400 font-bold uppercase">MADE IN INDIA</div>
            </div>

          </div>

        </div>

        {/* External Platform Links */}
        {currentTrack && (
          <div className="w-full border-t border-zinc-800 pt-2.5 mt-3 flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[8px] sm:text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Listen on platforms</span>
            <div className="flex flex-wrap gap-1.5">
              {currentTrack.links?.youtube && (
                 <a href={currentTrack.links.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 transition-colors text-[9px] font-medium border border-zinc-800">
                   <ExternalLink size={9} /> YouTube
                 </a>
              )}
              {currentTrack.links?.ytmusic && (
                 <a href={currentTrack.links.ytmusic} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-red-500 transition-colors text-[9px] font-medium border border-zinc-800">
                   <ExternalLink size={9} /> YT Music
                 </a>
              )}
              {currentTrack.links?.spotify && (
                 <a href={currentTrack.links.spotify} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-green-500 transition-colors text-[9px] font-medium border border-zinc-800">
                   <ExternalLink size={9} /> Spotify
                 </a>
              )}
              {currentTrack.links?.jiosaavn && (
                 <a href={currentTrack.links.jiosaavn} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors text-[9px] font-medium border border-zinc-800">
                   <ExternalLink size={9} /> JioSaavn
                 </a>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
