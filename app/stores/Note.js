// @flow
import { observable, action, computed } from 'mobx'
import { PropTypes } from 'mobx-react'
import { ipcRenderer } from 'electron'
import parameterize from 'parameterize'

export const BookArray = PropTypes.observableArray

export default class NoteStore {
  @observable notes = {}
  @observable isLoading = false

  @computed get all() {
    return this.notes
  }

  @computed get loading() {
    return this.isLoading
  }

  @action addNotes(notes): void {
    this.notes = notes
  }

  @action saveNotes(book, notes): void {
    ipcRenderer.send('save-notes', book.asin, notes)
    this.notes[book.asin] = notes
  }

  @action setLoading(loading) {
    this.isLoading = loading
  }

  findNotes(book) {
    if (this.all[book.asin]) {
      return this.all[book.asin]
    }

    const sections = [
      [1, 'h1', [[0, [], 0, book.title]]], [1, 'h1', []]
    ];

    for (let i = 0; i < 100; i += 1) {
      sections.push([1, 'p', []])
    }

    return {
      version: '0.3.0',
      markups: [],
      atoms: [],
      cards: [],
      sections
    }
  }

  download(book) {
    ipcRenderer.send('download-notes', `${parameterize(book.title)}.md`, book.asin)
  }

  publish(book) {
    ipcRenderer.send('publish-notes', book.asin)
  }
}
