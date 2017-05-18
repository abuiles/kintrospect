// @flow
import React from 'react'
import { Provider } from 'mobx-react'
import {
  HashRouter as Router,
  Route,
  // Link
} from 'react-router-dom'
import { ipcRenderer } from 'electron';
import WebView from 'react-electron-web-view'
import { observer } from 'mobx-react'

import HomePage from './HomePage'
import BookPage from './BookPage'
import BookStore from '../stores/Book'
import NoteStore from '../stores/Note'
import AmazonStore from '../stores/Amazon'
import Spinner from '../components/Spinner'

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

@observer
export default class Root extends React.Component {
  onDidFinishLoad({ currentTarget }) {
    currentTarget.style.height = '400px'
    amazonStore.setWebview(currentTarget)
  }

  render() {
    const { kindleSignedIn, hasWebview, isRunning } = amazonStore

    return (
      <Provider booksStore={booksStore} notesStore={notesStore} amazonStore={amazonStore} >
        <Router>
          <div className="sans-serif">
            <Route exact path="/" component={HomePage} />
            <Route path="/book/:asin" component={BookPage} />
            <article className={`mw7 center ph3 ph5-ns tc br2 pv5 mb5 ${kindleSignedIn ? 'dn' : ''}`} >
              {!kindleSignedIn && hasWebview && <h2>{"Welcome to Kintrospect! Let's start by connecting your Amazon account"}</h2>}
              {!hasWebview && !booksStore.all && <Spinner />}
              <WebView
                src="https://kindle.amazon.com/your_reading/"
                autosize
                allowpopups
                style={{ height: 0 }}
                onDidFinishLoad={(webview) => this.onDidFinishLoad(webview)}
                />
            </article>
          </div>
        </Router>
      </Provider>
    )
  }
}
