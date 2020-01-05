import ytdl from 'ytdl-core'

interface MessageListenerMethods {
  [key: string]: Function;
}

// contentとbackgroundで共通化する？
type DisplayVideoFormatsBody = {
  formats: ytdl.videoFormat[];
}

type FromBackgroundRequest = {
  method: string,
  body: DisplayVideoFormatsBody | undefined
}

const messageListenerMethods: MessageListenerMethods = {
  displayVideoFormats: (body: DisplayVideoFormatsBody) => {
    console.log(body)
    //console.log(document.getElementsByTagName('embed'))
    //console.log(document.getElementsByTagName('video'))
    document.getElementById("not_watch_page")!.style.display = 'none'
    document.getElementById("formats")!.style.display = 'block'
  }
}

export default function() {
  chrome.runtime.onMessage.addListener((req: FromBackgroundRequest, sender: chrome.runtime.MessageSender, res) => {
    if (messageListenerMethods.hasOwnProperty(req.method)) {
      messageListenerMethods[req.method](req.body)
    } else {
      console.error(`method: ${req.method} is not found.`)
    }
  })
}
