"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { siteConfig } from '../siteConfig';

// 【增强版 LRC 歌词解析】
type LyricLine = { time: number; text: string };

type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  lrcUrl: string | null;
  lyrics: LyricLine[];
};

type RawSong = {
  id?: string | number;
  name?: string;
  artist?: string;
  author?: string;
  cover?: string;
  pic?: string;
  url?: string;
  lrcUrl?: string;
  lrc?: string;
  error?: unknown;
};

function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText || lrcText.length > 30000) return [];

  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];

  for (const line of lines) {
    const matches = [...line.matchAll(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g)];
    if (matches.length > 0) {
      const text = line.replace(/\[\d{2,}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

      // 剔除控制字符
      const cleanText = text.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "");

      if (cleanText) {
        for (const match of matches) {
          const min = parseInt(match[1]);
          const sec = parseInt(match[2]);
          const ms = match[3] ? parseInt(match[3]) : 0;
          const divisor = match[3] && match[3].length === 3 ? 1000 : 100;
          const time = min * 60 + sec + ms / divisor;
          result.push({ time, text: cleanText });
        }
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

// 🌟 1. 扩充 Context 类型，加入 MusicPage 需要的所有属性
type PlayMode = 'loop' | 'single' | 'random';

interface MusicContextType {
  playlist: Song[];
  currentIndex: number;
  currentSong?: Song; // 扩展了 lyrics 属性
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentLyric: string;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;

  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playSong: (index: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

const getRandomSongIndex = (length: number, currentIndex?: number) => {
  if (length <= 1) return 0;
  let nextIndex = Math.floor(Math.random() * length);
  if (currentIndex !== undefined && nextIndex === currentIndex) {
    nextIndex = (nextIndex + 1) % length;
  }
  return nextIndex;
};

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState("正在连接高可用神经云端...");
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 2. 新增音量和播放模式状态
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('loop');

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioErrorStreakRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const fetchMusicData = async () => {
      try {
        const musicProvider = siteConfig.musicProvider || 'netease';
        const query = new URLSearchParams(
          musicProvider === 'qq'
            ? {
                provider: 'qq',
                playlistId: siteConfig.qqMusicPlaylistId || '',
                playlistUrl: siteConfig.qqMusicPlaylistUrl || '',
              }
            : {
                ids: siteConfig.cloudMusicIds.join(','),
              }
        );

        const res = await fetch(`/api/music?${query.toString()}`);
        const rawResults: unknown = await res.json();
        const songs = Array.isArray(rawResults) ? rawResults as RawSong[] : [];

        const mergedPlaylist: Song[] = songs
          .filter((song) => song && song.url && !song.error)
          .map((song) => ({
            id: String(song.id || Math.random()),
            title: song.name || '未知歌曲',
            artist: song.artist || song.author || '未知歌手',
            cover: song.cover || song.pic || '/linx-style/crossing-sea.jpg',
            src: song.url,
            lrcUrl: song.lrcUrl || (typeof song.lrc === 'string' && song.lrc.startsWith('http') ? song.lrc : null),
            lyrics: song.lrc && !song.lrc.startsWith?.('http') ? parseLrc(song.lrc) : []
          }));

        if (isMounted) {
          if (mergedPlaylist.length > 0) {
            setPlaylist(mergedPlaylist);
            setCurrentIndex(getRandomSongIndex(mergedPlaylist.length));
          } else {
            setCurrentLyric("云端链路受阻");
          }
          setIsLoading(false);
        }
      } catch {
        if (isMounted) { setCurrentLyric("网络初始化失败"); setIsLoading(false); }
      }
    };

    if (siteConfig.musicProvider === 'qq' || siteConfig.cloudMusicIds?.length > 0) fetchMusicData();
    else queueMicrotask(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (playlist.length === 0) return;
    let isMounted = true;
    const currentSong = playlist[currentIndex];
    // Lyrics are synchronized to the selected song, including cached lyrics loaded from the API.
    setLyrics([]);
    setCurrentLyric("♪ 正在缓冲 ♪");
    if (currentSong.lyrics && currentSong.lyrics.length > 0) {
      if (isMounted) {
        setLyrics(currentSong.lyrics);
        setCurrentLyric(currentSong.lyrics[0]?.text || "\u266a \u7eaf\u4eab\u97f3\u4e50 \u266a");
      }
    } else if (currentSong.lrcUrl) {
      fetch(currentSong.lrcUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Lyric request failed: ${res.status}`);
          return res.text();
        })
        .then(text => {
          if (isMounted) {
             const parsed = parseLrc(text);
             setLyrics(parsed);
             setCurrentLyric(parsed[0]?.text || "\u266a \u7eaf\u4eab\u97f3\u4e50 \u266a");
             setPlaylist(prev => {
                const newPlaylist = [...prev];
                newPlaylist[currentIndex].lyrics = parsed;
                return newPlaylist;
             });
          }
        })
        .catch(() => { if (isMounted) setCurrentLyric("\u266a \u7eaf\u4eab\u97f3\u4e50 \u266a"); });
    } else {
      setCurrentLyric("\u266a \u7eaf\u4eab\u97f3\u4e50 \u266a");
    }

    if (isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsPlaying(false));
      }
    }
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, playlist.length]); // 移除 playlist 依赖防止无限循环，只依赖长度

  // 🌟 4. 同步音量到 audio 元素
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(!isPlaying);
    }
  };

  // 🌟 5. 重写 nextSong，加入对随机模式的处理
  const nextSong = () => {
    if (playMode === 'random') {
      setCurrentIndex((prev) => getRandomSongIndex(playlist.length, prev));
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const prevSong = () => {
    if (playMode === 'random') {
      setCurrentIndex((prev) => getRandomSongIndex(playlist.length, prev));
    } else {
      setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  // 🌟 6. 暴露直接播放指定歌曲的方法
  const playSong = (index: number) => {
    audioErrorStreakRef.current = 0;
    setCurrentIndex(index);
    if (!isPlaying) setIsPlaying(true); // 保证切歌后自动播放
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      if (currentTime > 0) audioErrorStreakRef.current = 0;
      setCurrentTime(currentTime);
      setDuration(duration || 0);
      setProgress((currentTime / (duration || 1)) * 100);

      if (lyrics.length > 0) {
        const activeLyric = lyrics.slice().reverse().find(l => currentTime >= l.time);
        if (activeLyric && activeLyric.text !== currentLyric) {
          setCurrentLyric(activeLyric.text);
        }
      }
    }
  };

  const handleCanPlay = () => {
    audioErrorStreakRef.current = 0;
  };

  // 🌟 7. 处理歌曲结束
  const handleEnded = () => {
    if (playMode === 'single' && audioRef.current) {
       audioRef.current.currentTime = 0;
       audioRef.current.play();
    } else {
       nextSong();
    }
  };

  const handleAudioError = () => {
    if (playlist.length <= 1) {
      setIsPlaying(false);
      setCurrentLyric("这首歌暂时无法播放");
      return;
    }

    audioErrorStreakRef.current += 1;
    setProgress(0);
    setCurrentTime(0);

    if (audioErrorStreakRef.current >= playlist.length) {
      setIsPlaying(false);
      setCurrentLyric("歌单里的歌曲暂时都无法播放");
      audioErrorStreakRef.current = 0;
      return;
    }

    setCurrentLyric("这首歌暂时无法播放，正在切下一首");
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (isMuted && val > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const togglePlayMode = () => {
    setPlayMode(prev => {
      if (prev === 'loop') return 'single';
      if (prev === 'single') return 'random';
      return 'loop';
    });
  };

  const currentSong = playlist[currentIndex];

  return (
    <MusicContext.Provider value={{
        playlist, currentIndex, currentSong, isPlaying, progress, currentTime, duration, currentLyric, isLoading,
        volume, isMuted, playMode, // 暴露新状态
        togglePlay, nextSong, prevSong, handleSeek,
        playSong, setVolume, toggleMute, togglePlayMode // 暴露新方法
    }}>
      {children}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.src}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded} // 使用我们重写的结束处理
          onError={handleAudioError}
          onCanPlay={handleCanPlay}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
};
