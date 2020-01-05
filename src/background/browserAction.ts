export default function() {
  chrome.browserAction.setBadgeText({ text: "Stop" })
  chrome.browserAction.setBadgeBackgroundColor({ color: "#EE0000" })
}
