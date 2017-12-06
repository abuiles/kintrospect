import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import WebView from 'react-electron-web-view'
import ParseKindleDirectory from '../kindlereader'

import AmazonStore from '../stores/Amazon'

const { dialog } = require('electron').remote

const SyncOption = {
  FetchFromDevice: 'fetchFromDevice',
  SyncFromCloud: 'syncFromCloud',
  Unknown: ''
}

@inject('amazonStore')
@observer
export default class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {
      syncOption: SyncOption.Unknown
    }
  }

  onDidFinishLoad({ currentTarget }) {
    const { amazonStore } = this.props

    currentTarget.style.height = '400px'
    amazonStore.setWebview(currentTarget)
  }

  componentWillMount() {
    const { amazonStore } = this.props
    const { syncOption } = this.state
    if (!amazonStore.kindleSignedIn && syncOption !== SyncOption.Unknown) {
      this.setState({
        syncOption: SyncOption.Unknown
      })
    }
  }

  props: {
    amazonStore: AmazonStore
  }

  syncFromCloud() {
    this.setState({
      syncOption: SyncOption.SyncFromCloud
    })
  }

  fetchFromDevice() {    
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (path) => {
      if (path) {
        const reader = new ParseKindleDirectory(path.toString())
        if (reader.hasValidPath()) {
          this.setState({
            syncOption: SyncOption.FetchFromDevice
          })
          const { amazonStore } = this.props
          amazonStore.kindleSignedIn = true
          amazonStore.runKindleCrawler(path.toString())
        } else {
          dialog.showErrorBox('Clippings not found.', 'Make sure you selected the right directory.')
        }
      } 
    })
  }

  render() {
    const { amazonStore } = this.props
    const { kindleSignedIn, hasWebview } = amazonStore
    const { syncOption } = this.state

    let logInDisclaimer = null
    let syncComponent = (
    <div>
      <h1 className="f3 blue">
      Choose a sync option
        <div>
          <button className="btn f6 mt4 mr4" onClick={() => { this.fetchFromDevice() }} >Fetch from Device</button>
          <button className="btn f6 mt4" onClick={() => { this.syncFromCloud() }} >Sync from Cloud</button>
        </div>
      </h1>
    </div>)

    if (!kindleSignedIn && syncOption === SyncOption.SyncFromCloud) {
      syncComponent = (
      <WebView
        src={amazonStore.amazonUrl()}
        allowpopups
        onDidFinishLoad={(webview) => this.onDidFinishLoad(webview)}
      />)
      logInDisclaimer = (<p className="f3 ma0">Login first into the Kindle Cloud Reader using the account associated with your Kindle - we don't store or have access to your email or password.</p>)
    } else if (kindleSignedIn && syncOption === SyncOption.FetchFromDevice) {
      syncComponent = (
      <div>
        <h2 className="f3 blue">Something went wrong!</h2>
        <h1 className="f3 blue">Make sure your device is connected.</h1>
      </div>)
    }

    return (
      <div className={`bg-blue vh-100 tc ${(kindleSignedIn && hasWebview) ? 'dn' : 'db'}`} >
        <header className="paragraph mw-100 center tc white pt5 pb4">
          <h2 className="f1 mb2">Welcome to Kintrospect!</h2>
          {logInDisclaimer}
        </header>
        <div className="center pa4 bg-white paragraph mw-100 br2">
          {syncComponent}
        </div>
      </div>
    );
  }
}
