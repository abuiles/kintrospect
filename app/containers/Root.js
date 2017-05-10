// @flow
import React from 'react'
import { Provider } from 'mobx-react'
import {
  HashRouter as Router,
  Route,
  // Link
} from 'react-router-dom'
import WebView from 'react-electron-web-view'
import { ipcRenderer } from 'electron';

import HomePage from './HomePage'
import BookPage from './BookPage'
import Crawler from '../components/Crawler'
import BookStore from '../stores/Book'

const booksStore = new BookStore();

ipcRenderer.on('books-loaded', (event, books) => {
  booksStore.addBooks(books)
})

ipcRenderer.send('load-books')

export default class Root extends React.Component {
  state: {
    kindleSignIn: boolean,
    webview: any
  }

  state = {
    kindleSignIn: false
  }

  onDidFinishLoad({ currentTarget }) {
    currentTarget.style.height = '400px'
    const state = {
      webview: currentTarget
    }

    if (!currentTarget.getURL().match('www.amazon.com/ap/signin')) {
      console.log('signed in')
      state.kindleSignIn = true
    }

    this.setState(state)
  }

  render() {
    const { kindleSignIn, webview } = this.state
    const styles = {};

    return (
      <Provider booksStore={booksStore}>
        <Router>
          <div>
            <Crawler webview={webview} />
            <Route exact path="/" component={HomePage} />
            <Route path="/book/:asin" component={BookPage} />
            <article className="mw7 center ph3 ph5-ns tc br2 pv5 bg-washed-green dark-green mb5 " style={styles} >
              <h2>Log into your kindle account first</h2>

              <WebView
                src='https://kindle.amazon.com/your_reading/'
                autosize
                allowpopups
                style={{ height: 400 }}
                onDidFinishLoad={(a) => this.onDidFinishLoad(a) }
                />
            </article>
          </div>
        </Router>
      </Provider>
    )
  }
}
