// @flow
import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'

import CommonplacesView from '../components/Commonplaces'

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
        <CommonplacesView />
      </div>
    );
  }
}
