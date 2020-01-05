import ytdl from 'ytdl-core'

import nativeMessage from 'chromeLibs/nativeMessage'
import storage from 'chromeLibs/storage'

import browser from 'common/browser'

function nativeMessageKey(dev: boolean | null | undefined): string {
  //return dev ? 'youtube_dl_extension_dev' : 'youtube_dl_extension'
  return 'youtube_dl_extension'
}

export function startWorker(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')

    const requestData: youtubeDlNativeMessage.StartWorkerRequestData = {
      sqlite_path: preference.sqlite_path,
      pidfile_path: preference.pidfile_path,
      youtubedl_path: preference.youtubedl_path,
      ffmpeg_path: preference.ffmpeg_path,
      log_directory: preference.log_directory,
      browser: browser(),
      dev: preference.dev,
    }

    const response: youtubeDlNativeMessage.Response = await nativeMessage.send(nativeMessageKey(preference.dev), {
      type: 'startWorker',
      data: requestData
    })

    if (response.error !== "") {
      return reject(response.error)
    }

    resolve(true)
  })
}

export function stopWorker(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')

    const requestData: youtubeDlNativeMessage.StopWorkerRequestData = {
      pidfile_path: preference.pidfile_path,
    }

    const response: youtubeDlNativeMessage.Response = await nativeMessage.send(nativeMessageKey(preference.dev), {
      type: 'stopWorker',
      data: requestData
    })

    if (response.error !== "") {
      return reject(response.error)
    }

    if (response.data === null) {
      resolve(true)
    } else {
      reject('failed stop worker')
    }
  })
}

export function checkRunningWorker(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')

    const requestData: youtubeDlNativeMessage.CheckRunningWorkerRequestData = {
      pidfile_path: preference.pidfile_path
    }

    const response: youtubeDlNativeMessage.Response = await nativeMessage.send(nativeMessageKey(preference.dev), {
      type: 'checkRunningWorker',
      data: requestData
    })

    if (response.error !== "") {
      return reject(response.error)
    }

    if (typeof response.data == 'boolean') {
      resolve(response.data)
    } else {
      reject('response data is not boolean.')
    }
  })
}

export function addQueue(videoAudioFormat: VideoAudioFormat, videoInfo: ytdl.videoInfo): Promise<youtubeDlNativeMessage.Task> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')

    const { videoFormat, audioFormat } = videoAudioFormat
    const title: string = videoInfo.title 

    // Windows/MacOS/Unix file name limitations
    // /\?*:|"<>.
    // https://en.wikipedia.org/wiki/Filename
    const replacedTitle: string = title.replace(/\\\\u0026/, '＆')
                                       .replace(/\+/g, '＋')
                                       .replace(/\//g, '／')
                                       .replace(/\?/g, '？')
                                       .replace(/:/g, '：')
                                       .replace(/\|/g, '｜')
                                       .replace(/\¿/g, '-')
                                       .replace(/[\*]/g, '^')
                                       .replace(/[\"]/g, "'")
                                       .replace(/[\<]/g, '[')
                                       .replace(/[\>]/g, ']')

    let filename: string = `${replacedTitle}.${videoFormat.container}` 
    if (preference.output_format && preference.output_format !== '') {
      filename = preference.output_format
                           .replace('[id]', videoInfo.video_id)
                           .replace('[title]', replacedTitle)
                           .replace('[ext]', videoFormat.container)
                           .replace('[author]', videoInfo.player_response.videoDetails.author)
                           .replace('[width]', videoFormat.width)
                           .replace('[height]', videoFormat.height)
                           .replace('[resolution]', videoFormat.qualityLabel)
    } 

    const separator = (navigator.userAgent.indexOf("Win") >= 0) ? "\\" : "/"

    // youtube-dlは「p」は使わない
    const requestData: youtubeDlNativeMessage.AddQueueRequestData = {
      sqlite_path: preference.sqlite_path,
      url: videoInfo.video_url,
      title,
      video_format: videoFormat ? String(videoFormat.itag) : '',
      audio_format: audioFormat ? String(audioFormat.itag) : '',
      output_path: `${preference.output_directory}${separator}${filename}`,
      parameter: preference.youtubedl_parameter
    }

    const response: youtubeDlNativeMessage.Response = await nativeMessage.send(nativeMessageKey(preference.dev), {
      type: 'addQueue',
      data: requestData
    })

    if (response.error !== "") {
      return reject(response.error)
    }

    if (isTask(response.data)) {
      resolve(response.data)
    } else {
      reject('response data is wrong.')
    }
  })
}

