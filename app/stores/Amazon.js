// @flow
import { observable, action, computed } from 'mobx';
import { ipcRenderer } from 'electron';
const { BrowserWindow } = require('electron').remote
const { dialog, nativeImage } = require('electron').remote

import BookStore from './Book'

const AmazonUrl = 'https://www.amazon.com/ap/signin?openid.assoc_handle=amzn_kweb&openid.return_to=https%3A%2F%2Fread.amazon.com%2F&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&pageId=amzn_kcr'
const appIcon = nativeImage.createFromPath('./resources/icon.png')

export const syncOptions = {
  FetchFromDevice: 'fetchFromDevice',
  SyncFromCloud: 'syncFromCloud',
  Unknown: ''
}

export default class AmazonStore {
  @observable running = false
  @observable kindleSignedIn = false
  @observable webview = null
  @observable booksStore: ?BookStore = null
  @observable analytics = null
  @observable userPreferences = {
    syncOption: syncOptions.Unknown,
    kindlePath: ''
  }

  @computed get isRunning(): boolean {
    return this.running
  }

  @computed get hasWebview(): boolean {
    return !!this.webview
  }

  @computed get syncingFromDevice(): boolean {
    return this.userPreferences.syncOption === syncOptions.FetchFromDevice
  }

  @computed get syncingUnknown(): boolean {
    return this.userPreferences.syncOption === syncOptions.Unknown
  }

  @computed get syncingFromCloud(): boolean {
    return this.userPreferences.syncOption === syncOptions.SyncFromCloud
  }

  @action syncFromCloud() {
    return this.setUserPreferences({
      syncOption: syncOptions.SyncFromCloud
    })
  }

  @action syncFromDevice(kindlePath) {
    return this.setUserPreferences({
      syncOption: syncOptions.FetchFromDevice,
      kindlePath: kindlePath.toString()
    })
  }

  @action setAnalytics(analytics) {
    this.analytics = analytics
  }

  amazonUrl() {
    return AmazonUrl
  }

  isLoggedIn() {
    return `
new Promise(function(resolve) {
  KindleModuleManager.getModuleSync(KindleModuleManager.DB_CLIENT).getAppDb().getDeviceToken().then(function(t) { resolve(t) })
})
`
  }

  @action setWebview(webview) {
    this.webview = webview

    if (webview.getURL().match('https://read.amazon.com')) {
      console.log('logged in')
      this.syncFromCloud()
      this.kindleSignedIn = true

      if (!this.booksStore.all.length) {
        this.runCrawler()
      }
    } else {
      if (!this.syncingFromDevice) {
        this.kindleSignedIn = false
        this.setUserPreferences({
          syncOption: syncOptions.Unknown
        })
      }
    }
  }

  @action toggleRunning(): void {
    this.running = !this.isRunning
  }

  setBookStore(store: BookStore): void {
    this.booksStore = store
  }

  @action runCrawler(): void {
    if (this.syncingFromDevice) {
      return this.runKindleCrawler()
    }

    if (!this.running) {
      this.toggleRunning()
      const { webview, analytics } = this

      if (document.location.hash === '#/') {
        this.getBooksData()
      } else if (document.location.hash.match('#/book/')) {
        const asin = document.location.hash.split('#/book/')[1]
        const { booksStore } = this

        console.log('load highlights', asin)
        const store = this

        this.getHighlights(asin)
      }
    }
  }

  @action runKindleCrawler(): void {
    if (!this.running) {
      this.toggleRunning()
      ipcRenderer.send('read-from-kindle', this.userPreferences.kindlePath)
    }
  }

  @action crawlerDidFinish() {
    this.runnnig = false
  }

  @action setUserPreferences(preferences, saveToDisk = true) {
    const merged = { ...this.userPreferences, ...preferences }
    this.userPreferences = merged

    if (saveToDisk) {
      ipcRenderer.send('save-user-preferences', merged)
    }
  }

  @action bootstrapPreferences(preferences) {
    this.setUserPreferences(preferences, false)

    if (this.syncingFromDevice) {
      this.kindleSignedIn = true
      this.runCrawler()
    }
  }

  signIn() {
    dialog.showMessageBox({
      type: 'info',
      icon: appIcon,
      buttons: ['Next', 'Cancel'],
      title: 'Sign in to the Kindle Cloud Reader',
      message: `Amazon doesn't offer a public API for your Kindle Highlights - as a workaround we need you to sign in to the Kindle Cloud Reader where we'll read the data.`,
      detail: `We don't have access to your email or password, you are signing in to Amazon directly. Feel free turn on two factor authentication :).`
    }, (response) => {
      if (response === 0) {
        let win = new BrowserWindow()

        win.on('closed', () => {
          win = null
          if (this.webview) {
            this.webview.reload()
          }
        })

        win.on('page-title-updated', (evt, title) => {
          if (title && title.includes('Cloud Reader')) {
            if (win) win.close()
            if (this.webview) {
              this.webview.reload()
            }
          }
        })

        win.loadURL(AmazonUrl)
      }
    })
  }

