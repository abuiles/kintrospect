// @flow
import { observable, action, computed } from 'mobx';
import { PropTypes } from 'mobx-react'
import { AnnotationObject } from '../components/Annotation'
import { BooksType } from '../types'

export interface BookMeta {
  bookCover: string,
  title: string,
  asin: string,
  url: string,
  highlightsUpdatedAt: ?Date
}

export class Book {
  bookCover: string
  title: string
  asin: string
  updatedAt: string
  annotations: number[]

  constructor({ bookCover, title, asin, annotations }) {
    this.bookCover = bookCover;
    this.title = title;
    this.asin = asin;
    this.annotations = []

    // this.annotations = all.map((annotation) => new AnnotationObject(annotation));
  }
}

interface BookState {
  open: boolean,
  currentLocation: number,
  locations: number[]
}

export const BookArray = PropTypes.observableArray

export default class BookStore {
  @observable items = []

  @computed get all() {
    return this.items
  }

  @action addBooks(books): void {
    debugger
    this.items = books.map((payload) => new Book(payload))
  }
}
