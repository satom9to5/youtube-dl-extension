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
    default:
      sendResponse(null)
      break
    }

    // https://developer.chrome.com/extensions/runtime#event-onMessage
    return true
  })
}
