// @flow
import { observable, action, computed } from 'mobx';
import { PropTypes } from 'mobx-react'

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

  @action saveNotes(asin, notes): void {
    this.notes[asin] = notes
  }

  @action setLoading(loading) {
    this.isLoading = loading
  }

  initialNotes(book) {
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
}
