import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { usePlayer, type Track } from "@/context/PlayerContext";
import type { User } from "./AuthModal";

const TRACKS_URL = "https://functions.poehali.dev/af10f0ee-32ed-4912-9e76-1d5785b67d32";

const fmt = (s: number | null) => {
  if (!s) return "--:--";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

interface TrackCatalogProps {
  user: User | null;
  onUploadClick: () => void;
  refreshKey: number;
}

const TrackCatalog = ({ user, onUploadClick, refreshKey }: TrackCatalogProps) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, currentTrack, isPlaying, setTracks: setPlayerTracks } = usePlayer();

  useEffect(() => {
    setLoading(true);
    fetch(TRACKS_URL)
      .then((r) => r.json())
      .then((d) => {
        const list: Track[] = d.tracks || [];
        setTracks(list);
        setPlayerTracks(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Icon name="Music" size={28} className="text-red-500" />
              Каталог треков
            </h2>
            <p className="text-zinc-500 text-sm mt-1">{tracks.length} треков</p>
          </div>
          {user && (
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
            >
              <Icon name="Upload" size={16} />
              Загрузить трек
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={32} className="text-red-500 animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <Icon name="Music2" size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 mb-2">Каталог пуст</p>
            {user ? (
              <button onClick={onUploadClick} className="text-red-400 hover:text-red-300 text-sm transition-colors">
                Загрузите первый трек →
              </button>
            ) : (
              <p className="text-zinc-600 text-sm">Войдите, чтобы добавить треки</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, idx) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all group ${
                    isActive ? "bg-red-600/10 border border-red-500/20" : "hover:bg-white/5 border border-transparent"
                  }`}
                  onClick={() => play(track)}
                >
                  {/* Index / play icon */}
                  <div className="w-8 text-center shrink-0">
                    {isActive && isPlaying ? (
                      <div className="flex items-end justify-center gap-[2px] h-5">
                        {[1, 2, 3].map((b) => (
                          <div key={b} className="w-1 bg-red-500 rounded-sm animate-pulse" style={{ height: `${b * 5 + 5}px`, animationDelay: `${b * 0.1}s` }} />
                        ))}
                      </div>
                    ) : (
                      <span className={`text-sm ${isActive ? "text-red-400" : "text-zinc-600 group-hover:hidden"}`}>{idx + 1}</span>
                    )}
                    <Icon name="Play" size={16} className="text-white hidden group-hover:block mx-auto" />
                  </div>

                  {/* Cover */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-900 to-zinc-900 flex items-center justify-center">
                        <Icon name="Music2" size={14} className="text-white/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? "text-red-400" : "text-white"}`}>{track.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                  </div>

                  {/* Uploader */}
                  <span className="hidden md:block text-xs text-zinc-600 shrink-0">{track.uploader}</span>

                  {/* Duration */}
                  <span className="text-xs text-zinc-500 shrink-0 tabular-nums">{fmt(track.duration_sec)}</span>

                  {/* Plays */}
                  <div className="hidden sm:flex items-center gap-1 text-zinc-600 shrink-0">
                    <Icon name="Headphones" size={12} />
                    <span className="text-xs tabular-nums">{track.plays}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackCatalog;
