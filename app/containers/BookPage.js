// @flow
import React, { Component } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContextProvider } from 'react-dnd';

import Book, { BookObject, BookMeta } from '../components/Book';
import { ipcRenderer } from 'electron';

export default class BookPage extends Component {
  props: {
    match: { params: { asin: string } }
  }

  state: {
    books: BookMeta[]
  }

  state = {
    books: []
  }

  componentDidMount() {
    ipcRenderer.on('books-loaded', (event, books) => {
      this.setState({ books })
    })
    ipcRenderer.send('load-books')
  }

  render() {
    const { match } = this.props

    const { books } = this.state

    const meta = books.find((book) => book.asin === match.params.asin)

    if (meta) {
      if (!meta.annotations) {
        meta.annotations = [];
      }

      const book = new BookObject(meta);

      return (
        <DragDropContextProvider backend={HTML5Backend}>
          <Book book={book} />
        </DragDropContextProvider>
      );
    }

    return <h1> loading </h1>
  }
}
