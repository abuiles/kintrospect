// @flow
import React, { Component } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContextProvider } from 'react-dnd';
import { observer, inject } from 'mobx-react'

import BookView from '../components/Book';
import BookStore from '../stores/Book'

@inject('booksStore')
@observer
export default class BookPage extends Component {
  props: {
    match: { params: { asin: string } },
    booksStore: BookStore
  }

  render() {
    const { match, booksStore } = this.props

    const book = booksStore.all.find((b) => b.asin === match.params.asin)

    if (book) {
      return (
        <DragDropContextProvider backend={HTML5Backend}>
          <BookView book={book} />
        </DragDropContextProvider>
      );
    }

    return <h1> loading </h1>
  }
}
