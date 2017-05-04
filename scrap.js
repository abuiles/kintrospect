const Client = require('./scraper/client');

const client = new Client('builes.adolfo@gmail.com', '');

client.loadBooks().then((results) => {
  console.log('main', results)
})
