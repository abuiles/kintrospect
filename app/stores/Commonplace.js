// @flow
import { observable, action, computed } from 'mobx'
import { PropTypes } from 'mobx-react'

export const CommonplaceArray = PropTypes.observableArray

export interface ICommonplace {
  title: string,
  createdAt: ?string
}

export class Commonplace {
  title: string
  createdAt: string

  constructor({ title, createdAt }) {
    this.title = title
    this.createdAt = createdAt
  }
}

export default class NoteStore {
  @observable commonplaces: CommonplaceArray = []

  @computed get all() {
    return this.commonplaces
  }

  @action createCommonplace(title: string): void {
    this.commonplaces.push({
      title,
      createdAt: new Date(),
      /*
        id: TODO assign an UUID https://www.npmjs.com/package/uuid
        slug: TODO create an unique identifier with the name look for possible collisions with other commomnplaces see https://www.npmjs.com/package/slug
      */
    })
  }
}
