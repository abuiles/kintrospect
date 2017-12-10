// @flow
import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import BookCard from './BookCard'
import SearchInput, { createFilter } from 'react-search-input'
import {
  Link
} from 'react-router-dom'

import AmazonStore from '../stores/Amazon'

const KEYS_TO_FILTERS = ['title']

@inject('amazonStore')
@observer
export default class Home extends Component {
  props: {
    amazonStore: AmazonStore,
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
    const { amazonStore } = this.props;
    const books = this.props.books || [];
    const filteredBooks = books.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));

    const syncButton = (amazonStore.syncingFromDevice) ? (
      <button className="btn" onClick={() => amazonStore.runKindleCrawler()}>
        <i className="fa fa-refresh white" aria-hidden="true" />&nbsp;Fetch From Device
      </button>
    ) : (
      <button className="btn" onClick={() => amazonStore.runCrawler()}>
        <i className="fa fa-refresh white" aria-hidden="true" />&nbsp;Fetch Books
      </button>
    )

    return (
      <div className="h-100 flex flex-column ph3 bl b--near-white bg-light-gray relative">
        <header className="pv4 ph3 flex cf">
          <Link className="no-underline mr4" to="/commonplace-books" >
            Commonplace
          </Link>
          <SearchInput className="search-input paragraph mw-100" onChange={(term) => this.searchUpdated(term)} />
          <div className="w-100 tr">
            {syncButton}
          </div>
        </header>
        <div className="overflow-y-auto h-100">
          <div className="f0 flex flex-wrap">
            {filteredBooks.map((book) => (
              <BookCard book={book} key={book.asin} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
