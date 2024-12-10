import ytdl from 'ytdl-core'

import storage from 'chromeLibs/storage'

function get(path: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')
    const url: string = `http://localhost:${preference.port}${path}`

    const options = {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json"
      })
    }

    try {
      const response: Response = await fetch(url, options)
      if (response.ok) {
        resolve(response.json())
      } else {
        resolve(new Error(`request failed (path: ${path})`))
      } 
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

function post(path: string, values: youtubeDlWorkerServer.PostRequestData = null): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')
    const url: string = `http://localhost:${preference.port}${path}`

    const options = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(values)
    }

    try {
      const response: Response = await fetch(url, options)
      if (response.ok) {
        resolve(response.json())
      } else {
        resolve(new Error(`request failed (path: ${path})`))
      } 
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

function isTask(data: youtubeDlWorkerServer.ResponseData): data is youtubeDlWorkerServer.Task {
  return data !== null && data !== undefined &&
         typeof data === 'object' && !Array.isArray(data) && 
         data.id !== undefined && typeof data.id === 'string' &&
         data.video_format !== undefined && typeof data.video_format === 'string' &&
         data.audio_format !== undefined && typeof data.audio_format === 'string' &&
         data.url !== undefined && typeof data.url === 'string' &&
         data.title !== undefined && typeof data.title === 'string' &&
         data.output_directory !== undefined && typeof data.output_directory === 'string' &&
         data.filename !== undefined && typeof data.filename === 'string' &&
         data.parameter !== undefined && typeof data.parameter === 'string'
}

function isTasks(data: youtubeDlWorkerServer.ResponseData): data is youtubeDlWorkerServer.Task[] {
  return data !== null && data !== undefined &&
         typeof data == 'object' && Array.isArray(data) && 
         (data.length === 0 ? true : isTask(data[0]))
}

function isFailedTask(data: youtubeDlWorkerServer.ResponseData): data is youtubeDlWorkerServer.FailedTask {
  return data !== null && data !== undefined &&
         typeof data === 'object' && !Array.isArray(data) && 
         data.id !== undefined && typeof data.id === 'string' &&
         data.video_format !== undefined && typeof data.video_format === 'string' &&
         data.audio_format !== undefined && typeof data.audio_format === 'string' &&
         data.url !== undefined && typeof data.url === 'string' &&
         data.title !== undefined && typeof data.title === 'string' &&
         data.output_directory !== undefined && typeof data.output_directory === 'string' &&
         data.output_filename !== undefined && typeof data.output_filename === 'string' &&
         data.parameter !== undefined && typeof data.parameter === 'string' &&
         data.failed_at !== undefined && typeof data.failed_at === 'number'
}

function isFailedTasks(data: youtubeDlWorkerServer.ResponseData): data is youtubeDlWorkerServer.FailedTask[] {
  return typeof data == 'object' && Array.isArray(data) && 
         (data.length === 0 ? true : isFailedTask(data[0]))
}

function replaceEscapeCharacters(str: string) {
  // Windows/MacOS/Unix file name limitations
  // /\?*:|"<>.
  // https://en.wikipedia.org/wiki/Filename
  let replacedStr: string = 
     str.replace(/\\\\u0026/, '＆')
        .replace(/\n/g, ' ')
        .replace(/%/g, '％')
        .replace(/\+/g, '＋')
        .replace(/\//g, '／')
        .replace(/\\/g, '￥')
        .replace(/\?/g, '？')
        .replace(/:/g, '：')
        .replace(/\|/g, '｜')
        .replace(/\¿/g, '-')
        .replace(/[\*]/g, '^')
        .replace(/[\"]/g, "'")
        .replace(/[\<]/g, '[')
        .replace(/[\>]/g, ']')

  if (navigator.userAgent.indexOf("Win") >= 0) {
    return replacedStr.replace(/\\/, '￥')
  } else {
    return replacedStr
  }
}

export function checkRunningWorker(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const response: youtubeDlWorkerServer.Response = await get('/health')

      if (response.error !== "") {
        reject(response.error)
      } else {
        resolve(typeof response.data === 'string' && response.data === 'ok')
      }
    } catch (err) {
      resolve(false)
    }
  })
}

export function getTasks(): Promise<youtubeDlWorkerServer.Task[]> {
  return new Promise(async (resolve, reject) => {
    const response: youtubeDlWorkerServer.Response = await get('/tasks')

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

export function getTasksByIds(ids: string[]): Promise<youtubeDlWorkerServer.Task[]> {
  return new Promise(async (resolve, reject) => {
    if (ids.length == 0) {
      return resolve([])
    }

    const response: youtubeDlWorkerServer.Response = await post('/tasks', ids)

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

export function addQueue(videoAudioFormat: VideoAudioFormat, videoInfo: ytdl.videoInfo): Promise<youtubeDlWorkerServer.Task> {
  return new Promise(async (resolve, reject) => {
    const preference: Preference = await storage.get('preference')

    const { videoFormat, audioFormat } = videoAudioFormat
    const { videoDetails } = videoInfo
    const title: string = videoDetails.title 

    // Windows/MacOS/Unix file name limitations
    // /\?*:|"<>.
    // https://en.wikipedia.org/wiki/Filename
    const replacedTitle: string = replaceEscapeCharacters(title)

    let filename: string = `${replacedTitle}.${videoFormat.container}` 
    if (preference.output_format && preference.output_format !== '') {
      filename = preference.output_format
                           .replace('[id]', videoDetails.videoId)
                           .replace('[title]', replacedTitle)
                           .replace('[ext]', videoFormat.container)
                           .replace('[author]', replaceEscapeCharacters(videoDetails.ownerChannelName))
                           .replace('[width]', videoFormat.width)
                           .replace('[height]', videoFormat.height)
                           .replace('[qualityLabel]', videoFormat.qualityLabel)
                           .replace('[resolution]', videoFormat.qualityLabel)
    }

    const separator = (navigator.userAgent.indexOf("Win") >= 0) ? "\\" : "/"

    // youtube-dlは「p」は使わない
    const requestData: youtubeDlWorkerServer.AddQueueRequestData = {
      url: videoDetails.video_url,
      title,
      video_format: videoFormat ? String(videoFormat.itag) : '',
      audio_format: audioFormat ? String(audioFormat.itag) : '',
      output_directory: preference.output_directory,
      filename,
      parameter: preference.youtubedl_parameter
    }

    const response: youtubeDlWorkerServer.Response = await post('/add_queue', requestData)

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

export function removeQueue(id: string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const response: youtubeDlWorkerServer.Response = await post(`/remove_queue/${id}`)

    if (response.error !== "") {
      return reject(response.error)
    }

    if (response.error !== "") {
      reject(response.error)
    } else {
      resolve(typeof response.data === 'string' && response.data === 'success')
    }
  })
}

export default {
  checkRunningWorker,
  getTasks,
  getTasksByIds,
  addQueue,
  removeQueue
}
