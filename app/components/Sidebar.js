import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import {
  Link
} from 'react-router-dom'

import AmazonStore from '../stores/Amazon'
import BookStore from '../stores/Book'

@inject('amazonStore','booksStore')
@observer
export default class Sidebar extends Component {
  props: {
    amazonStore: AmazonStore,
    booksStore: BookStore
  }

  render() {
    const { booksStore, amazonStore } = this.props
    const { isRunning, kindleSignedIn } = amazonStore

    return (
      <div className={`bg-blue pa3 ${booksStore.appExpired ? 'dn' : ''}`}>
        <Link className="db mb2" to="/">
          <i className="fa fa-home white" aria-hidden="true"></i>
        </Link>
        {kindleSignedIn && !booksStore.appExpired && !isRunning &&
          <button className="bn pa0 bg-inherit" onClick={() => amazonStore.runCrawler()}>
            <i className="fa fa-refresh white" aria-hidden="true"></i>
          </button>
        }
        {kindleSignedIn &&
          <button className="db mt4 bn pa0 bg-inherit" onClick={() => amazonStore.signOut()}>
            <i className="fa fa-sign-out white" aria-hidden="true"></i>
          </button>
        }
      </div>
    );
  }
}
