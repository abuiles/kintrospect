// @flow
import React, { Component } from 'react'
import BookCard from './BookCard'
import { BookMeta } from './Book'

export default class Home extends Component {
  props: {
    books: BookMeta[]
  }

  render() {
    const books = this.props.books || [];

    return (
      <div>
        <header className="tc pv4 pv5-ns">
          <h1 className="f5 f4-ns fw6 mid-gray">Kintrospect</h1>
        </header>
        <BookCard books={books} />
      </div>
    );
  }
}
