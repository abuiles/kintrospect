// @flow
import React, { Component } from 'react';
import Book, { BookObject } from './Book';
import BookCard from './BookCard';
 // import sample from './sample';

export default class Home extends Component {
  render() {
    // const book = new BookObject(sample);
    return (
      <div>

          <header className='tc pv4 pv5-ns'>
          <h1 className='f5 f4-ns fw6 mid-gray'>Kintrospect</h1>
          <h2 className='f6 gray fw2 ttu tracked'>Your books</h2>
        </header>
        <BookCard />
      </div>
    );
  }
}
