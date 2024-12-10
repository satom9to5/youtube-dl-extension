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
      temp_directory: preference.temp_directory,
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

export default {
  startWorker,
  stopWorker
}
