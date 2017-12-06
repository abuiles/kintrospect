// @flow
import { app, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import nodeFetch from 'node-fetch'
import graphClient from 'graphql-client'

import MenuBuilder from './menu'
import toMarkdown from './markdown'

let mainWindow = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install()
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')() // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer') // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ]

    const forceDownload = !!process.env.UPGRADE_EXTENSIONS

    // TODO: Use async interation statement.
    //       Waiting on https://github.com/tc39/proposal-async-iteration
    //       Promises will fail silently, which isn't what we want in development
    return Promise
      .all(extensions.map(name => installer.default(installer[name], forceDownload)))
      .catch(console.log)
  }
}

const { ipcMain } = require('electron')

const config = require('electron-settings');
const he = require('he');

ipcMain.on('books-crawled', (event, books) => {
  config.set('books', books)
  event.sender.send('books-saved', books)
  event.sender.send('books-loaded', books)
})

const KindleReader = require('./kindlereader')

ipcMain.on('read-from-kindle', (event, path) => {
  const reader = new KindleReader(path)
  const books = reader.getParsedFiles()

  config.set('books', books)

  event.sender.send('books-saved', books)
  event.sender.send('books-loaded', books)
})


ipcMain.on('save-notes', (event, asin, doc) => {
  const notes = config.get('notes') || {}

  notes[asin] = doc

  config.set('notes', notes)
})

ipcMain.on('highlights-crawled', (event, asin, items) => {
  const books = config.get('books')
  const book = books.find((b) => b.asin === asin)

  book.annotations = items.map((item) => {
    const copy = Object.assign({}, item)
    copy.highlight = he.decode(item.highlight)
    copy.location = item.location
    copy.asin = asin

    return copy
  })

  book.highlightsUpdatedAt = new Date()

  config.set('books', books)
  event.sender.send('books-saved', books)
  event.sender.send('books-loaded', books)
})

ipcMain.on('load-books', (event) => {
  event.sender.send('books-loaded', config.get('books') || [])
  event.sender.send('notes-loaded', config.get('notes') || {})

  nodeFetch('https://kintrospect.com/version.json').then((response) => {
    response.json().then(({ epoch }) => event.sender.send('app-version', epoch))
  })
})

ipcMain.on('download-notes', (event, title, asin) => {
  const dir = app.getPath('downloads')
  const filePath = path.join(dir, title);

  const mobiledoc = config.get('notes')[asin]

  toMarkdown(mobiledoc).then((markdown) => {
    fs.writeFileSync(filePath, markdown)

    if (process.platform === 'darwin') {
      dialog.showMessageBox(
        {
          message: 'The file has been saved in your Downloads folder.',
          buttons: ['OK']
        }
      );
    }
  });
})

ipcMain.on('publish-notes', (event, asin) => {
  const books = config.get('books')
  const book = books.find((b) => b.asin === asin)

  const mobiledoc = config.get('notes')[asin]

  const html = toHtml(mobiledoc)

  const client = graphClient({
    url: 'http://localhost:4000/graphql'
  })
  const query = `
mutation CreateBook($html: String, $asin: String, $bookCover: String, $title: String, $url: String) {
  book(html: $html, author: "johndoe", asin: $asin, bookCover: $bookCover,title: $title, url: $url) {
    asin
  }
}`

  const variables = {
    html,
    title: book.title,
    asin: book.asin,
    bookCover: `http://images.amazon.com/images/P/${book.asin}`,
    url: `https://www.amazon.com/gp/product/${book.asin}`
  }

  client.query(query, variables).then(() => {
    if (process.platform === 'darwin') {
      dialog.showMessageBox(
        {
          message: 'The file has been published.',
          buttons: ['OK']
        }
      );
    }
  }, (err) => {
    console.log('err', err)
    dialog.showMessageBox(
      {
        message: 'no bueno.',
        buttons: ['OK']
      }
    );
  })
})

ipcMain.on('restart', () => {
  // app.relaunch()
  // app.exit(0)
})

app.on('ready', async () => {
  await installExtensions()

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  })

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()
})
