import workerMessage from 'common/workerMessage'

function isRuntimeMessage(message: any): message is RuntimeMessage {
  return message !== null && message !== undefined &&
         typeof message === 'object' && !Array.isArray(message) && 
         message.type !== undefined && typeof message.type === 'string'
}

export default function() {
  chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): any => {
    if (!isRuntimeMessage(message)) {
      return false
    } 

    switch (message.type) {
    case 'getTasksByIds':
      // async/awaitを使いたい場合Promiseで囲む必要があるが、`return true`とバッティングするのでthenを使用
      workerMessage.getTasksByIds(message.data)
                   .then(tasks => sendResponse(tasks))
      break
    default:
      sendResponse(null)
      break
    }

    // https://developer.chrome.com/extensions/runtime#event-onMessage
    return true
  })
}
