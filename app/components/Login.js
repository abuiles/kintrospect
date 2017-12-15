import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import WebView from 'react-electron-web-view'
import FontAwesome from 'react-fontawesome'

import ParseKindleDirectory from '../kindlereader'

import { AmazonStore, syncOptions } from '../stores/Amazon'

const { dialog, nativeImage } = require('electron').remote

@inject('amazonStore')
@observer
export default class Login extends Component {

  onDidFinishLoad({ currentTarget }) {
    const { amazonStore } = this.props
    currentTarget.style.flex = '0 1'
    currentTarget.style.width = '0'
    currentTarget.style.height = '0'

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

  fetchFromCloud() {
    this.props.amazonStore.signIn()
  }

  render() {
    const { amazonStore } = this.props
    const { kindleSignedIn, hasWebview } = amazonStore
    let logInDisclaimer = null
    let backArrow = null
    let syncComponent = (
      <div>
        <p className="f3 mt0 mb5">Please select a data source to get started</p>
        <div className="flex justify-center paragraph center">
          <div className="tc">
            <FontAwesome name="tablet" size="5x" className="db f-6 mb1" />
            <icon  />
            <a className="btn mh2 pointer db" onClick={() => { this.fetchFromDevice() }} >Use Kindle Device (Via USB)</a>
          </div>

          <div className="tc">
            <FontAwesome name="cloud" size="5x" className="fa-3 db f-6 mb1" />
            <a className="btn mh2 pointer db" onClick={() => { this.fetchFromCloud() }} >Use Kindle Cloud Reader</a>
          </div>
        </div>
      </div>
    )

    if (amazonStore.syncingFromDevice) {
      syncComponent = (
        <div>
          <h2 className="f3 blue">Something went wrong!</h2>
          <h1 className="f3 blue">Make sure your device is connected.</h1>
        </div>
      )
    }

    return (
      <div className={`bg-near-white vh-100 tc ${(kindleSignedIn && hasWebview) ? 'dn' : 'db'}`} >
        {backArrow}
        <header className="mw-100 center tc pt5">
          <h2 className="f1 serif mb3">Welcome to Kintrospect!</h2>
          {logInDisclaimer}
        </header>
        <div className="center mw-100">
          {syncComponent}
        </div>
        <div className="o-0">
          <WebView
            style={{ width: 0, height: 0, flex: '0 1' }}
            src={amazonStore.amazonUrl()}
            allowpopups
            onDidFinishLoad={(webview) => this.onDidFinishLoad(webview) }
            />
        </div>
      </div>
    );
  }
}
