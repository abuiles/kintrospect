// @flow
import React from 'react'
import {
  HashRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import { ipcRenderer } from 'electron';
// import WebView from 'react-electron-web-view'
import { observer, Provider } from 'mobx-react'
import Analytics from 'electron-google-analytics';
import { machineIdSync } from 'electron-machine-id';

import HomePage from './HomePage'
import BookPage from './BookPage'
import CommonplacesPage from './CommonplacesPage'
import CommonplacePage from './CommonplacePage'
import BookStore from '../stores/Book'
import NoteStore from '../stores/Note'
import AmazonStore from '../stores/Amazon'
import RootStore from '../stores/Root'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import Login from '../components/Login'

const booksStore = new BookStore();
const notesStore = new NoteStore();
const amazonStore = new AmazonStore();

const rootStore = new RootStore(booksStore, notesStore, amazonStore)

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

ipcRenderer.on('commonplaces-loaded', (event, commonplaces) => {
  rootStore.addCommonplaces(commonplaces)
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

  componentDidMount() {
    analytics.pageview('https://app.kintrospect.com', '/', 'Root', analytics._machineID)
  }

  render() {
    const { kindleSignedIn, isRunning } = amazonStore

    let style = {}
    if (isRunning) {
      style.pointerEvents = 'none'
    }

    return (
      <Provider booksStore={booksStore} notesStore={notesStore} amazonStore={amazonStore} analytics={analytics} rootStore={rootStore} >
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
                <Route exact path="/commonplace-books" component={CommonplacesPage} />
                <Route path="/commonplace-books/:id" component={CommonplacePage} />
              </div>
            }
            <Login amazonStore={amazonStore} />
          </div>
        </Router>
      </Provider>
    )
  }
}
