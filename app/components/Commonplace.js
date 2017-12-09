// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import SearchInput, { createFilter } from 'react-search-input'
import { Commonplace } from '../stores/Commonplace'

@observer
export default class CommonplaceView extends Component {
  state: {
    searchTerm: string
  }

  state = {
    searchTerm: ''
  }

  props: {
    commonplace: Commonplace
  }

  searchUpdated(term: string) {
    this.setState({ searchTerm: term })
  }

  render() {
    const { commonplace: { title } } = this.props

    return (
      <div className="flex w-100 h-100">
        <div className="w-40 bl b--near-white bg-light-gray flex flex-column pv3">
          <div className="ph3 mb2">
            <h2 className="f3 lh-title serif">
              {title}
            </h2>
            <SearchInput className="search-input w-100" onChange={(term) => this.searchUpdated(term)} />
          </div>
          <div className="overflow-y-auto h-100 ph3">
            <p>highlights come here</p>
          </div>
        </div>

        <div className="w-60 bg-light-gray">
          <h1>Commonplace editor comes here</h1>
        </div>
      </div>
    );
  }
}
