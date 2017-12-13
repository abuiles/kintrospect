// @flow
import React from 'react';
import {
  Link
} from 'react-router-dom'
import { observer } from 'mobx-react'

// http://stackoverflow.com/questions/33886418/how-to-get-book-cover-image-url-using-isbn
// http://images.amazon.com/images/P/PASTE_ISBN_NUMBER_HERE.01.20TRZZZZ.jpg
// http://helpful.knobs-dials.com/index.php/Amazon_notes#General

import { Book } from '../stores/Book'

@observer
export default class BookCard extends React.Component {
  props: {
    book: Book
  }

  render() {
    const { book } = this.props
    const { title, isKindleBook, highlightsUpdatedAt, asin, annotations } = book
    let footer
    let cover

    if (highlightsUpdatedAt) {
      footer = (<p className="gray ma0"><i className="fa fa-comment" aria-hidden="true" /> {annotations ? annotations.length : 0} highlights</p>)
    } else {
      footer = <p className="underline ma0" href="#">Fetch highlights &#187;</p>
    }

    if (isKindleBook) {
      cover = (<img alt="book cover" className="img db w-100 aspect-ratio--object" src={`http://images.amazon.com/images/P/${book.asin}`} />)
    } else {
      cover = (
        <div className="h-100 w-100">
          <div className="mt2 bg-red tracked pv1 ph4-l ph3 w-auto dib">
            <p className="f5 white mv0">PDF</p>
          </div>
          <div className="ph4-l ph3 pv3">
            <h1 className="lh-title serif f4 ttc">{title}</h1>
          </div>
        </div>
      )
    }


    return (
      <div key={asin} className="w-20-l w-third-m w-100 pa3-ns pb3 f5 v-top flex">
        <div className="bg-white flex flex-column shadow-1 w-100">
          <Link className="no-underline near-black" to={`/book/${asin}`} >
            <div className="aspect-ratio aspect-ratio--5x8 overflow-hidden">
              {cover}
            </div>
            <div className="pv3 ph4-l ph3 cf bt b--light-gray tr f6">
              {footer}
            </div>
          </Link>
        </div>
      </div>
    )
  }
}
