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
      <div className="overflow-y-auto h-100 ph3 bl b--near-white bg-light-gray">
        <header className="pv4 ph3">
          <SearchInput className="search-input mw-100" style={{ width: 700 }} onChange={(term) => this.searchUpdated(term)} />
        </header>
        <div className="fboard f0 flex flex-wrap">
          {filteredBooks.map((book) => (
            <BookCard book={book} key={book.asin} />
          ))}
        </div>
      </div>
    );
  }
}
