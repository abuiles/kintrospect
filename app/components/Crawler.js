// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

export default class Crawler extends Component {
  constructor(props) {
    super(props)

    ipcRenderer.on('asynchronous-reply', (event, arg) => { this.crawlerDidFinish(event, arg) });
  }

  state: {
    isRunning: boolean
  }

  state = {
    isRunning: false
  }

  crawlerDidFinish(event, arg) {
    console.log(arg) // prints "pong"

    this.setState({
      isRunning: false
    })
  }

  runCrawler() {
    if (!this.state.isRunning) {
      this.setState({
        isRunning: true
      })
      ipcRenderer.send('asynchronous-message', 'ping')
    }
  }

  render() {
    const { isRunning } = this.state

    return (
      <div>
        {isRunning &&
          <button disabled>Fetching book data</button>
        }
        {!isRunning &&
          <button onClick={() => this.runCrawler()}>
            Refresh
          </button>
        }
      </div>
    );
  }
}
