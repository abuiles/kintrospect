// @flow
import React from 'react'
import {
  HashRouter as Router,
  Route,
  // Link
} from 'react-router-dom'

import HomePage from './HomePage'
import BookPage from './BookPage'

export default class Root extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={HomePage} />
          <Route path="/book/:asin" component={BookPage} />
        </div>
      </Router>
    )
  }
}
