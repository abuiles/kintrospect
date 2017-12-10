import CommonplaceStore, { Commonplace } from './Commonplace'
import BookStore from './Book'
import NoteStore from './Note'
import AmazonStore from './Amazon'

import { observable, action, computed } from 'mobx';

export default class RootStore {
  constructor(book, notes, amazon) {
    this.commonplaceStore = new CommonplaceStore(this)
    this.bookStore = book
    this.notesStore = notes
    this.amazonStore = amazon
  }

  @computed get allAnnotations() {
    return this.bookStore.allAnnotations;
  }

  @action addCommonplaces(commonplaces): void {
    this.commonplaceStore.addCommonplaces(commonplaces)
  }

  findCommonplace(id: string): ?Commonplace {
    return this.commonplaceStore.find(id)
  }
}
