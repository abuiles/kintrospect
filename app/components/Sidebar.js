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
      <div className={`bg-blue ph3 pv4 tc ${booksStore.appExpired ? 'dn' : ''}`}>
        <Link className="db white no-underline mb4" to="/">
          <p className="mt0 lh-solid f2 fw9">k</p>
        </Link>

        {kindleSignedIn && !booksStore.appExpired && !isRunning &&
          <button className="bn mt1 mb3 pa0 bg-inherit f4" title="Fetch Books" onClick={() => {
              amazonStore.runCrawler()
          }}>
            <i className="fa fa-refresh white" aria-hidden="true"></i>
          </button>
        }
        {kindleSignedIn &&
          <button className="bn pa0 bg-inherit f4" title="Sign Out" onClick={() => amazonStore.signOut()}>
            <i className="fa fa-sign-out white" aria-hidden="true"></i>
          </button>
        }

      </div>
    );
  }
}
