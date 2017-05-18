// @flow
import { observable, action, computed } from 'mobx';
import { ipcRenderer } from 'electron';
import BookStore from './Book'

export default class AmazonStore {
  @observable running = false
  @observable kindleSignedIn = false
  @observable webview = null
  @observable booksStore: ?BookStore = null

  @computed get isRunning(): boolean {
    return this.running
  }

  @computed get hasWebview(): boolean {
    return !!this.webview
  }

  @action setWebview(webview) {
    this.webview = webview
    if (!webview.getURL().match('www.amazon.com/ap/signin')) {
      console.log('signed in')
      this.kindleSignedIn = true
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
      const { webview } =  this

      if (document.location.hash === '#/') {
        webview.executeJavaScript(this.findPages(), false, (result) => {
          result.nextLinks.unshift('https://kindle.amazon.com/your_reading')
          this.getBooksData(result)
        })
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
                ipcRenderer.send('highlights-crawled', asin, highlights)
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

  findPages() {
    return `
    const pagination = document.querySelectorAll('.paginationLinks.bottomPagination')[0];
    const nextLinks = Array.from(pagination.getElementsByTagName('a'))
          .filter((link) => {
            console.log(link.text)
            return link.text.indexOf('Next') < 0
          })
          .map((link) => link.href)

    const result = {}

    if (nextLinks) {
      result.nextLinks = nextLinks
    }

    result
    `
  }

  extractBooks() {
    return `
    const books = [];
    const kindleBooks = Array.from(document.getElementsByClassName('titleAndAuthor'))
    kindleBooks.forEach((book) => {
      const meta = {}
      const link = book.getElementsByTagName('a')[0];
      meta.url = link.href
      meta.title = link.text
      meta.asin = meta.url.split('/').reverse()[0]

      const parent = book.parentElement
      const img = parent.getElementsByClassName('bookCover')[0]
      meta.bookCover = img.src

      const reading = parent.getElementsByClassName('readActive').length || parent.getElementsByClassName('readingActive').length

      if (reading) {
        books.push(meta)
      }
    })

    books
    `

  }

  getBooksData({ nextLinks }) {
    const { booksStore } = this
    booksStore.setLoading(true)

    const urls = nextLinks
    const { webview } = this
    urls.reduce((accumulator, url) => accumulator.then((results) => {
      console.log('loading', url)
      return new Promise((resolve) => {
        // run after URL loads page and extra book data
        webview.addEventListener('did-finish-load', ({ currentTarget }) => {
          currentTarget.executeJavaScript(this.extractBooks(), false, (result) => {
            resolve(result)
          })

        }, {once: true})

        webview.loadURL(url)
      }).then((result) => {
        results.push(result);
        booksStore.concatBooks(result)
        return results;
      })
    }), Promise.resolve([])).then((results) => {
      const books = results.reduce((accumulator, books) => [...accumulator, ...books], []);
      booksStore.setLoading(false)
      this.toggleRunning()
      ipcRenderer.send('books-crawled', books)
    })
  }
}
