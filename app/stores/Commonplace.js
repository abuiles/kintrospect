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
  @serializable(list(primitive())) usedBook = [];

  get asin(): string {
    return this.id
  }

  addUsedBook(book) {
    this.usedBook.push(book.asin)
    console.log(this.usedBooks)
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

    const serialized = serialize(this.commonplaces.toJS())

    ipcRenderer.send('commonplaces-updated', serialized)

    return commonplace
  }

  @action addCommonplaces(commonplaces): void {
    this.commonplaces = deserialize(Commonplace, commonplaces)
  }

  find(id: string): ?Commonplace {
    return this.commonplaces.find((c: Commonplace) => c.id === id)
  }
}
