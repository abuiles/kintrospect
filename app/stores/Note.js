// @flow
import { observable, action, computed } from 'mobx'
import { PropTypes } from 'mobx-react'
import { ipcRenderer } from 'electron'

export const BookArray = PropTypes.observableArray

export default class NoteStore {
  @observable notes = {}
  @observable isLoading = false
  @observable mobiledocEditor = null

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

  @action setEditor(editor) {
    this.mobiledocEditor = editor
  }

  _addAnnotation(postEditor, annotation, showBookTitle = false) {
    const { isKindleBook, kindleLink } = annotation

    const markupSectionAttributes = [postEditor.builder.createMarker(`${annotation.highlight} `)]

    if (showBookTitle || isKindleBook) {
      const aMarkup = postEditor.builder.createMarkup('a', { href: kindleLink })
      const linkMarker = postEditor.builder.createMarker(`${(showBookTitle) ? annotation.book.title : 'Open in Kindle'}`, [aMarkup])
      markupSectionAttributes.push(linkMarker)
    }

    const section = postEditor.builder.createMarkupSection('blockquote', markupSectionAttributes)
    const newlineSection = postEditor.builder.createMarkupSection('p')

    postEditor.insertSection(newlineSection)
    postEditor.insertSection(section)
  }

  addAnnotation(annotation, showBookTitle = false) {
    this.mobiledocEditor.run((postEditor) => {
      this._addAnnotation(postEditor, annotation, showBookTitle)
    });
  }

  addAnnotations(annotations) {
    this.mobiledocEditor.run((postEditor) => {
      for (let i = annotations.length - 1; i >= 0; --i) {
        this._addAnnotation(postEditor, annotations[i])
      }
    });
  }

  findNotes(book) {
    if (this.all[book.asin]) {
      return this.all[book.asin]
    }

    const sections = [
      [1, 'h1', [[0, [], 0, book.title]]]
    ];

    sections.push([1, 'p', []])

    let notes = {
      version: '0.3.0',
      markups: [],
      atoms: [],
      cards: [],
      sections
    }

    this.saveNotes(book, notes)

    return notes
  }

  download(book) {
    ipcRenderer.send('download-notes', book.title, book.asin)
  }

  publish(book) {
    ipcRenderer.send('publish-notes', book.asin)
  }
}
