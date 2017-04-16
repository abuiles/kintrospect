// @flow
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  // Link
} from 'react-router-dom';
// import App from './App';
import HomePage from './HomePage';


export default class Root extends React.Component {
  render() {
    return (
      <Router>
        <Route path="/" component={HomePage} />
      </Router>
    );
  }
}
