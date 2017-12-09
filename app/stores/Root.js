import CommonplaceStore from './Commonplace'
import BookStore from './Book'
import NoteStore from './Note'
import AmazonStore from './Amazon'

export class RootStore {
  constructor(book, notes, amazon) {
    this.commonplaceStore = new CommonplaceStore(this)
    this.bookStore = book
    this.notesStore = notes
    this.amazonStore = amazon
  }
}
