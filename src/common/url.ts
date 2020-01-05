export function isWatchPage(url: string): boolean {
  return url.match(/^https:\/\/www.youtube.com\/watch/) !== null
}
