// @flow
import React, { Component } from 'react';
// import HTML5Backend from 'react-dnd-html5-backend';
// import { DragDropContextProvider } from 'react-dnd';
import { observer, inject } from 'mobx-react'

import BookView from '../components/Book'
import BookStore from '../stores/Book'
import withDragDropContext from './withDragDropContext'

@inject('booksStore')
@observer
class BookPage extends Component {
  props: {
    match: { params: { asin: string } },
    booksStore: BookStore
  }

  render() {
    const { match, booksStore } = this.props

    const book = booksStore.all.find((b) => b.asin === match.params.asin)

    if (book) {
      return <BookView book={book} />
    }

    return <h1> loading </h1>
  }
}

export default withDragDropContext(BookPage);
