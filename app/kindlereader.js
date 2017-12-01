/*
Formats each book as:

{
books:[{
          "title":"_title_here_"
          "authors":["_author_lastname, _author_name_","_author2_lastname, _author2_name_"]
          "asin":"_asin_here_"
          "highlightsUpdatedAt":"_date_here_"
          "annotations":[{
                          "highlight":"_highlight_here_"
                          "location":"_location_here_"
                          }, {
                          "highlight":"_highlight_here_"
                          "location":"_location_here_"
                          }, {
                          "highlight":"_highlight_here_"
                          "location":"_location_here_"
                          }]
        }, {
          "title": "_title_here_"
          "authors": [ "_author_lastname, _author_name_" ]
          "asin": "_asin_here_"
          "annotations": [{
                          "highlight": "_highlight_here_"
                          "location": "_location_here_"
                          }]
        }]
}

let ParsedAnnotation = {
  highlight: String,
  location: String
}

let ParsedBook = {
  title: String,
  authors: [],
  asin: String,
  annotations: []
}
*/

const fs = require('fs');
const parse = require('@sole/kindle-clippings-parser').parse;

module.exports = class ParseKindleDirectory {

  constructor(directoryPath, myClippings = 'My Clippings.txt') {
    this.directoryPath = directoryPath
    this.myClippings = (this.directoryPath.endsWith('/') ? '' : '/') + myClippings
    if (this.directoryPath.includes(this.myClippings)) {
      this.directoryPath = this.directoryPath.substring(0, this.directoryPath.indexOf(this.myClippings))
    }
  }

  parseFileFromKindle(format = 'utf-8') {
    const fileContents = fs.readFileSync(this.directoryPath + this.myClippings, format);
    const parsed = parse(fileContents);

    return parsed
  }

  getDirectories() {
    const files = fs.readdirSync(this.directoryPath);

    const directories = new Map()
    const underscore = '_'
    const colon = ':'

    files.forEach(file => {
      const asinStartIndex = file.lastIndexOf(underscore)
      let title = file.substring(0, asinStartIndex)
      while (title.includes(underscore)) {
        title = title.replace(underscore, colon)
      }
      const asin = file.substring(asinStartIndex + 1, file.lastIndexOf('.'))
      if (title && asin) {
        directories.set(title, asin)
      }
    });

    return directories
  }

  getParsedFiles() {
    const books = []
    const directories = this.getDirectories()
    const parsedFileFromKindle = this.parseFileFromKindle()

    parsedFileFromKindle.forEach(function(item) {
      const { title, highlights } = item

      // Author and Title
      const titleIdx = title.lastIndexOf('(')
      let simpleTitle = title.substring(0, titleIdx - 1)
      let authors = title.substring(titleIdx)

      if (!simpleTitle && authors) {
        simpleTitle = authors
        authors = ''
      }

      // Annotations
      const annotations = []
      highlights.forEach(function(annotation) {
        const { metadata, text } = annotation

        const location = Math.ceil(parseInt(metadata.substring(metadata.indexOf('Location ') + 9))/150)
        annotations.push({ highlight: text, location })
      })

      // ASIN
      let asin = directories.get(simpleTitle) || ''
      if (!asin) {
        directories.forEach(function(value, key) {
          if (simpleTitle.includes(key)) {
            asin = value
          } else if (key.includes(simpleTitle)) {
            asin = value
            simpleTitle = key
          }
        })
      }

      // Date
      const highlightsUpdatedAt = new Date()

      // Book
      if (asin) {
        books.push({ title: simpleTitle, authors, asin, highlightsUpdatedAt, annotations })
      }
    });

    return books
  }
}

/*
const kindleFile = new ParseKindleDirectory('./samples')
const books = kindleFile.getParsedFiles()
console.log(books)
*/