  @action signOut() {
    const clearSession = 'KindleApp.deregister()'

    if (this.webview && this.userPreferences.syncOption === syncOptions.SyncFromCloud) {
      dialog.showMessageBox({
        type: 'info',
        icon: appIcon,
        buttons: ['Next', 'Cancel'],
        title: 'Signing out',
        message: 'In the next screen, click on the settings icon on the top and then click Sign out .',
        detail: 'Close the window after that.',
      }, (response) => {
        if (response === 0) {
          let win = new BrowserWindow()

          win.on('closed', () => {
            win = null
            this.webview.reload()
          })

          win.on('page-title-updated', (evt, title) => {
            if (title && !title.includes('Cloud Reader')) {
              win.close()
              if (this.webview) {
                this.webview.reload()
              }
            }
          })

          win.loadURL('https://read.amazon.com')
        }
      })
    } else {
      this.setUserPreferences({
        syncOption: syncOptions.Unknown,
        kindlePath: ''
      })

      this.kindleSignedIn = false
    }
  }

  extractBooks() {
    return `
var getBooks = function(resolve)  {
  KindleModuleManager.getModuleSync(KindleModuleManager.DB_CLIENT).getAppDb().getDeviceToken().then(function(token) {
    var headers = new Headers()
    headers.append('X-ADP-Session-Token', token)
    return fetch('https://read.amazon.com/service/web/reader/getOwnedContent', {
      credentials: 'include',
      headers: headers
    }).then(function(response) {
      return response.json()
    }).then(function(books) {
      resolve(books)
    })
  })
};

new Promise(function(resolve) {
  setTimeout(function(){
    console.log('woot');
    getBooks(resolve);
  }, 5000);
});
 `
  }

  getBooksData() {
    const { booksStore } = this
    booksStore.setLoading(true)

    const { webview, analytics } = this

    new Promise((resolve) => {
      webview.executeJavaScript(this.extractBooks(), false, (result) => {
        resolve(result)
      })
    }).then(({ asinsToAdd }) => {
      const books = Object.keys(asinsToAdd)
            .map((asin) => asinsToAdd[asin])
            .sort((a, b) => b.purchaseDate - a.purchaseDate)
      console.log(books)
      booksStore.setLoading(false)
      this.toggleRunning()

      if (analytics) {
        analytics.event('Book', 'crawled', { evValue: books.length, clientID: analytics._machineID })
      }

      ipcRenderer.send('books-crawled', books)
    })
  }

  extractHighlights(asin) {
    return `
new Promise(function(resolve) {
  KindleModuleManager.getModuleSync(KindleModuleManager.DB_CLIENT).getAppDb().getDeviceToken().then(function(token) {
    var headers = new Headers()
    headers.append('X-ADP-Session-Token', token)
    return fetch('https://read.amazon.com/service/web/reader/startReading?asin=${asin}', {
      credentials: 'include',
      headers: headers
    }).then(function(response) {
      return response.json()
    }).then(function(startReading) {
      var metaUrl = startReading.metadataUrl
      return fetch(metaUrl).then(function(response) {
        return response.text().then(function (metaText) {
          var guid = JSON.parse(metaText.split('loadMetadata(')[1].slice(0, -3)).refEmId
          return fetch('https://read.amazon.com/service/web/reader/getAnnotations?asin=${asin}&guid=' + guid, {
            credentials: 'include',
            headers: headers
          }).then(function (response) {
            return response.json()
          }).then(function (highlights) {
            resolve(highlights)
          })
        })
      })
    })
  })
})
`
  }


  newExtraCode() {
    return `
let nextPage = document.getElementsByClassName('kp-notebook-annotations-next-page-start')[0].value
let limitState = document.getElementsByClassName('kp-notebook-content-limit-state')[0].value
let highlights = Array.from(document.getElementsByTagName('span')).filter(element => element.id === 'highlight').
  map(e => e.parentElement.parentElement.parentElement.parentElement.parentElement)
  .map(function(highlight) {
    return {
      highlightId: highlight.id,
      highlight: Array.from(highlight.getElementsByTagName('span')).filter(element => element.id === 'highlight')[0].textContent,
      location: parseInt(Array.from(highlight.getElementsByTagName('input')).filter(element => element.id === 'kp-annotation-location')[0].value)
    }
  })


JSON.stringify({highlights: highlights, nextPage: nextPage, limitState: limitState})
`
  }

  extracHighlightsFromNotebook(asin) {
    const { webview, analytics } = this
    const { booksStore } = this

    if (!webview) {
      this.toggleRunning()
      return;
    }

    console.log('load highlights', asin)
    booksStore.setLoading(true)
    const store = this


    const loadHighlights = (highlights, meta) => {
      webview.addEventListener('did-finish-load', ({ currentTarget }) => {
        currentTarget.executeJavaScript(this.newExtraCode(), false, (result) => {
          result;
          const data = JSON.parse(result)
          highlights = highlights.concat(data.highlights)

          if (!data.nextPage) {
            booksStore.setLoading(false)
            store.toggleRunning()
            if (analytics) {
              analytics.event('Highlight', 'crawled', { evValue: highlights.length, evLabel: asin, clientID: analytics._machineID })
            }
            ipcRenderer.send('highlights-crawled', asin, highlights)
            webview.loadURL('https://read.amazon.com')
          } else {
            console.log('loading more items')
            loadHighlights(highlights, data)
          }
        })
      }, { once: true })

      let url = `https://read.amazon.com/notebook?asin=${asin}`

      if (meta) {
        url = `${url}&contentLimitState=${meta.limitState}&index=${meta.nextPage}`
      } else {
        url = `${url}&contentLimitState=`
      }

      webview.loadURL(url)
    }

    loadHighlights([], 0)
  }


  getHighlights(asin) {
    this.extracHighlightsFromNotebook(asin)
  }
}
