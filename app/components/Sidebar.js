import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import {
  Link
} from 'react-router-dom'
import { withRouter } from 'react-router'

import AmazonStore from '../stores/Amazon'
import BookStore from '../stores/Book'

@inject('amazonStore', 'booksStore')
@observer
export default class Sidebar extends Component {
  props: {
    amazonStore: AmazonStore,
    booksStore: BookStore
  }

  goToHome({ match, history }) {
    if (history.location.pathname.indexOf('/commonplace-books/') >= 0) {
      history.push('/commonplace-books')
    } else {
      history.push('/')
    }
  }

  render() {
    const { booksStore, amazonStore } = this.props
    const { isRunning, kindleSignedIn } = amazonStore
    const GoToHome = withRouter((routeInfo) => (
      <a className="pointer db white no-underline mb4" onClick={() => { this.goToHome(routeInfo) }}>
        <p className="mt0 lh-solid f2 fw9">k</p>
      </a>
    ))

    return (
      <div className={`bg-blue ph3 pv4 tc ${booksStore.appExpired ? 'dn' : ''}`}>
        <GoToHome />

        {kindleSignedIn && !booksStore.appExpired && !isRunning &&
          <button
            className="pointer bn mt1 mb3 pa0 bg-inherit f4" title="Fetch Books" onClick={() => {
              amazonStore.runCrawler()
            }}
          >
            <i className="fa fa-refresh white" aria-hidden="true" />
          </button>
        }
        {kindleSignedIn &&
          <button className="pointer bn pa0 bg-inherit f4" title="Sign Out" onClick={() => amazonStore.signOut()}>
            <i className="fa fa-sign-out white" aria-hidden="true" />
          </button>
        }

      </div>
    );
  }
}
