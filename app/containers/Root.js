// @flow
import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  // Link
} from 'react-router-dom'

import HomePage from './HomePage'
// import BookPage from './BookPage'

export default class Root extends React.Component {
  render() {
    return (
     <Router>
        <div>
          <Route path="/" component={HomePage} />
        </div>
     </Router>
    )
  }
}
