
export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
  duration: number;
}

export interface AISuggestion {
  title: string;
  reason: string;
  mood: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrackIndex: number;
  progress: number;
  volume: number;
}
