                const books = [];
                const kindleBooks = Array.from(document.getElementsByClassName('titleAndAuthor'))
                kindleBooks.forEach(function(book) {
                  const meta = {}
                  const parent = book.parentElement
                  const link = book.getElementsByTagName('a')[0];
                  meta.url = link.href
                  meta.title = link.text
                  meta.asin = meta.url.split('/').reverse()[0]
                  console.log('meta', meta)
                  const img = parent.getElementsByClassName('bookCover')[0]
                  meta.bookCover = img.src

                  const reading = parent.getElementsByClassName('readActive').length || parent.getElementsByClassName('readingActive').length

                  if (reading) {
                    books.push(meta)
                  }

                  return books
                })
