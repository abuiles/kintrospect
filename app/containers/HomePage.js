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
        <header className="sans-serif">
          <div className="cover bg-left bg-center-l">
            <div className="bg-black-80 pb5 pb6-m pb7-l">
              <div className="tc-l mt4 mt5-m mt6-l ph3">
                <h1 className="f2 f1-l fw2 white-90 mb0 lh-title">This version has expired, please download the latest version of the app by visiting the link below:</h1>
                <a className="f6 no-underline grow dib v-mid bg-blue white ba b--blue ph3 pv2 mb3" href="https://kintrospect.com/downloads" target="_blank" rel="noopener noreferrer">https://kintrospect.com/downloads</a>
              </div>
            </div>
          </div>
        </header>
      )
    }

    return (
      <div className="w-100">
        {content}
      </div>
    );
  }
}
