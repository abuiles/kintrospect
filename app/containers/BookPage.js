// @flow
import React, { Component } from 'react';
// import HTML5Backend from 'react-dnd-html5-backend';
// import { DragDropContextProvider } from 'react-dnd';
import { observer, inject } from 'mobx-react'
import WebView from 'react-electron-web-view'

import BookView from '../components/Book'
import Spinner from '../components/Spinner'
import BookStore from '../stores/Book'
import AmazonStore from '../stores/Amazon'
import withDragDropContext from './withDragDropContext'

@inject('booksStore', 'amazonStore', 'analytics')
@observer
class BookPage extends Component {
  props: {
    match: { params: { asin: string } },
    booksStore: BookStore,
    amazonStore: AmazonStore,
    analytics: any
  }

  componentDidMount() {
    const { match, booksStore, amazonStore, analytics } = this.props
    const book = booksStore.all.find((b) => b.asin === match.params.asin)

    if (book) {
      analytics.pageview('https://app.kintrospect.com', `/book/${book.asin}`, book.title, analytics._machineID)
    }

    if (!book.highlightsUpdatedAt) {
      amazonStore.toggleRunning()
    }
  }

  registerWebview({ currentTarget }) {
    const { match, booksStore, amazonStore, analytics } = this.props
    const book = booksStore.all.find((b) => b.asin === match.params.asin)

    if (!amazonStore.bookWebview) {
      if (amazonStore.isRunning) {
        amazonStore.toggleRunning()
      }
      amazonStore.setBookWebview(currentTarget)
    }

    if (book && !book.highlightsUpdatedAt && amazonStore.bookWebview && !amazonStore.isRunning) {
      amazonStore.getHighlights(book.asin)
    }
  }

  componentWillUnmount() {
    const { amazonStore } = this.props
    amazonStore.setBookWebview(null)
  }

  render() {
    const { match, booksStore, amazonStore } = this.props
    const book = booksStore.all.find((b) => b.asin === match.params.asin)

    if (book) {
      return (
        <div className="w-100">
          <BookView book={book} />
          <div className={`db`} >
            <div className="o-0">
              <WebView
                style={{ flex: '0 1' }}
                src={`https://read.amazon.com/notebook`}
                allowpopups
                onDidFinishLoad={(webview) => this.registerWebview(webview) }
                />
            </div>
          </div>
        </div>
      )
    }

    return <Spinner />
  }
}

export default withDragDropContext(BookPage);
