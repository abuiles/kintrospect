// @flow
import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'

@inject('booksStore')
@inject('amazonStore')
@inject('analytics')
@observer
export default class CommonplacesPage extends Component {
  props: {
    booksStore: BookStore,
    amazonStore: AmazonStore,
    analytics: any
  }

  componentDidMount() {
    const { analytics } = this.props
    analytics.pageview(
      'https://app.kintrospect.com',
      '/commonplace-books',
      'Commonplace Books',
      analytics._machineID
    )
  }

  render() {
    return (
      <div className="w-100">
        <div className="h-100 flex flex-column ph3 bl b--near-white bg-light-gray relative">
          <h1>Your Commonplace Books</h1>
          <Link className="no-underline mr4" to="/commonplace-book" >
            Commonplace Page
          </Link>
        </div>
      </div>
    );
  }
}
