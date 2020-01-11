import ytdl from 'ytdl-core'

import storage from 'chromeLibs/storage'

const livingCacheTime = 1000 * 60 * 60;

interface PriorityConfig {
  containers: string[];
  order: 'high';
}

export function getInfo(url: string): Promise<ytdl.videoInfo | Error> {
  return new Promise(async (resolve, reject) => {
    const videoId = ytdl.getVideoID(url)
    const storageId = `youtube_dl#${videoId}`

    // 有効なキャッシュがあればそちらを使用
    const videoInfoCache: VideoInfoCache | null = await storage.get(storageId)
    if (videoInfoCache && videoInfoCache.lastUpdate + livingCacheTime >= Date.now()) {
      return resolve(videoInfoCache.videoInfo)
    }

    const videoInfo: ytdl.videoInfo = await ytdl.getInfo(url)
    if (!videoInfo || videoInfo.status != 'ok') {
      reject(new Error('cannot get videoInfo'))
    }

    const newVideoInfoCache: VideoInfoCache = {
      videoInfo,
      lastUpdate: Date.now()
    }

    const result = await storage.setByKey(storageId, newVideoInfoCache)
    if (result) {
      resolve(newVideoInfoCache.videoInfo)
    } else {
      reject(new Error('cannot get videoInfo'))
    }
  })
}

export function getFormatsFromUrl(url: string): Promise<ytdl.videoFormat[] | Error> {
  return new Promise(async (resolve, reject) => {
    const videoInfo: ytdl.videoInfo | Error = await getInfo(url)
    if (videoInfo instanceof Error) {
      reject(videoInfo)
    } else {
      resolve(videoInfo.formats)
    }
  })
}

export function getMaxPriorityFormat(videoInfo: ytdl.videoInfo): Promise<VideoAudioFormat> {
  return new Promise(async (resolve, reject) => {
    // TODO configから取得する
    //const priorityConfig: PriorityConfig = await storage.get('priority_config')
    const priorityConfig: PriorityConfig = {
      containers: ['mp4', 'webm'],
      order: 'high'
    }

    const descOrder = priorityConfig.order == 'high'

    const sortedVideoFormats = videoInfo.formats
      .filter((videoFormat: ytdl.videoFormat) => videoFormat.bitrate !== null)
      .sort((a: ytdl.videoFormat, b: ytdl.videoFormat): number => {
        if (a.container !== b.container) {
          let aContainerIndex: number = 0
          let bContainerIndex: number = 0
          priorityConfig.containers.forEach((container: string, index: number): void => {
            if (container == a.container) {
              aContainerIndex = index
            }
            if (container == b.container) {
              bContainerIndex = index
            }
          })

          return descOrder ? aContainerIndex - bContainerIndex : bContainerIndex - aContainerIndex
        } else {
          return parseInt(b.qualityLabel) - parseInt(a.qualityLabel)
        }
      })

    resolve(await createVideoAudioFormat(sortedVideoFormats[0], videoInfo))
  })
}

export function getMaxPriorityFormatFromUrl(url: string): Promise<VideoAudioFormat> {
  return new Promise(async (resolve, reject) => {
    const videoInfo: ytdl.videoInfo | Error = await getInfo(url)
    if (videoInfo instanceof Error) {
      return reject(null)
    } else {
      resolve(getMaxPriorityFormat(videoInfo))
    }
  })
}

export function createVideoAudioFormat(videoFormat: ytdl.videoFormat, videoInfo: ytdl.videoInfo): Promise<VideoAudioFormat> {
  return new Promise(resolve => {
    // when video + audio format
    if (videoFormat.audioSampleRate !== undefined) {
      return resolve({
        videoFormat,
        audioFormat: null
      })
    }

    const audioContainer: string = (videoFormat.container === 'webm') ? 'webm' : 'mp4'

    const sortedAudioFormats = videoInfo.formats
      .filter((format: ytdl.videoFormat) => format.audioQuality && format.quality === "tiny" && format.container == audioContainer)
      .sort((a: ytdl.videoFormat, b: ytdl.videoFormat): number => {
        return (a.audioQuality === b.audioQuality || a.audioQuality == 'ADIO_QUALITY_MEDIUM') ? -1 : 1
      })

    resolve({
      videoFormat,
      audioFormat: sortedAudioFormats[0]
    })
  })
}

export function getVideoTitleFromVideoInfo(videoInfo: ytdl.videoInfo): string {
  return videoInfo.player_response.videoDetails.title
}

export function saveVideoFormat(url: string, videoFormat: ytdl.videoFormat): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const videoId = ytdl.getVideoID(url)
    const storageId = `youtube_dl#${videoId}#queueFormat`

    resolve(await storage.setByKey(storageId, videoFormat))
  })
}

export function saveVideoFormatByParameter(url: string, itag: number, container: string): Promise<ytdl.videoFormat | Error> {
  return new Promise(async (resolve, reject) => {
    const formats = await getFormatsFromUrl(url)
    if (formats instanceof Error) {
      return reject(Error)
    }

    const targetFormats: ytdl.videoFormat[] = formats.filter((format: ytdl.videoFormat) => format.itag === itag && format.container === container)
    if (targetFormats.length == 0) {
      return reject(new Error('cannot found videoFormat'))
    } 

    const result = await saveVideoFormat(url, targetFormats[0])
    if (result) {
      resolve(targetFormats[0])
    } else {
      reject(new Error('cannot save format.'))
    }
  })
}
