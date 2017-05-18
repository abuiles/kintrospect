// @flow
import React, { Component } from 'react'
import WebView from 'react-electron-web-view'
import { observer, inject } from 'mobx-react'

import Home from '../components/Home'
import BookStore from '../stores/Book'
import AmazonStore from '../stores/Amazon'
import Crawler from '../components/Crawler'
import Spinner from '../components/Spinner'

// https://wietse.loves.engineering/using-flowtype-with-decorators-in-react-af4fe69e66d6
@inject('booksStore')
@inject('amazonStore')
@observer
export default class HomePage extends Component {
  onDidFinishLoad({ currentTarget }) {
    const { amazonStore } = this.props
    currentTarget.style.height = '400px'
    amazonStore.setWebview(currentTarget)
  }

  props: {
    booksStore: BookStore,
    amazonStore: AmazonStore
  }

  render() {
    const { booksStore, amazonStore } = this.props
    const { kindleSignedIn, hasWebview, isRunning } = amazonStore

    const signInPage = (
      <article className={`mw7 center ph3 ph5-ns tc br2 pv5 mb5 ${kindleSignedIn ? '' : ''}`} >
        {!kindleSignedIn && <h2>{"Welcome to Kintrospect! Let's start by connecting your Amazon account"}</h2>}
        {!hasWebview && <Spinner />}
        <WebView
          src="https://kindle.amazon.com/your_reading/"
          autosize
          allowpopups
          style={{ height: 0 }}
          onDidFinishLoad={(webview) => this.onDidFinishLoad(webview)}
          />
          <div className="lh-copy mt3">
            {hasWebview && <p>{"We don't store your email or password."}</p>}
          </div>
      </article>
    )

    return (
      <div className={`fixed absolute--fill flex ${isRunning ? 'o-40':''}`}>
        {kindleSignedIn && (
          <div className="bg-blue pa3">
            {kindleSignedIn && <Crawler />}
          </div>)
        }
        {kindleSignedIn && <Home books={booksStore.all} />}
        {!kindleSignedIn && signInPage }
      </div>
    );
  }
}
