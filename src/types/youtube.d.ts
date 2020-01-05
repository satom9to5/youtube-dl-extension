interface VideoInfoCache {
  videoInfo: ytdl.videoInfo;
  lastUpdate: number;
}

interface VideoAudioFormat {
  videoFormat: ytdl.videoFormat | null;
  audioFormat: ytdl.videoFormat | null; 
}

