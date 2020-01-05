export interface StorageItems {
  [key: string]: any;
}

const storage = {
  get: (keys: string | string[]): Promise<any> => {
    return new Promise(resolve => {
      chrome.storage.local.get(keys, (items: StorageItems): void => {
        if (typeof keys == "string") {
          resolve(items[keys]) 
        } else if (Array.isArray(keys)) {
          resolve(
            keys.reduce((obj: StorageItems, itemKey: string): object => {
              obj[itemKey] = items[itemKey]
              return obj
            }, {})
          )
        } else {
          resolve(items) 
        }
      })
    })
  },
  set: (value: any): Promise<boolean> => {
    return new Promise(resolve => {
      chrome.storage.local.set(value, (): void => {
        resolve(true) 
      })
    })
  },
  setByKey: (key: string, value: any): Promise<boolean> => {
    return new Promise(resolve => {
      const item = { [key]: value }
      chrome.storage.local.set(item, (): void => {
        resolve(true) 
      })
    })
  },
  remove: (keys: string | string[]): Promise<undefined> => {
    return new Promise(resolve => {
      chrome.storage.local.remove(keys, (): void => {
        resolve() 
      })
    })
  },
  clear: (): Promise<undefined> => {
    return new Promise(resolve => {
      chrome.storage.local.clear((): void => {
        resolve()
      })
    })
  }
}

Object.freeze(storage)
export default storage
