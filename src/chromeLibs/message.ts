const message = {
  send: (data: any): Promise<any> => {
    return new Promise(resolve => {
      chrome.runtime.sendMessage(data, (response: any) => {
        console.log(response)
        resolve(response) 
      })
    })
  }
}

Object.freeze(message)
export default message