export function getTasks(): Promise<youtubeDlNativeMessage.Task[]> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')

    const requestData: youtubeDlNativeMessage.GetTasksRequestData = {
      sqlite_path: preference.sqlite_path,
    }

    const response: youtubeDlNativeMessage.Response = await nativeMessage.send(nativeMessageKey(preference.dev), {
      type: 'getTasks',
      data: requestData
    })

    if (response.error !== "") {
      return reject(response.error)
    }

    if (isTasks(response.data)) {
      resolve(response.data)
    } else {
      reject('response data is wrong.')
    }
  })
}

export function getFailedTasks(): Promise<youtubeDlNativeMessage.FailedTask[]> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')

    const requestData: youtubeDlNativeMessage.GetFailedTasksRequestData = {
      sqlite_path: preference.sqlite_path,
    }

    const response: youtubeDlNativeMessage.Response = await nativeMessage.send(nativeMessageKey(preference.dev), {
      type: 'getFailedTasks',
      data: requestData
    })

    if (response.error !== "") {
      return reject(response.error)
    }

    if (isFailedTasks(response.data)) {
      resolve(response.data)
    } else {
      reject('response data is wrong.')
    }
  })
}

export function getTasksByIds(ids: string[]): Promise<youtubeDlNativeMessage.Task[]> {
  return new Promise(async (resolve, reject) => {
    if (ids.length == 0) {
      return resolve([])
    }

    const preference: Preference = await storage.get('preference')

    const requestData: youtubeDlNativeMessage.GetTasksByIdsRequestData = {
      sqlite_path: preference.sqlite_path,
      ids: ids
    }

    const response: youtubeDlNativeMessage.Response = await nativeMessage.send(nativeMessageKey(preference.dev), {
      type: 'getTasksByIds',
      data: requestData
    })

    if (response.error !== "") {
      return reject(response.error)
    }

    if (isTasks(response.data)) {
      resolve(response.data)
    } else {
      reject('response data is wrong.')
    }
  })
}

function isTask(data: youtubeDlNativeMessage.ResponseData): data is youtubeDlNativeMessage.Task {
  return data !== null && data !== undefined &&
         typeof data === 'object' && !Array.isArray(data) && 
         data.id !== undefined && typeof data.id === 'string' &&
         data.video_format !== undefined && typeof data.video_format === 'string' &&
         data.audio_format !== undefined && typeof data.audio_format === 'string' &&
         data.url !== undefined && typeof data.url === 'string' &&
         data.title !== undefined && typeof data.title === 'string' &&
         data.output_path !== undefined && typeof data.output_path === 'string' &&
         data.parameter !== undefined && typeof data.parameter === 'string'
}

function isTasks(data: youtubeDlNativeMessage.ResponseData): data is youtubeDlNativeMessage.Task[] {
  return data !== null && data !== undefined &&
         typeof data == 'object' && Array.isArray(data) && 
         (data.length === 0 ? true : isTask(data[0]))
}

function isFailedTask(data: youtubeDlNativeMessage.ResponseData): data is youtubeDlNativeMessage.FailedTask {
  return data !== null && data !== undefined &&
         typeof data === 'object' && !Array.isArray(data) && 
         data.id !== undefined && typeof data.id === 'string' &&
         data.video_format !== undefined && typeof data.video_format === 'string' &&
         data.audio_format !== undefined && typeof data.audio_format === 'string' &&
         data.url !== undefined && typeof data.url === 'string' &&
         data.title !== undefined && typeof data.title === 'string' &&
         data.output_path !== undefined && typeof data.output_path === 'string' &&
         data.parameter !== undefined && typeof data.parameter === 'string' &&
         data.failed_at !== undefined && typeof data.failed_at === 'number'
}

function isFailedTasks(data: youtubeDlNativeMessage.ResponseData): data is youtubeDlNativeMessage.FailedTask[] {
  return typeof data == 'object' && Array.isArray(data) && 
         (data.length === 0 ? true : isFailedTask(data[0]))
}

export default {
  startWorker,
  stopWorker,
  checkRunningWorker,
  addQueue,
  getTasks,
  getFailedTasks,
  getTasksByIds
}
