// @flow
import { observable, action, computed } from 'mobx'
import { PropTypes } from 'mobx-react'
import slug from 'slug'
import uuid from 'uuid/v4'

export const CommonplaceArray = PropTypes.observableArray

export interface ICommonplace {
  title: string,
  createdAt: string,
  slug: string,
  id: string
}

export class Commonplace {
  id: string
  slug: string
  title: string
  createdAt: string

  constructor({ title, createdAt, id, slug }) {
    this.title = title
    this.createdAt = createdAt
    this.id = id
    this.slug = slug
  }
}

export default class NoteStore {
  @observable commonplaces: CommonplaceArray = []

  @computed get all() {
    return this.commonplaces
  }

  @action createCommonplace(title: string): void {
    const id = uuid()
    const titleSlug = slug(title, { lower: true })
    const commonplace = new Commonplace({
      title,
      createdAt: new Date().toISOString(),
      id,
      slug: titleSlug
    })
    this.commonplaces.push(commonplace)
  }
}
