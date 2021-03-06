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
    // if (!fs.existsSync(this.directoryPath + this.myClippings)) {

    // }
  }

  hasValidPath(): boolean {
    return fs.existsSync(this.directoryPath + this.myClippings)
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

    files.forEach(file => {
      const asinStartIndex = file.lastIndexOf(underscore)
      const title = file.substring(0, asinStartIndex)
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
    const charsToAvoid = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']

    parsedFileFromKindle.forEach((item) => {
      const { title, highlights } = item

      // Author and Title
      const titleIdx = title.lastIndexOf('(')
      let simpleTitle = title.substring(0, titleIdx - 1)
      let authors = title.substring(titleIdx)

      if (!simpleTitle && authors) {
        simpleTitle = authors
        authors = ''
      }

      const searchTitle = simpleTitle.split('')
      let newSearchTitle = ''
      searchTitle.forEach((char, index) => {
        if (charsToAvoid.includes(char)) {
          searchTitle[index] = '_'
        }
        // Used to avoid toString joining the characters with commas
        newSearchTitle += searchTitle[index]
      })

      // ASIN
      let asin = directories.get(simpleTitle) || ''
      if (!asin) {
        directories.forEach((value, key) => {
          if (newSearchTitle.includes(key)) {
            asin = value
          } else if (key.includes(newSearchTitle)) {
            asin = value
            simpleTitle = key
          }
        })
      }

      // Date
      const highlightsUpdatedAt = new Date()

      // Book
      if (asin) {
        // Annotations
        const annotations = []
        highlights.forEach((annotation, index) => {
          const { metadata, text } = annotation

          const location = parseInt(metadata.substring(metadata.indexOf('Location ') + 9))
          annotations.push({
            highlight: text,
            location,
            highlightId: `kintrospect-${asin}-${index}`
          })
        })

        books.push({ title: simpleTitle, authors, asin, highlightsUpdatedAt, annotations })
      }
    });

    return books
  }
}


/* const kindleFile = new ParseKindleDirectory('../samples')
const books = kindleFile.getParsedFiles()
console.log(books)
 */
