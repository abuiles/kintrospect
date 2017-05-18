// @flow
import React from 'react'
import { Provider } from 'mobx-react'
import {
  HashRouter as Router,
  Route,
  // Link
} from 'react-router-dom'
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
  render() {
    return (
      <Provider booksStore={booksStore} notesStore={notesStore} amazonStore={amazonStore} >
        <Router>
          <div className="sans-serif">
            <Route exact path="/" component={HomePage} />
            <Route path="/book/:asin" component={BookPage} />
          </div>
        </Router>
      </Provider>
    )
  }
}
