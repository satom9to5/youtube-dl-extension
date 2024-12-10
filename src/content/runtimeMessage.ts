import config from 'content/config'
import { addTargetClass } from 'content/manipulate'
import { urlMatch } from 'content/helpers'

interface MessageListenerMethods {
  [key: string]: Function;
}

const messageListenerMethods: MessageListenerMethods = {
  addQueueSuccess: (url: string) => {
    if (!(config.url) || !(config.url.regexp) || !(config.url.matchnum)) {
      return
    }

    const matches = url.match(config.url.regexp)
    if (!matches || matches.length == 0) {
      return
    }

    config.manipulates.forEach((manipulate: manipulationConfig.Manipulate): void => {
      let query: string = manipulate.query
      if (query == 'a') {
        query = `a[${manipulate.attributeName}*='${matches[0]}'`
      }

      const videoId = matches[config.url.matchnum]

      document.querySelectorAll(query).forEach((element: Element) => {
        if (manipulate.query != 'a') {
          const pageVideoId = urlMatch(element, config, manipulate)
          if (!pageVideoId || videoId != pageVideoId) {
            return
          }
        }

        addTargetClass({
          element,
          manipulate
        })
      }) 
    })
  }
}

export default function() {
  chrome.runtime.onMessage.addListener((message: FromRuntimeMessage, sender: chrome.runtime.MessageSender, res) => {
    if (messageListenerMethods.hasOwnProperty(message.type)) {
      messageListenerMethods[message.type](message.data)
    } else {
      console.error(`method: ${message.type} is not found.`)
    }
  })
}
