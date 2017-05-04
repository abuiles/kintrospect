// @flow
import React, { Component } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContextProvider } from 'react-dnd';

import Book, { BookObject } from '../components/Book';
// import books from '../components/books';
import sample from '../components/sample';


export default class BookPage extends Component {
  props: {
    match: { params: { asin: string } }
  }

  render() {
    // const { asin } = this.props.match.params;
    // const payload = books.find((book) => book.asin === asin);

    // if (!payload.annotations) {
    //   payload.annotations = [];
    // }

    const book = new BookObject(sample);
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <Book book={book} />
      </DragDropContextProvider>
    );
  }
}
