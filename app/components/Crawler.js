// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { observer, inject } from 'mobx-react'
import BookStore from '../stores/Book'

@inject('booksStore')
@observer
export default class Crawler extends Component {
  constructor(props) {
    super(props)

    ipcRenderer.on('books-saved', (event, arg) => {
      console.log(arg)
      this.crawlerDidFinish()
    })
  }

  state: {
    isRunning: boolean
  }

  state = {
    isRunning: false
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('books-saved');
  }


  props: {
    webview: any,
    booksStore: BookStore
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
    const { booksStore } = this.props
    booksStore.setLoading(true)

    const urls = nextLinks;
    const { webview } = this.props;
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
      ipcRenderer.send('books-crawled', books)
    })
  }

  crawlerDidFinish() {
    this.setState({
      isRunning: false
    })
  }

//   loadHighlights(asin: string) {
//     return `
//     'https://kindle.amazon.com/kcw/highlights?asin=${asin}&cursor=0&count=1000'
// `
//   }

  runCrawler() {
    // document.location.hash
    if (!this.state.isRunning) {
      this.setState({
        isRunning: true
      })
      const { webview } =  this.props

      if (document.location.hash === '#/') {
        webview.executeJavaScript(this.findPages(), false, (result) => {
          result.nextLinks.unshift('https://kindle.amazon.com/your_reading')
          this.getBooksData(result)
        })
      } else if (document.location.hash.match('#/book/')) {
        const asin = document.location.hash.split('#/book/')[1]
        const { booksStore } = this.props

        console.log('load highlights', asin)
        booksStore.setLoading(true)

        const loadHighlights = (highlights, cursor) => {
          webview.addEventListener('did-finish-load', ({ currentTarget }) => {
            webview.executeJavaScript("document.getElementsByTagName('pre')[0].textContent", false, function(result) {
              const items = JSON.parse(result).items

              if (items.length === 0) {
                booksStore.setLoading(false)
                ipcRenderer.send('highlights-crawled', asin, highlights)
              } else {
                console.log('loading more items')
                loadHighlights(highlights.concat(items), cursor += 200)
              }

            })
          }, {once: true})

          const url = `https://kindle.amazon.com/kcw/highlights?asin=${asin}&cursor=${cursor}&count=200`

          webview.loadURL(url)
        }

        loadHighlights([], 0)

        //     this.loadHighlights(asin)
        //     .then(function(response) {
        //   return response.json().then(function(json) {
        //     console.log(json)
        //   })
        // })
      }
    }
  }

  render() {
    const { isRunning } = this.state

    return (
      <div>
        {isRunning &&
          <button disabled>Fetching book data</button>
        }
        {!isRunning &&
          <button onClick={() => this.runCrawler()}>
            Refresh
          </button>
        }
      </div>
    );
  }
}
