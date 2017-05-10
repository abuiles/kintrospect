// @flow
import { observable, action, computed } from 'mobx';
import { PropTypes } from 'mobx-react'
import { BooksType } from '../types'


interface AnnotationObjectAttrs {
  type: string,
  name: string,
  highlight: string,
  location: number,
  timestamp: number,
  asin: string,
  annotations: Annotation[],
  startLocation: number
}

export class Annotation implements AnnotationObjectAttrs {
  type: string;
  name: string;
  highlight: string;
  location: number;
  timestamp: number;
  asin: string;
  annotations: Annotation[];
  startLocation: number;
  linkId: string;

  constructor(payload) {
    this.annotations = [];
    this.startLocation = 0;

    if (payload.type) {
      this.type = payload.type;
    }

    if (payload.highlight) {
      this.highlight = payload.highlight
    }

    if (payload.timestamp) {
      this.timestamp = payload.timestamp;
    }

    if (payload.name) {
      this.name = payload.name
    }

    if (payload.location) {
      this.location = payload.location
    }

    if (payload.asin) {
      this.asin = payload.asin;
    }

    if (payload.startLocation) {
      // https://www.amazon.com/forum/kindle/Tx2S4K44LSXEWRI?_encoding=UTF8&cdForum=Fx1D7SY3BVSESG
      this.location = Math.ceil(payload.startLocation / 150);
    }

    if (this.isChapter) {
      this.linkId = `chapter-${this.location}`;
      this.annotations = payload.annotations.map((annotation) => new Annotation(annotation));
    }
  }

  get isChapter(): boolean {
    return this.type === 'chapter';
  }

  get uniqueKey(): string {
    if (this.isChapter) {
      return `${this.location}`
    }

    return `${this.location}-${this.timestamp}`
  }
}

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
  annotations: Annotation[]

  constructor({ bookCover, title, asin, annotations }) {
    this.bookCover = bookCover;
    this.title = title;
    this.asin = asin;
    this.annotations = annotations ? annotations.map((annotation) => new Annotation(annotation)) : []
  }
}

export const BookArray = PropTypes.observableArray

export default class BookStore {
  @observable items = []

  @computed get all() {
    return this.items
  }

  @action addBooks(books): void {
    this.items = books.map((payload) => new Book(payload))
  }
}
