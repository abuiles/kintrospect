const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })
const fs = require('fs')


const KINDLE_LOGIN_PAGE = "http://kindle.amazon.com/login"
const SIGNIN_FORM_IDENTIFIER = "signIn"
const BATCH_SIZE  = 200;


class Client {
  constructor(email, password) {
    this.email = email
    this.password = password
    this.books = []
  }
  createSession() {
    console.log('scraping')
    return nightmare
      .goto(KINDLE_LOGIN_PAGE)
      .type('#ap_email', this.email)
      .type('#ap_password', this.password)
      .click('#signInSubmit')
      .wait('#ap_container')
  }
  loadBooks() {
    const session =  this.createSession()
    nightmare
      .goto('https://kindle.amazon.com/your_reading')
      .wait('#yourReadingList')
    return nightmare
      .evaluate(function() {
        return new Promise(function(resolve) {
          const pagination = document.querySelectorAll('.paginationLinks.bottomPagination')[0];
          const nextLinks = Array.from(pagination.getElementsByTagName('a'))
                .filter(function(link) {
                  console.log(link.text)
                  return link.text.indexOf("Next") < 0
                })
                .map((link) => link.href)

          const result = {}

          if (nextLinks) {
            result.nextLinks = nextLinks
          }

          resolve(result)
        });
      })
      .then((result) => {
        console.log(result)
        const urls = result.nextLinks
        urls.unshift('https://kindle.amazon.com/your_reading')
        urls.reduce(function(accumulator, url) {
          return accumulator.then(function(results) {
            console.log('loading', url)
            return nightmare.goto(url)
              .wait('body')
              .evaluate(function() {
                const books = [];
                const kindleBooks = Array.from(document.getElementsByClassName('titleAndAuthor'))
                kindleBooks.forEach(function(book) {
                  const meta = {}
                  const link = book.getElementsByTagName('a')[0];
                  meta.url = link.href
                  meta.title = link.text
                  meta.asin = meta.url.split('/').reverse()[0]

                  const parent = book.parentElement
                  const img = parent.getElementsByClassName('bookCover')[0]
                  meta.bookCover = img.src

                  const reading = parent.getElementsByClassName('readActive').length || parent.getElementsByClassName('readingActive').length

                  if (reading) {
                    books.push(meta)
                  }
                })

                return books
              })
              .then(function(result){
                results.push(result);
                return results;
              })
          });
        }, Promise.resolve([])).then(function(results) {
          console.dir(results)

          const books = results.reduce(function(accumulator, books) {
            return [...accumulator, ...books]
          }, []);
          fs.writeFileSync('books.js', JSON.stringify(books))

          return nightmare.end();
        })
      })
  }

}
module.exports = Client;
