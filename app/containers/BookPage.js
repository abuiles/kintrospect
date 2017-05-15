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

@inject('booksStore', 'amazonStore')
@observer
class BookPage extends Component {
  props: {
    match: { params: { asin: string } },
    booksStore: BookStore,
    amazonStore: AmazonStore
  }

  componentDidMount() {
    const { match, booksStore, amazonStore } = this.props
    const book = booksStore.all.find((b) => b.asin === match.params.asin)

    if (book && !book.highlightsUpdatedAt && amazonStore.hasWebview) {
      amazonStore.runCrawler()
    }
  }

  render() {
    const { match, booksStore } = this.props

    const book = booksStore.all.find((b) => b.asin === match.params.asin)

    if (book) {
      return (
        <div>
          <BookView book={book} />
        </div>
      )
    }

    return <Spinner />
  }
}

export default withDragDropContext(BookPage);
