const nativeMessage = {
  send: (name: string, value: object): Promise<any> => {
    return new Promise(resolve => {
      chrome.runtime.sendNativeMessage(name, value, (response: any) => {
        console.log(response)
        resolve(response) 
      })
    })
  }
}

Object.freeze(nativeMessage)
export default nativeMessage
