import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import WebView from 'react-electron-web-view'
import ParseKindleDirectory from '../kindlereader'

import { AmazonStore, syncOptions } from '../stores/Amazon'

const { dialog, nativeImage } = require('electron').remote

@inject('amazonStore')
@observer
export default class Login extends Component {

  onDidFinishLoad({ currentTarget }) {
    const { amazonStore } = this.props

    currentTarget.style.height = '700px'
    // currentTarget.style.flex = '0 1'
    // style={{ width: "0px", height: "0px", flex: "0 1" }}
    amazonStore.setWebview(currentTarget)
  }

  props: {
    amazonStore: AmazonStore
  }

  goBack() {
    const { amazonStore } = this.props
    amazonStore.setUserPreferences({
      syncOption: syncOptions.Unknown
    })
  }

  fetchFromDevice() {
    const appIcon = nativeImage.createFromPath('./resources/icon.png')

    dialog.showMessageBox({
      type: 'info',
      icon: appIcon,
      buttons: ['Ok', 'Cancel'],
      title: 'Syncing from Kindle device',
      message: 'Next, select the directory containing "My Clippings.txt" inside your Kindle device.',
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
    let backArrow = null
    let syncComponent = (
      <div>
        <h2 className="white">1. Select a data source:</h2>
        <ul className="list pl0 mt0 measure center">
          <li className="flex items-center lh-copy pa3 ph0-l bb b--black-10">
            <div className="pl3 flex-auto">
              <a className="pointer f3 link dim br-pill ba ph3 pv2 mb2 dib white" onClick={() => { this.fetchFromDevice() }} >
                <icon className="fa fa-tablet fa-3 white" /> Use Kindle Device (Via USB).
              </a>
            </div>
          </li>
          <li className="flex items-center lh-copy pa3 ph0-l bb b--black-10">
            <div className="pl3 flex-auto">
              <a className="pointer f3 link dim br-pill ba ph3 pv2 mb2 dib white" onClick={() => { amazonStore.syncFromCloud() }} >
                <icon className="fa fa-cloud fa-3 white" /> Use the Kindle Cloud Reader.
              </a>
            </div>
          </li>
        </ul>
      </div>
    )

    if (amazonStore.syncingFromCloud) {
      syncComponent = (
        <WebView
          src={amazonStore.amazonUrl()}
          allowpopups
          onDidFinishLoad={(webview) => this.onDidFinishLoad(webview)}
        />)
      logInDisclaimer = (<p className="f3 ma0">Sign into the Kindle Cloud Reader account associated with your Kindle - we don't store or have access to your email or password.</p>)
      backArrow = (<button className="mt0 lh-solid f2 fw9 white" onClick={() => { this.goBack() }}>Back</button>)
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
        {backArrow}
        <header className="paragraph mw-100 center tc white pt5 pb4">
          <h2 className="f1 mb2">Welcome to Kintrospect!</h2>
          {logInDisclaimer}
        </header>
        <div className="center pa2 paragraph mw-100 br2">
          {syncComponent}
        </div>
      </div>
    );
  }
}
