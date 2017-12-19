// @flow
import { observable, action, computed } from 'mobx'
import { PropTypes } from 'mobx-react'
import { ipcRenderer } from 'electron'

export const BookArray = PropTypes.observableArray

export const exportFormat = {
  pdf: 'pdf',
  markdown: 'md',
  Unknown: ''
}

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

    return {
      version: '0.3.0',
      markups: [],
      atoms: [],
      cards: [],
      sections
    }
  }

  download(book) {
    const { dialog, nativeImage } = require('electron').remote

    const appIcon = nativeImage.createFromPath('./resources/icon.png')

    let format = exportFormat.Unknown

    dialog.showMessageBox({
      type: 'question',
      icon: appIcon,
      buttons: ['Markdown', 'PDF Document', 'Cancel'],
      title: 'Export Format',
      message: 'Select your file format.',
    }, (response) => {
      switch (response) {
        case 0:
          format = exportFormat.markdown
          break
        case 1:
          format = exportFormat.pdf
          break
        default:
          format = exportFormat.Unknown
      }

      ipcRenderer.send('download-notes', book.title, book.asin, format)
    })
  }

  publish(book) {
    ipcRenderer.send('publish-notes', book.asin)
  }
}
