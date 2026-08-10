export interface Track {
  id: string;
  title: string;
  artist: string;
  year?: number;
  memoryId: string;
  playlistUrl: string; // The playlist link for this memory
  links: {
    spotify?: string;
    jiosaavn?: string;
    ytmusic?: string;
    youtube?: string;
  };
}

// 8 Memories mapped directly to active YouTube Playlists
export const PLAYLISTS: Record<string, { playlistUrl: string; title: string; artist: string }> = {
  rain: {
    playlistUrl: 'https://www.youtube.com/playlist?list=PLLBpg_1JUZJhTTHKCRgx4eVjILzqLi1VW',
    title: 'Brishtir Shondhya Playlist',
    artist: 'Various Artists'
  },
  mela: {
    playlistUrl: 'https://www.youtube.com/playlist?list=PLIiakG8clv_g',
    title: 'Melar Shondhya Hits',
    artist: 'Bengali Folk & Classics'
  },
  wedding: {
    playlistUrl: 'https://www.youtube.com/playlist?list=PLSM1cw8guacYxjhZEE9-Y7tNLGMdQAJ7w',
    title: 'Biye Bari Shehnai & Classics',
    artist: 'Traditional & Wedding Hits'
  },
  bus: {
    playlistUrl: 'https://www.youtube.com/playlist?list=PLG3xgeEVSqWM',
    title: 'Bus Journey Memories',
    artist: 'Golden Travel Hits'
  },
  tea: {
    playlistUrl: 'https://www.youtube.com/playlist?list=PL88E8C45077E2CA50',
    title: 'Cha-er Dokan Adda Songs',
    artist: 'Manna Dey, Kabir Suman, Anjan Dutt'
  },
  radio: {
    playlistUrl: 'https://www.youtube.com/playlist?list=PLfaJs0XpWqK0',
    title: 'Dadu-r Radio Classics',
    artist: 'Classic Akashbani Melodies'
  },
  remake: {
    playlistUrl: 'https://www.youtube.com/playlist?list=PLtgWTUdMPxCNhfFOxCw_8_K9aCU4vRVHo',
    title: 'Old Bengali Remake Hits',
    artist: 'Retro Reimagined & Melancholy'
  },
  childhood: {
    playlistUrl: 'https://www.youtube.com/playlist?list=PLe4_tU5ubI_Y',
    title: 'Chhotobelar Din Hits',
    artist: 'Childhood Sunday Classics'
  }
};

export const TRACKS: Track[] = Object.entries(PLAYLISTS).map(([memoryId, info]) => ({
  id: memoryId,
  title: info.title,
  artist: info.artist,
  memoryId: memoryId,
  playlistUrl: info.playlistUrl,
  links: {
    youtube: info.playlistUrl,
    ytmusic: info.playlistUrl
  }
}));
