// @flow
import { observable, action, computed } from 'mobx';
import { PropTypes } from 'mobx-react'

interface AnnotationObjectAttrs {
  type: string,
  name: string,
  highlight: string,
  location: number,
  timestamp: number,
  modifiedTimestamp: number,
  asin: string,
  annotations: Annotation[],
  startLocation: number
}

export class Annotation implements AnnotationObjectAttrs {
  type: string;
  name: string;
  highlight: string;
  highlightId: string;
  location: number;
  timestamp: number;
  modifiedTimestamp: number;
  asin: string;
  annotations: Annotation[];
  startLocation: number;
  linkId: string;

  constructor(payload) {
    this.annotations = [];
    this.startLocation = 0;

    if (payload.highlightId) {
      this.highlightId = payload.highlightId;
    } else {
      this.highlightId = `${Math.ceil(Math.random() * 1000)}${Date.now()}`
    }

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

    if (!payload.timestamp && payload.modifiedTimestamp) {
      this.timestamp = payload.modifiedTimestamp;
    }

    if (payload.asin) {
      this.asin = payload.asin;
    }

    if (payload.location) {
      this.location = payload.location
    }

    // if (payload.start) {
    //   // https://www.amazon.com/forum/kindle/Tx2S4K44LSXEWRI?_encoding=UTF8&cdForum=Fx1D7SY3BVSESG
    //   this.location = Math.ceil(payload.start / 150);
    // }

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

    return this.highlightId;
  }

  get card(): any {
    if (this.isChapter) {
      return { name: this.name }
    } else {
      const { isChapter, location, asin, highlight } = this

      return { isChapter, location, asin, highlight };
    }
  }

  get kindleLink(): string {
    return `kindle://book?action=open&asin=${this.asin}&location=${this.location}`
  }
}

export interface BookMeta {
  title: string,
  asin: string,
  url: string,
  highlightsUpdatedAt: ?string,
  contentType: string,
  publicationDate: number,
  purchaseDate: number
}

export class Book {
  title: string
  asin: string
  publicationDate: number
  purchaseDate: number
  updatedAt: string
  annotations: Annotation[]
  highlightsUpdatedAt: ?string

  constructor({ title, asin, annotations, highlightsUpdatedAt }) {
    this.title = title;
    this.asin = asin;
    this.highlightsUpdatedAt = highlightsUpdatedAt
    this.annotations = annotations ? annotations.map((annotation) => new Annotation(annotation)) : []
  }
}

export const BookArray = PropTypes.observableArray

export default class BookStore {
  @observable items = []
  @observable isLoading = false
  @observable appExpired = false
  @observable appVersion = 1511551035000

  @computed get all() {
    return this.items
  }

  @computed get loading() {
    return this.isLoading
  }

  @action addBooks(books): void {
    this.items = books.map((payload) => new Book(payload))
  }

  @action concatBooks(books): void {
    this.items = this.items.concat(books.map((payload) => new Book(payload)))
  }

  @action setLoading(loading) {
    this.isLoading = loading
  }

  @action checkAppVersion(version) {
    // to test out expired version just set the value for this.appExpired = true
    this.appExpired = version > this.appVersion
  }
}
