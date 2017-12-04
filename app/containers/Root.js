// @flow
import React from 'react'
import {
  HashRouter as Router,
  Route,
  Link
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
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'

const booksStore = new BookStore();
const notesStore = new NoteStore();
const amazonStore = new AmazonStore();

amazonStore.setBookStore(booksStore)

ipcRenderer.on('books-loaded', (event, books) => {
  if (amazonStore.isRunning) {
    amazonStore.toggleRunning()
  }

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
    let { kindleSignedIn, hasWebview, isRunning } = amazonStore

    let style = {}
    if (isRunning) {
      style.pointerEvents = 'none'
    }

    return (
      <Provider booksStore={booksStore} notesStore={notesStore} amazonStore={amazonStore} analytics={analytics} >
        <Router>
          <div className="vh-100 w-100 sans-serif">
            {isRunning &&
              <Spinner />
            }

            {kindleSignedIn &&
              <div className={ `fixed absolute--fill flex ${isRunning ? 'o-20':''}`} style={style}>
                <Sidebar />
                <Route exact path="/" component={HomePage} />
                <Route path="/book/:asin" component={BookPage} />
              </div>
            }

            <div className={`bg-blue vh-100 tc ${(kindleSignedIn && hasWebview) ? 'dn' : 'db'}`} >
              <header className="paragraph mw-100 center tc white pt5 pb4">
                <h2 className="f1 mb2">Welcome to Kintrospect!</h2>
                <p className="f3 ma0">Login first into the Kindle Cloud Reader using the account associated with your Kindle - we don't store or have access to your email or password.</p>
              </header>
              <div className="center pa4 bg-white paragraph mw-100 br2">
                <WebView
                  src={amazonStore.amazonUrl()}
                  allowpopups
                  onDidFinishLoad={(webview) => this.onDidFinishLoad(webview)}
                  />
              </div>
            </div>
          </div>
        </Router>
      </Provider>
    )
  }
}
