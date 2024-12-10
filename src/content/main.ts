import ytdl from 'ytdl-core'

import message from 'chromeLibs/message'

import workerRequest from 'common/workerRequest'

import config from 'content/config'
import { addTargetClass, removeTargetClass } from 'content/manipulate'
import { urlMatch } from 'content/helpers'
import setRuntimeMessage from 'content/runtimeMessage'

import 'css/content.css'

function addVideoIdTargets(videoIdTargets: VideoIdTargets, videoId: string, element: Element, manipulate: manipulationConfig.Manipulate): void {
  if (!videoIdTargets[videoId]) {
    videoIdTargets[videoId] = []
  } 
 
  videoIdTargets[videoId].push({
    element,
    manipulate
  })
}

// TODO url忠のidと取得結果のidが一致しているかチェック
function findTasks(videoIdTargets: VideoIdTargets): Promise<null> {
  return new Promise(async (resolve, reject) => {
    const videoIds = Object.getOwnPropertyNames(videoIdTargets)

    if (videoIds.length === 0) {
      return resolve(null)
    }

    const tasks = await workerRequest.getTasksByIds(videoIds)

    tasks.forEach((task: youtubeDlWorkerServer.Task) => {
      const id: string = task.id
      if (!videoIdTargets[id]) {
        return
      }

      videoIdTargets[id].forEach((manipulateElement: ManipulateElement) => {
	addTargetClass(manipulateElement)
      })
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

  // TODO tab change
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

	      removeTargetClass(target, manipulate);

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

findManipulateTargetsOnLoad(config)
setObserver(config)
setRuntimeMessage()
