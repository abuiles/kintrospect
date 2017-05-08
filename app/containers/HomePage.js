// @flow
import React, { Component } from 'react';
import Home from '../components/Home';
import { BookMeta } from '../components/Book'

export default class HomePage extends Component {
  props: {
    books: BookMeta[]
  }

  render() {
    const books = this.props.books || []

    return (
      <div>
        <Home books={books} />
      </div>
    );
  }
}
