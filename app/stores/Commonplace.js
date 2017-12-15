// @flow
import { observable, action, computed } from 'mobx'
import { PropTypes } from 'mobx-react'
import slug from 'slug'
import uuid from 'uuid/v4'
import { ipcRenderer } from 'electron';
import {
  identifier,
  serialize,
  deserialize,
  serializable,
  list,
  primitive
} from 'serializr';

import RootStore from './Root'

export const CommonplaceArray = PropTypes.observableArray

export interface ICommonplace {
  title: string,
  createdAt: string,
  slug: string,
  id: string
}

export class Commonplace {
  @serializable(identifier()) id = uuid()
  @serializable slug = ''
  @serializable title = ''
  @serializable description = ''
  @serializable createdAt = ''
  @serializable(list(primitive())) usedBooks = [];
  @serializable(list(primitive())) filter = [];

  get asin(): string {
    return this.id
  }

  get isCommonplace() {
    return true
  }

  addUsedBook(book) {
    if (this.usedBooks.indexOf(book.asin) === -1) {
      this.usedBooks.push(book.asin)
    }
  }

  addBookToFilter(book) {
    if (this.filter.indexOf(book.asin) === -1) {
      this.filter.push(book.asin)
    }
  }

  removeBookFromFilter(book) {
    const bookIdx = this.filter.indexOf(book.asin)
    if (bookIdx !== -1) {
      this.filter.splice(bookIdx, 1)  
    }
  }
}

export default class CommonplaceStore {
  @observable commonplaces: CommonplaceArray = []
  @observable rootStore: ?RootStore = null

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
  }

  @computed get all() {
    return this.commonplaces
  }

  @action createCommonplace({ title, description }): Commonplace {
    const titleSlug = slug(title, { lower: true })
    const commonplace = deserialize(Commonplace, {
      title,
      description,
      createdAt: new Date().toISOString(),
      slug: titleSlug
    })

    this.commonplaces.push(commonplace)
    this.saveCommonplaces()

    return commonplace
  }

  saveCommonplaces(): void {
    const serialized = serialize(this.commonplaces.toJS())
    ipcRenderer.send('commonplaces-updated', serialized)
  }

  @action addCommonplaces(commonplaces): void {
    this.commonplaces = deserialize(Commonplace, commonplaces)
  }

  find(id: string): ?Commonplace {
    return this.commonplaces.find((c: Commonplace) => c.id === id)
  }
}
