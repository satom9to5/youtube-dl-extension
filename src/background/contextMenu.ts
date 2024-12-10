import storage from 'chromeLibs/storage'
import tabs from 'chromeLibs/tabs'

import { getInfo, getMaxPriorityFormat } from 'common/youtubeFormat'
import workerRequest from 'common/workerRequest'
import workerMessage from 'common/workerMessage'
import browser from 'common/browser'
import { getCurrentTab } from 'common/tabs'
import { isWatchPage } from 'common/url'


function youtubeDlWorkerService(info: chrome.contextMenus.OnClickData): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    if (await workerRequest.checkRunningWorker()) { 
      if (await workerMessage.stopWorker()) {
        switchWorkerStatus(false)

        resolve(true)
      } else {
        resolve(false)
      }
    } else {
      if (await workerMessage.startWorker()) {
        switchWorkerStatus(true)

        resolve(true)
      } else {
        resolve(false)
      }
    } 
  })
}

function workerInfo(info: chrome.contextMenus.OnClickData): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const tab = await tabs.create({ url: 'static/info.html' })
    resolve(tab !== null)
  })
}

function youtubeDlWorkerAddMaxPriorityQueue(info: chrome.contextMenus.OnClickData): Promise<youtubeDlNativeMessage.Task> {
  return new Promise(async (resolve, reject) => {
    const url: string | undefined = info.linkUrl
    if (!url) {
      return reject('undefined url.')
    }

    const currentTab: chrome.tabs.Tab = await getCurrentTab();

    // 取得に必要な情報：動画基本情報と自動選択したフォーマット
    const videoInfo = await getInfo(url)
    if (videoInfo instanceof Error) {
      return reject(videoInfo)
    }
    //console.log(videoInfo)
    
    const title: string = videoInfo.videoDetails.title

    const maxPriorityFormat = await getMaxPriorityFormat(videoInfo)
    if (maxPriorityFormat.videoFormat == null) {
      return reject('cannot get video format.')
    }
    //console.log(maxPriorityFormat) 

    if (currentTab.id !== undefined && currentTab.url == info.pageUrl) {
      const message: FromRuntimeMessage = {
        type: 'addQueueSuccess',
        data: info.linkUrl
      }
      chrome.tabs.sendMessage(currentTab.id, message, res => {})
    }

    resolve(await workerRequest.addQueue(maxPriorityFormat, videoInfo))
  })
}

function switchWorkerStatus(isStart = true): void {
  if (isStart) {
    chrome.browserAction.setBadgeText({ text: "Start" })
    chrome.browserAction.setBadgeBackgroundColor({ color: "#00EE00" })
    chrome.contextMenus.update('youtube-dl-worker_service', { title: 'Stop youtube-dl-worker' })
  } else {
    chrome.browserAction.setBadgeText({ text: "Stop" })
    chrome.browserAction.setBadgeBackgroundColor({ color: "#EE0000" })
    chrome.contextMenus.update('youtube-dl-worker_service', { title: 'Start youtube-dl-worker' })
  }
}

function initializeByWorkerRunning(): Promise<null> {
  return new Promise(async (resolve, reject) => {
    if (await workerRequest.checkRunningWorker()) { 
      switchWorkerStatus(true)
    } 

    resolve(null)
  })
}

const contextMenuConfigs = [
  {
    id: 'youtube-dl-worker_service',
    type: 'normal',
    title: 'Start youtube-dl-worker',
    contexts: ['browser_action'], // page_action必要か？
    onclick: youtubeDlWorkerService
  },
  {
    id: 'youtube-dl-worker_info',
    type: 'normal',
    title: 'show youtube-dl-worker info',
    contexts: ['browser_action'], // page_action必要か？
    onclick: workerInfo
  },
  {
    id: 'youtube-dl-worker_add-queue-auto-max-priorty',
    type: 'normal',
    title: 'Queue youtube-dl (max priorty)',
    contexts: ['link'],
    onclick: youtubeDlWorkerAddMaxPriorityQueue,
    targetUrlPatterns: ["https://www.youtube.com/watch*"]
  },
]

export default function() {
  contextMenuConfigs.forEach((config: object): void => chrome.contextMenus.create(config))
  initializeByWorkerRunning()
}
