// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import RootStore from '../stores/Root'
import CommonplaceView from '../components/Commonplace'

@inject('rootStore', 'analytics')
@observer
export default class CommonplacePage extends Component {
  props: {
    match: { params: { id: string } },
    rootStore: RootStore,
    analytics: any
  }

  componentDidMount() {
    const { analytics, match, rootStore } = this.props
    const id = match.params.id
    const commonplace = rootStore.findCommonplace(id)

    analytics.pageview(
      'https://app.kintrospect.com',
      `/commonplace-book/${id}`,
      `CommonplacePage - ${commonplace.title}`,
      analytics._machineID
    )
  }

  render() {
    const { match, rootStore } = this.props
    const id = match.params.id
    const commonplace = rootStore.findCommonplace(id)

    return (
      <div className="w-100">
        <CommonplaceView commonplace={commonplace} />
      </div>
    )
  }
}
