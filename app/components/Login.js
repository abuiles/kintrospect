import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import WebView from 'react-electron-web-view'
import ParseKindleDirectory from '../kindlereader'

import AmazonStore from '../stores/Amazon'

const { dialog, nativeImage } = require('electron').remote

@inject('amazonStore')
@observer
export default class Login extends Component {

  onDidFinishLoad({ currentTarget }) {
    const { amazonStore } = this.props

    currentTarget.style.height = '400px'
    amazonStore.setWebview(currentTarget)
  }

  props: {
    amazonStore: AmazonStore
  }

  fetchFromDevice() {
    const appIcon = nativeImage.createFromPath('./resources/icon.png')

    dialog.showMessageBox({
      type: 'info',
      icon: appIcon,
      buttons: ['Ok', 'Cancel'],
      title: 'Syncing from Kindle device',
      message: 'Select next the directory containing "My Clippings.txt" inside your Kindle device.',
      detail: 'If your language is not English, just select the directory that contains the equivalent.',
    }, (response) => {
      if (response === 0) {
        dialog.showOpenDialog({
          properties: ['openDirectory']
        }, (path) => {
          if (path) {
            const reader = new ParseKindleDirectory(path.toString())
            if (reader.hasValidPath()) {
              const { amazonStore } = this.props
              amazonStore.syncFromDevice(path)
              amazonStore.kindleSignedIn = true
              amazonStore.runCrawler()
            } else {
              dialog.showMessageBox({
                type: 'error',
                icon: appIcon,
                message: 'Clippings not found',
                detail: 'Make sure you selected the right directory.'
              })
            }
          }
        })
      }
    })
  }

  render() {
    const { amazonStore } = this.props
    const { kindleSignedIn, hasWebview } = amazonStore
    let logInDisclaimer = null
    let syncComponent = (
      <div>
        <h1 className="f3 blue">
      Choose a sync option
        <div>
          <button className="btn f6 mt4 mr4" onClick={() => { this.fetchFromDevice() }} >Fetch from Device</button>
          <button className="btn f6 mt4" onClick={() => { amazonStore.syncFromCloud() }} >Sync from Cloud</button>
        </div>
        </h1>
      </div>)

    if (amazonStore.syncingFromCloud) {
      syncComponent = (
        <WebView
          src={amazonStore.amazonUrl()}
          allowpopups
          onDidFinishLoad={(webview) => this.onDidFinishLoad(webview)}
        />)
      logInDisclaimer = (<p className="f3 ma0">Login first into the Kindle Cloud Reader using the account associated with your Kindle - we don't store or have access to your email or password.</p>)
    } else if (amazonStore.syncingFromDevice) {
      syncComponent = (
        <div>
          <h2 className="f3 blue">Something went wrong!</h2>
          <h1 className="f3 blue">Make sure your device is connected.</h1>
        </div>
      )
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
