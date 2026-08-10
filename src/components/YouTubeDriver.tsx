import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: any }) => void;
            onStateChange?: (event: { data: number; target: any }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
  }
}

interface YouTubeDriverProps {
  playlistUrl: string;
  isPlaying: boolean;
  volume: number;
  seekTarget?: number | null;
  skipAction?: { type: 'next' | 'prev'; id: number } | null;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onTrackChange?: (info: { title: string; author: string }) => void;
}

function extractPlaylistId(url: string): string {
  if (!url) return 'PLLBpg_1JUZJhTTHKCRgx4eVjILzqLi1VW';
  const match = url.match(/[?&]list=([^#\&\?]+)/);
  return match ? match[1] : 'PLLBpg_1JUZJhTTHKCRgx4eVjILzqLi1VW';
}

export function YouTubeDriver({
  playlistUrl,
  isPlaying,
  volume,
  seekTarget,
  skipAction,
  onProgress,
  onEnded,
  onTrackChange
}: YouTubeDriverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const lastVideoIdRef = useRef<string>('');

  const playlistId = extractPlaylistId(playlistUrl);

  const checkVideoData = () => {
    if (playerRef.current && typeof playerRef.current.getVideoData === 'function') {
      try {
        const data = playerRef.current.getVideoData();
        if (data && data.title && data.video_id !== lastVideoIdRef.current) {
          lastVideoIdRef.current = data.video_id;
          onTrackChange?.({
            title: data.title,
            author: data.author || ''
          });
        }
      } catch {
        // ignore
      }
    }
  };

  // Load YouTube IFrame API script dynamically once
  useEffect(() => {
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YT.Player instance when API is ready or playlist changes
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore cleanup errors
        }
        playerRef.current = null;
      }

      const elemId = `yt-driver-${Math.random().toString(36).substring(2, 9)}`;
      const div = document.createElement('div');
      div.id = elemId;
      div.className = 'w-full h-full';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(elemId, {
        playerVars: {
          listType: 'playlist',
          list: playlistId,
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          showinfo: 0,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            try {
              event.target.setVolume(volume);
              if (isPlaying) {
                event.target.playVideo();
              }
              checkVideoData();
            } catch {
              // ignore
            }
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            checkVideoData();
            if (window.YT && event.data === window.YT.PlayerState.ENDED) {
              onEnded?.();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          initPlayer();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      isMounted = false;
    };
  }, [playlistId]);

  // Sync skip action (next / prev video in YouTube playlist)
  useEffect(() => {
    if (!playerRef.current || !skipAction) return;
    try {
      if (skipAction.type === 'next' && typeof playerRef.current.nextVideo === 'function') {
        playerRef.current.nextVideo();
      } else if (skipAction.type === 'prev' && typeof playerRef.current.previousVideo === 'function') {
        playerRef.current.previousVideo();
      }
    } catch {
      // ignore
    }
  }, [skipAction]);

  // Sync play / pause state
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {
      // ignore
    }
  }, [isPlaying]);

  // Sync volume state
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(volume);
      }
    } catch {
      // ignore
    }
  }, [volume]);

  // Sync seeking state
  useEffect(() => {
    if (!playerRef.current || seekTarget === null || seekTarget === undefined) return;
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seekTarget, true);
      }
    } catch {
      // ignore
    }
  }, [seekTarget]);

  // Poll current time, duration and video data directly from official API
  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            checkVideoData();
            const currentTime = playerRef.current.getCurrentTime() || 0;
            const duration = playerRef.current.getDuration() || 0;
            onProgress?.(currentTime, duration);
          } catch {
            // ignore
          }
        }
      }, 500);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, onProgress]);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-0 overflow-hidden z-0">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
