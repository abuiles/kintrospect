// @flow
import React from 'react'
import {
  HashRouter as Router,
  Route,
  // Link
} from 'react-router-dom'
import { ipcRenderer } from 'electron';
import WebView from 'react-electron-web-view'
import { observer, Provider } from 'mobx-react'
import Analytics from 'electron-google-analytics';
import { machineIdSync } from 'electron-machine-id';

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
  notesStore.setLoading(false)
})

ipcRenderer.on('notes-loaded', (event, notes) => {
  notesStore.addNotes(notes)
  notesStore.setLoading(false)
})

ipcRenderer.on('app-version', (event, version) => {
  console.log('version', version)
  booksStore.checkAppVersion(version)
})

notesStore.setLoading(true)
ipcRenderer.send('load-books')


const analytics = new Analytics('UA-99589026-2')
analytics._machineID = machineIdSync()

amazonStore.setAnalytics(analytics)

@observer
export default class Root extends React.Component {
  onDidFinishLoad({ currentTarget }) {
    currentTarget.style.height = '400px'
    amazonStore.setWebview(currentTarget)
  }

  componentDidMount() {
    analytics.pageview('https://app.kintrospect.com', '/', 'Root', analytics._machineID)
  }

  render() {
    const { kindleSignedIn, hasWebview, isRunning } = amazonStore

    return (
      <Provider booksStore={booksStore} notesStore={notesStore} amazonStore={amazonStore} analytics={analytics} >
        <Router>
          <div className="sans-serif">
            {kindleSignedIn && <Route exact path="/" component={HomePage} />}
            <Route path="/book/:asin" component={BookPage} />
            <article className={`paola-revisar mw7 center ph3 ph5-ns tc br2 pv5 mb5 ${(kindleSignedIn && hasWebview) ? 'dn' : 'db'}`} >
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
