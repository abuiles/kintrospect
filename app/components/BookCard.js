// @flow
import React from 'react';

import books from './books'


const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    overflowY: 'auto'
  },
};


// {books.map((book) => (
// http://images.amazon.com/images/P/${book.asin}`

// http://stackoverflow.com/questions/33886418/how-to-get-book-cover-image-url-using-isbn
// http://images.amazon.com/images/P/PASTE_ISBN_NUMBER_HERE.01.20TRZZZZ.jpg
// http://helpful.knobs-dials.com/index.php/Amazon_notes#General
export default class BookCard extends React.Component {
  render() {
    return (
      <div className="fboard f0 flex flex-wrap">
        {books.map((book) => (
          <div key={book.asin} className="w-20-l w-50-m w-100 pa3-ns pb3 f5 v-top flex">
            <div className="bg-white flex flex-auto flex-column shadow-1">
              <a>
                <img alt="book cover" className="img db bb b--light-gray w-100" src={`http://images.amazon.com/images/P/${book.asin}`} />
              </a>
              <div className="ph3 pt3 cf flex-auto">
              </div>
              <div className="ph3 pv2 mt3 cf bt b--light-gray black-40 normal f6 f--h ttu tracked">
                <div className="fr">
                  <i className="fa fa-comment" aria-hidden="true"></i> 6 highlights
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}