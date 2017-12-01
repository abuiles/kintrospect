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
      cover = (<text className="f3 lh-copy"> {title} </text>)
    }


    return (
      <div key={asin} className="w-20-l w-third-m w-100 pa3-ns pb3 f5 v-top flex">
        <div className="bg-white flex flex-column shadow-1 w-100">
          <Link className="no-underline" to={`/book/${asin}`} >
            <div className="aspect-ratio aspect-ratio--5x8">
              {cover}
            </div>
            <div className="pa3 cf bt b--light-gray tr">
              {footer}
            </div>
          </Link>
        </div>
      </div>
    )
  }
}
