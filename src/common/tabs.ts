import tabs from 'chromeLibs/tabs'

export function getCurrentTab(): Promise<chrome.tabs.Tab> {
  return new Promise(async (resolve, reject) => {
    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true
    }
    const currentTabs = await tabs.query(queryInfo)
    resolve(currentTabs[0])
  })
}
