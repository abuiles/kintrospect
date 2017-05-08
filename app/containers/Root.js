// @flow
import React from 'react'
import {
  HashRouter as Router,
  Route,
  // Link
} from 'react-router-dom'
import WebView from 'react-electron-web-view'
import { ipcRenderer } from 'electron';

import HomePage from './HomePage'
import BookPage from './BookPage'
import Crawler from '../Components/Crawler'

interface BookMeta {
  bookCover: string;
  title: string;
  asin: string;
  url: string;
}

export default class Root extends React.Component {
  constructor(props) {
    super(props)
  }

  state: {
    kindleSignIn: boolean,
    webview?: void,
    books: BookMeta[]
  }

  state = {
    kindleSignIn: false,
    books: []
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

  componentDidMount() {
    ipcRenderer.on('books-loaded', (event, books) => {
      this.setState({ books })
    })
    ipcRenderer.send('load-books')
  }

  render() {
    const { kindleSignIn, webview, books } = this.state
    const styles = {};

    return (
      <Router>
        <div>
          <Crawler webview={webview}/>
          <Route exact path="/" component={() => (<HomePage books={books} />)} />
          <Route path="/book/:asin" component={() => ( <BookPage books={books} />)} />
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
    )
  }
}
