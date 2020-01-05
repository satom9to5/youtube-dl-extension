let currentBrowser: string = ''

const browser = (): string => {
  if (currentBrowser) {
    return currentBrowser
  }

  const ua: string = window.navigator.userAgent

  switch (true) {
  case (ua.indexOf("Chrome") >= 0):
    currentBrowser = "Chrome"
    break
  case (ua.indexOf("Firefox") >= 0):
    currentBrowser = "Firefox"
    break
  }
  
  return currentBrowser
}

export default browser
