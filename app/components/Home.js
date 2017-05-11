// @flow
import React, { Component } from 'react'
import BookCard from './BookCard'
import SearchInput, { createFilter } from 'react-search-input'

const KEYS_TO_FILTERS = ['title']

export default class Home extends Component {
  props: {
    books: ObservableArray<any>
  }

  state: {
    searchTerm: string
  }

  state = {
    searchTerm: ''
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term })
  }

  render() {
    const books = this.props.books || [];
    const filteredBooks = books.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))

    return (
      <div>
        <header className="tc pv4 pv5-ns">
          <h1 className="f5 f4-ns fw6 mid-gray">Kintrospect</h1>
        </header>
        <SearchInput className="search-input" onChange={(term) => this.searchUpdated(term)} />
        <BookCard books={filteredBooks} />
      </div>
    );
  }
}
