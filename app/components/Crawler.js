// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'

import Spinner from './Spinner'
import AmazonStore from '../stores/Amazon'

@inject('amazonStore')
@observer
export default class Crawler extends Component {
  props: {
    amazonStore: AmazonStore
  }

  render() {
    const { amazonStore } = this.props
    const { isRunning } = amazonStore

    if (!amazonStore.hasWebview) {
      return <div><i className="fa fa-refresh white" aria-hidden="true"></i></div>
    }

    return (
      <div>
        {isRunning &&
          <Spinner />
        }
        {!isRunning &&
          <button className="bn pa0 bg-inherit" onClick={() => amazonStore.runCrawler()}>
            <i className="fa fa-refresh white" aria-hidden="true"></i>
          </button>
        }
      </div>
    );
  }
}
