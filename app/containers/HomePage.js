// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'

import Home from '../components/Home';
import BookStore from '../stores/Book'

// https://wietse.loves.engineering/using-flowtype-with-decorators-in-react-af4fe69e66d6
@inject('booksStore')
@observer
export default class HomePage extends Component {
  props: {
    booksStore: BookStore
  }

  render() {
    const { booksStore } = this.props

    return (
      <div>
        {booksStore.loading && <h1> Downloading your books...  </h1> }
        <Home books={booksStore.all} />
      </div>
    );
  }
}
