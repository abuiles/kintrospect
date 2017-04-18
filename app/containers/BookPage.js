import React, { Component } from 'react';
import {
  Link
} from 'react-router-dom'

export default class BookPage extends Component {
  render() {
    return (
      <div>
        <h1>Hola</h1>
        <Link to="/" >
          Home
        </Link>
      </div>
    )
  }
}
