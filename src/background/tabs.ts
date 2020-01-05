import { isWatchPage } from 'common/url'

const enabledIconPath: object = {
  128: `static/images/enabled_icon-128x128.png`,
  16: `static/images/enabled_icon-16x16.png`,
  24: `static/images/enabled_icon-24x24.png`,
  32: `static/images/enabled_icon-32x32.png`,
  48: `static/images/enabled_icon-48x48.png`,
  64: `static/images/enabled_icon-64x64.png`,
}
const disabledIconPath: object = {
  128: `static/images/disabled_icon-128x128.png`,
  16: `static/images/disabled_icon-16x16.png`,
  24: `static/images/disabled_icon-24x24.png`,
  32: `static/images/disabled_icon-32x32.png`,
  48: `static/images/disabled_icon-48x48.png`,
  64: `static/images/disabled_icon-64x64.png`,
}
Object.freeze(enabledIconPath)
Object.freeze(disabledIconPath)

function updateIcon(tab: chrome.tabs.Tab | undefined) {
  const iconPath: object = tab && tab.url && isWatchPage(tab.url) ? enabledIconPath : disabledIconPath
  
  chrome.browserAction.setIcon({path: iconPath})
}

export default function() {
  chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (changeInfo.status && changeInfo.status == 'complete') {
      updateIcon(tab)
    }
  })
  
  chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab: chrome.tabs.Tab | undefined) => updateIcon(tab))
  })
}

