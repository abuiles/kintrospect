// @flow
import React, { Component } from 'react';
import Home from '../components/Home';
import { BookMeta } from '../components/Book'
import { ipcRenderer } from 'electron';

export default class HomePage extends Component {
  state: {
    books: BookMeta[]
  }

  state = {
    books: []
  }

  componentDidMount() {
    ipcRenderer.on('books-loaded', (event, books) => {
      this.setState({ books })
    })
    ipcRenderer.send('load-books')
  }

  render() {
    const { books } = this.state

    return (
      <div>
        <Home books={books} />
      </div>
    );
  }
}
