// @flow
import { observable, action, computed } from 'mobx';
import { ipcRenderer } from 'electron';
import BookStore from './Book'

const HOMEURL = 'https://read.amazon.com'

export default class AmazonStore {
  @observable running = false
  @observable kindleSignedIn = true
  @observable webview = null
  @observable booksStore: ?BookStore = null
  @observable analytics = null

  @computed get isRunning(): boolean {
    return this.running
  }

  @computed get hasWebview(): boolean {
    return !!this.webview
  }

  @action setAnalytics(analytics) {
    this.analytics = analytics
  }

  @action setWebview(webview) {
    this.webview = webview
    if (!webview.getURL().match('www.amazon.com/ap/signin')) {
      console.log('signed in')
      this.kindleSignedIn = true

      if (!this.booksStore.all.length) {
        this.runCrawler()
      }
    } else {
      this.kindleSignedIn = false
    }
  }

  @action toggleRunning(): void {
    this.running = !this.isRunning
  }

  setBookStore(store: BookStore): void {
    this.booksStore = store
  }

  @action runCrawler(): void {
    // document.location.hash
    if (!this.running) {
      this.toggleRunning()
      const { webview, analytics } =  this

      if (document.location.hash === '#/') {
        this.getBooksData()
      } else if (document.location.hash.match('#/book/')) {
        const asin = document.location.hash.split('#/book/')[1]
        const { booksStore } = this

        console.log('load highlights', asin)
        booksStore.setLoading(true)
        const store = this

        const loadHighlights = (highlights, cursor) => {
          webview.addEventListener('did-finish-load', ({ currentTarget }) => {
            webview.executeJavaScript("document.getElementsByTagName('pre')[0].textContent", false, function(result) {
              const items = JSON.parse(result).items

              if (items.length === 0) {
                booksStore.setLoading(false)
                store.toggleRunning()
                if (analytics) {
                  analytics.event('Highlight', 'crawled', { evValue: highlights.length, evLabel: asin, clientID: analytics._machineID })
                }
                ipcRenderer.send('highlights-crawled', asin, highlights)
                webview.loadURL(HOMEURL)
              } else {
                console.log('loading more items')
                loadHighlights(highlights.concat(items), cursor += 200)
              }

            })
          }, { once: true })

          const url = `https://kindle.amazon.com/kcw/highlights?asin=${asin}&cursor=${cursor}&count=200`

          webview.loadURL(url)
        }

        loadHighlights([], 0)
      }
    }
  }

  @action crawlerDidFinish() {
    this.runnnig = false
  }
  @action signOut() {
    const clearSession = 'document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });'

    if (this.webview) {
      this.webview.executeJavaScript(clearSession, false, () => {
        if (this.webview) {
          this.webview.loadURL(HOMEURL)
        }
      })
    }
  }

  extractBooks() {
    return `
new Promise(function(resolve) {
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
})
 `
  }

  getBooksData() {
    const { booksStore } = this
    booksStore.setLoading(true)

    const { webview, analytics  } = this
    console.log('loading', HOMEURL)

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
}
