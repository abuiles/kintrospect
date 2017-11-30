/* 
For each book, save:

{
books:[{
          "title":"_title_here_"
          "authors":["_author_lastname, _author_name_","_author2_lastname, _author2_name_"]
          "asin":"_asin_here_"
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

const fileContents = fs.readFileSync('./samples/My Clippings.txt', 'utf-8');
const parsed = parse(fileContents);

const directories = new Map()
const files = fs.readdirSync('./samples/');
files.forEach(file => {
    const asinStartIndex = file.lastIndexOf("_")
    const title = file.substring(0, asinStartIndex).replace("_", ":")
    const asin = file.substring(asinStartIndex + 1, file.lastIndexOf("."))
    directories.set(title, asin)
  });

const books = []
parsed.forEach(function(item) {
  const { title, highlights } = item  

  title_idx = title.lastIndexOf("(")
  simple_title = title.substring(0, title_idx - 1)
  authors = title.substring(title_idx)
  
  annotations = []
  highlights.forEach(function(annotation) {
    const { metadata, text } = annotation

    location = Math.ceil(parseInt(metadata.substring(metadata.indexOf("Location ") + 9))/150)
    annotation = {highlight: text, location}
    annotations.push(annotation)
  })
  book = {title: simple_title, authors, asin: directories.get(simple_title), annotations}
  books.push(book)
});
