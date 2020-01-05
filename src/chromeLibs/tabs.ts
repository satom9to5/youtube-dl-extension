const tabs = {
  query: (queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
    return new Promise(resolve => {
      chrome.tabs.query(queryInfo, (tabs: chrome.tabs.Tab[]) => {
        resolve(tabs) 
      })
    })
  },
  create: (properties: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> => {
    return new Promise(resolve => {
      chrome.tabs.create(properties, (tab: chrome.tabs.Tab) => {
        resolve(tab) 
      })
    })
  },
}

Object.freeze(tabs)
export default tabs
