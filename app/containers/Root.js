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
import BookStore from '../stores/Book'
import NoteStore from '../stores/Note'
import AmazonStore from '../stores/Amazon'

const booksStore = new BookStore();
const notesStore = new NoteStore();
const amazonStore = new AmazonStore();

amazonStore.setBookStore(booksStore)

ipcRenderer.on('books-loaded', (event, books) => {
  booksStore.addBooks(books)
})

ipcRenderer.on('notes-loaded', (event, notes) => {
  notesStore.addNotes(notes)
})

ipcRenderer.send('load-books')

export default class Root extends React.Component {
  state: {
    kindleSignIn: boolean
  }

  state = {
    kindleSignIn: false
  }

  onDidFinishLoad({ currentTarget }) {
    currentTarget.style.height = '400px'
    const state = {}
    amazonStore.setWebview(currentTarget)

    if (!currentTarget.getURL().match('www.amazon.com/ap/signin')) {
      console.log('signed in')
      state.kindleSignIn = true
    }

    this.setState(state)
  }

  render() {
    const { kindleSignIn } = this.state
    const styles = {};

    return (
      <Provider booksStore={booksStore} notesStore={notesStore} amazonStore={amazonStore} >
        <Router>
          <div className="sans-serif">
            <Route exact path="/" component={HomePage} />
            <Route path="/book/:asin" component={BookPage} />
            <article className="mw7 center ph3 ph5-ns tc br2 pv5 bg-washed-green dark-green mb5 " style={styles} >
              <h2>Log into your kindle account first</h2>

              <WebView
                src='https://kindle.amazon.com/your_reading/'
                autosize
                allowpopups
                style={{ height: 0 }}
                className="dn"
                onDidFinishLoad={(a) => this.onDidFinishLoad(a) }
                />
            </article>
          </div>
        </Router>
      </Provider>
    )
  }
}
