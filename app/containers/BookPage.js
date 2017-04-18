import React, { Component } from 'react';

import Book, { BookObject } from '../components/Book'
import sample from '../components/sample'

export default class BookPage extends Component {
  render() {
    const book = new BookObject(sample);
    return (
      <div>
        <Book book={book} />
      </div>
    )
  }
}
