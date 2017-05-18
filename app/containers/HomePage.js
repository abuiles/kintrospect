// @flow
import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'

import Home from '../components/Home'
import BookStore from '../stores/Book'
import AmazonStore from '../stores/Amazon'
import Crawler from '../components/Crawler'

// https://wietse.loves.engineering/using-flowtype-with-decorators-in-react-af4fe69e66d6
@inject('booksStore')
@inject('amazonStore')
@observer
export default class HomePage extends Component {
  props: {
    booksStore: BookStore,
    amazonStore: AmazonStore
  }

  render() {
    const { booksStore, amazonStore } = this.props
    const { kindleSignedIn, hasWebview, isRunning } = amazonStore

    return (
      <div className={`fixed absolute--fill flex ${isRunning ? 'o-40':''}`}>
        <div className="bg-blue pa3">
          {kindleSignedIn && <Crawler />}
        </div>
        <Home books={booksStore.all} />
      </div>
    );
  }
}
