import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration_sec: number | null;
  file_url: string;
  cover_url: string | null;
  plays: number;
  uploader?: string;
}

interface PlayerContextType {
  tracks: Track[];
  setTracks: (t: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  eq: number[];
  isFullOpen: boolean;
  play: (track: Track) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (pct: number) => void;
  setVolume: (v: number) => void;
  setEq: (bands: number[]) => void;
  setIsFullOpen: (v: boolean) => void;
  elapsed: number;
  duration: number;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
};

const EQ_BANDS = [60, 170, 350, 1000, 3500, 10000];

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(75);
  const [eq, setEqState] = useState<number[]>(Array(EQ_BANDS.length).fill(0));
  const [isFullOpen, setIsFullOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Init Audio API
  const initAudio = (audio: HTMLAudioElement) => {
    if (audioCtxRef.current) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;
    const gain = ctx.createGain();
    gainRef.current = gain;
    gain.gain.value = volume / 100;

    const filters = EQ_BANDS.map((freq, i) => {
      const f = ctx.createBiquadFilter();
      f.type = i === 0 ? "lowshelf" : i === EQ_BANDS.length - 1 ? "highshelf" : "peaking";
      f.frequency.value = freq;
      f.gain.value = 0;
      return f;
    });
    filtersRef.current = filters;

    let prev: AudioNode = source;
    filters.forEach((f) => { prev.connect(f); prev = f; });
    prev.connect(gain);
    gain.connect(ctx.destination);
  };

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setElapsed(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    });
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => next());

    return () => { audio.pause(); };
  }, []);

  const play = (track: Track) => {
    const audio = audioRef.current!;
    if (!audioCtxRef.current) initAudio(audio);
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
    audio.src = track.file_url;
    audio.load();
    audio.play().catch(() => {});
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setElapsed(0);
  };

  const togglePlay = () => {
    const audio = audioRef.current!;
    if (!currentTrack) return;
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().catch(() => {}); setIsPlaying(true); }
  };

  const next = () => {
    if (!currentTrack || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    play(tracks[(idx + 1) % tracks.length]);
  };

  const prev = () => {
    if (!currentTrack || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    play(tracks[(idx - 1 + tracks.length) % tracks.length]);
  };

  const seek = (pct: number) => {
    const audio = audioRef.current!;
    if (audio.duration) {
      audio.currentTime = (pct / 100) * audio.duration;
      setProgress(pct);
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (gainRef.current) gainRef.current.gain.value = v / 100;
    if (audioRef.current) audioRef.current.volume = v / 100;
  };

  const setEq = (bands: number[]) => {
    setEqState(bands);
    filtersRef.current.forEach((f, i) => { f.gain.value = bands[i]; });
  };

  return (
    <PlayerContext.Provider value={{
      tracks, setTracks, currentTrack, isPlaying, progress, volume, eq,
      isFullOpen, play, togglePlay, next, prev, seek, setVolume, setEq,
      setIsFullOpen, elapsed, duration,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
