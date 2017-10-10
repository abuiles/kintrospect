// @flow
import { observable, action, computed } from 'mobx';
import { ipcRenderer } from 'electron';
import BookStore from './Book'

const AmazonUrl = 'https://www.amazon.com/ap/signin?openid.assoc_handle=amzn_kweb&openid.return_to=https%3A%2F%2Fread.amazon.com%2F&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&pageId=amzn_kcr'


export default class AmazonStore {
  @observable running = false
  @observable kindleSignedIn = false
  @observable webview = null
  @observable bookWebview = null
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
      this.kindleSignedIn = true

      if (!this.booksStore.all.length) {
        this.runCrawler()
      }
    } else {
      if (this.reload) {
        this.reload = false
        webview.reload()
      }
      this.reloadOnSignIn = true
      this.kindleSignedIn = false
    }
  }

  @action setBookWebview(webview) {
    if (webview.getURL().match('https://read.amazon.com/notebook')) {
      this.bookWebview = webview
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
        // booksStore.setLoading(true)
        const store = this

        this.getHighlights(asin)// .then((highlights) =>  {
        //   booksStore.setLoading(false)
        //   store.toggleRunning()

        //   if (analytics) {
        //     analytics.event('Highlight', 'crawled', { evValue: highlights.length, evLabel: asin, clientID: analytics._machineID })
        //   }
        //   ipcRenderer.send('highlights-crawled', asin, highlights)
        // });
      }
    }
  }

  @action crawlerDidFinish() {
    this.runnnig = false
  }
  @action signOut() {
    const clearSession = 'KindleApp.deregister()'

    if (this.webview) {
      this.webview.executeJavaScript(clearSession, false, () => {
        // for some reason we need to force a reload on the webview to
        // display the sign in fields
        this.reload = true
        this.kindleSignedIn = false
      })
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

    const { webview, analytics  } = this

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
    const { bookWebview, analytics  } = this
    const { booksStore } = this

    if (!bookWebview) {
      this.toggleRunning()
      return;
    }

    console.log('load highlights', asin)
    booksStore.setLoading(true)
    const store = this


    const loadHighlights = (highlights, meta) => {
      bookWebview.addEventListener('did-finish-load', ({ currentTarget }) => {
        currentTarget.executeJavaScript(this.newExtraCode(), false, function(result) {
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

      bookWebview.loadURL(url)
    }

    loadHighlights([], 0)
  }


  getHighlights(asin) {
    this.extracHighlightsFromNotebook(asin)
  }
}
