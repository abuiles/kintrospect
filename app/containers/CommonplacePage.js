// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import CommonplaceStore, { Commonplace } from '../stores/Commonplace'
import CommonplaceView from '../components/Commonplace'

@inject('commonplaceStore', 'analytics')
@observer
export default class CommonplacePage extends Component {
  props: {
    match: { params: { id: string } },
    commonplaceStore: CommonplaceStore,
    analytics: any
  }

  componentDidMount() {
    const { analytics, match, commonplaceStore } = this.props
    const id = match.params.id
    const commonplace = commonplaceStore.find(id)

    analytics.pageview(
      'https://app.kintrospect.com',
      `/commonplace-book/${id}`,
      `CommonplacePage - ${commonplace.title}`,
      analytics._machineID
    )
  }

  render() {
    const { match, commonplaceStore } = this.props
    const id = match.params.id
    const commonplace = commonplaceStore.find(id)

    return (
      <div className="w-100">
        <CommonplaceView commonplace={commonplace} />
      </div>
    )
  }
}
