import ytdl from 'ytdl-core'

import message from 'chromeLibs/message'

import loadConfig from 'content/loadConfig'
import { urlMatch } from 'content/manipulate'

import 'css/content.css'

type ManipulateElement = {
  element: Element,
  manipulate: manipulationConfig.Manipulate
};

type VideoIdTargets = {
  [key: string]: ManipulateElement[];
};

function addVideoIdTargets(videoIdTargets: VideoIdTargets, videoId: string, element: Element, manipulate: manipulationConfig.Manipulate): void {
  if (!videoIdTargets[videoId]) {
    videoIdTargets[videoId] = []
  } 
 
  videoIdTargets[videoId].push({
    element,
    manipulate
  })
}

function addTargetClass(manipulateElement: ManipulateElement): void {
  const { element, manipulate } = manipulateElement

  manipulate.currents.forEach((targetAction: manipulationConfig.TargetAction) => {
    if (!element.parentNode) {
      return
    }

    if (targetAction.selector && element.parentNode.querySelector(targetAction.selector) !== element) {
      return
    }

    element.classList.add('youtube-dl-queueing')
  })

  manipulate.children.forEach((targetAction: manipulationConfig.TargetAction) => {
    if (!targetAction.selector) {
      return
    }

    Array.from(element.querySelectorAll(targetAction.selector)).forEach((child: Element) => {
      child.classList.add('youtube-dl-queueing')
    })
  })
}

function findTasks(videoIdTargets: VideoIdTargets): Promise<null> {
  return new Promise(async (resolve, reject) => {
    const videoIds = Object.getOwnPropertyNames(videoIdTargets)

    if (videoIds.length === 0) {
      return resolve(null)
    }

    const messageData: RuntimeMessage = {
      type: 'getTasksByIds',
      data: videoIds
    }

    const tasks = await message.send(messageData)

    tasks.forEach((task: youtubeDlNativeMessage.Task) => {
      const id: string = task.id
      if (!videoIdTargets[id]) {
        return
      }

      videoIdTargets[id].forEach((manipulateElement: ManipulateElement) => addTargetClass(manipulateElement))
    })

    resolve(null)
  })
}

// onload時のみ実行
function findManipulateTargetsOnLoad(config: manipulationConfig.ManipulationConfig): void {
  const videoIdTargets: VideoIdTargets = {};

  config.manipulates.forEach((manipulate: manipulationConfig.Manipulate): void => {
    document.querySelectorAll(manipulate.query).forEach((element: Element) => {
       const videoId = urlMatch(element, config, manipulate)
       if (!videoId) {
         return
       }

       addVideoIdTargets(videoIdTargets, videoId, element, manipulate)
    }) 
  })

  findTasks(videoIdTargets)
}

// 後で移動
function findManipulateTargets(config: manipulationConfig.ManipulationConfig, records: MutationRecord[]): void {
  const videoIdTargets: VideoIdTargets = {};

  records.forEach((record: MutationRecord) => {
    const { target } = record

    config.manipulates
          .filter((manipulate: manipulationConfig.Manipulate) => manipulate.observers.length > 0)
          .forEach((manipulate: manipulationConfig.Manipulate) => {
            const { query, attributeName } = manipulate

            switch (record.type) {
            case "childList":
              if (!(target instanceof Element)) {
                return
              }

              record.addedNodes.forEach((node: Node): void => {
                if (!(node instanceof Element)) {
                  return
                }

                node.querySelectorAll(query).forEach((element: Element): void => {
                  const videoId = urlMatch(element, config, manipulate)
                  if (!videoId) {
                    return
                  }

                  addVideoIdTargets(videoIdTargets, videoId, element, manipulate)
                })
              })

              // 削除は特に対応必要なし

              break
            case "attributes":
              if (!(target instanceof Element) || !target.matches(query) || attributeName != record.attributeName) {
                return
              }
  
              target.classList.remove('youtube-dl-queueing')
              Array.from(target.querySelectorAll('youtube-dl-queueing')).forEach(element => {
                element.classList.remove('youtube-dl-queueing')
              })

              const videoId = urlMatch(target, config, manipulate)
              if (!videoId) {
                return
              }

              addVideoIdTargets(videoIdTargets, videoId, target, manipulate)

              break
            }
          })
  })

  // current, parent, children単位で処理する
  findTasks(videoIdTargets)
} 

const setObserver = (config: manipulationConfig.ManipulationConfig) => {
  const configObserver = new MutationObserver((records: MutationRecord[], observer: MutationObserver) => findManipulateTargets(config, records))

  const options = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true
  }

  configObserver.observe(document.body, options)
}

const config: manipulationConfig.ManipulationConfig = loadConfig()

findManipulateTargetsOnLoad(config)
setObserver(config)
