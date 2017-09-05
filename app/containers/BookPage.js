// @flow
import React, { Component } from 'react';
// import HTML5Backend from 'react-dnd-html5-backend';
// import { DragDropContextProvider } from 'react-dnd';
import { observer, inject } from 'mobx-react'

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

    if (book && !book.highlightsUpdatedAt && amazonStore.hasWebview) {
      amazonStore.runCrawler()
    }

    // analytics.pageview('https://app.kintrospect.com', `/book/${book.asin}`, book.title, analytics._machineID)
  }

  render() {
    const { match, booksStore } = this.props

    const book = booksStore.all.find((b) => b.asin === match.params.asin)

    if (book) {
      return (
        <div className="w-100">
          <BookView book={book} />
        </div>
      )
    }

    return <Spinner />
  }
}

export default withDragDropContext(BookPage);
