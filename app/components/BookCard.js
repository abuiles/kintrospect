// @flow
import React from 'react';
import {
  Link
} from 'react-router-dom'

// http://stackoverflow.com/questions/33886418/how-to-get-book-cover-image-url-using-isbn
// http://images.amazon.com/images/P/PASTE_ISBN_NUMBER_HERE.01.20TRZZZZ.jpg
// http://helpful.knobs-dials.com/index.php/Amazon_notes#General

interface BookMeta {
  bookCover: string;
  title: string;
  asin: string;
  url: string;
}

export default class BookCard extends React.Component {
  props: {
    books: BookMeta[]
  }

  render() {
    const books = this.props.books || [];

    return (
      <div className="fboard f0 flex flex-wrap">
        {books.map((book) => (
          <div key={book.asin} className="w-20-l w-50-m w-100 pa3-ns pb3 f5 v-top flex">
            <div className="bg-white flex flex-auto flex-column shadow-1">
              <Link to={`/book/${book.asin}`} >
                <img alt="book cover" className="img db bb b--light-gray w-100" src={`http://images.amazon.com/images/P/${book.asin}`} />
              </Link>
              <div className="ph3 pt3 cf flex-auto" />
              <div className="ph3 pv2 mt3 cf bt b--light-gray black-40 normal f6 f--h ttu tracked">
                <div className="fr">
                  <i className="fa fa-comment" aria-hidden="true" /> 6 highlights
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
