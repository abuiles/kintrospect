// @flow
import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'

import Home from '../components/Home'
import BookStore from '../stores/Book'
import AmazonStore from '../stores/Amazon'

// https://wietse.loves.engineering/using-flowtype-with-decorators-in-react-af4fe69e66d6
@inject('booksStore')
@inject('amazonStore')
@inject('analytics')
@observer
export default class HomePage extends Component {
  props: {
    booksStore: BookStore,
    amazonStore: AmazonStore,
    analytics: any
  }

  componentDidMount() {
    const { analytics } = this.props
    analytics.pageview('https://app.kintrospect.com', '/home', 'Home', analytics._machineID)
  }

  render() {
    const { booksStore, amazonStore } = this.props
    const { kindleSignedIn, hasWebview, isRunning } = amazonStore


    let content = <Home books={booksStore.all} />

    if (booksStore.appExpired) {
      content = (
        <div className="vh-100 tc bg-blue">
          <div className="paragraph center mw-100 white pv4">
            <h1 className="f1 lh-title"><i className="fa fa-rocket" aria-hidden="true" /> Woohoo! An improved version of Kintrospect is now available for download at:</h1>
            <a className="f2 white" href="https://kintrospect.com/downloads.html" target="_blank" rel="noopener noreferrer">https://kintrospect.com/downloads.html</a>
          </div>
        </div>
      )
    }

    return (
      <div className="w-100">
        {content}
      </div>
    );
  }
}
