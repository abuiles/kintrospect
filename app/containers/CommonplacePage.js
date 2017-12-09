// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'

@inject('booksStore', 'amazonStore', 'analytics')
@observer
export default class CommonplacePage extends Component {
  props: {
    booksStore: BookStore,
    amazonStore: AmazonStore,
    analytics: any
  }

  componentDidMount() {
    analytics.pageview(
      'https://app.kintrospect.com',
      `/commonplace-book`,
      'CommonplacePage',
      analytics._machineID
    )
  }

  render() {
    return (
      <div className="w-100">
        <div className="h-100 flex flex-column ph3 bl b--near-white bg-light-gray relative">
          <h1>This is a custom Commonplace Book</h1>
        </div>
      </div>
    )
  }
}
