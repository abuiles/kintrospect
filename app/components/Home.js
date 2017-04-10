// @flow
import React, { Component } from 'react';
import Book, { BookObject } from './Book';
import sample from './sample';

export default class Home extends Component {
  render() {
    const book = new BookObject(sample);
    return (
      <div>
        <Book book={book} />
      </div>
    );
  }
}
