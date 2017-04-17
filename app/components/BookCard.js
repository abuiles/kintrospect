// @flow
import React from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

import books from './books'
import FlatButton from 'material-ui/FlatButton';


const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    overflowY: 'auto'
  },
};


// {books.map((book) => (
// http://images.amazon.com/images/P/${book.asin}`

// http://stackoverflow.com/questions/33886418/how-to-get-book-cover-image-url-using-isbn
// http://images.amazon.com/images/P/PASTE_ISBN_NUMBER_HERE.01.20TRZZZZ.jpg
// http://helpful.knobs-dials.com/index.php/Amazon_notes#General
export default class BookCard extends React.Component {
  render() {
    return (
      <div>
        {books.map((book) => (
          <Card style={{ width: '25%' }}>
            <CardMedia>
              <img src={`http://images.amazon.com/images/P/${book.asin}`} />
            </CardMedia>
            <CardActions>
              <FlatButton label="Review highlights" />
            </CardActions>
          </Card>
        ))}
      </div>
    );
  }
}
