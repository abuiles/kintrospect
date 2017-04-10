// @flow
import React from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import {List, ListItem} from 'material-ui/List';

import Annotation, { AnnotationObject } from './Annotation';


export class BookObject {
  bookCover: string;
  title: string;
  annotations: Array<AnnotationObject>;

  constructor(payload) {
    this.bookCover = payload.bookCover;
    this.title = payload.title;
    this.annotations = payload.annotations.map((annotation) => new AnnotationObject(annotation));
  }
}

export default class Book extends React.Component {
  props: {
    book: BookObject
  }

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  render() {
    return (
      <div>
        <Drawer open={this.state.open}>
          <AppBar
            title="Table of contents"
            iconElementRight={<IconButton><NavigationClose /></IconButton>}
            showMenuIconButton={false}
            onTitleTouchTap={this.handleToggle}
            onRightIconButtonTouchTap={this.handleToggle}
          />
          <List>
            {this.props.book.annotations.filter((a) => a.isChapter()).map((a) =>
              <ListItem primaryText={a.name} />
            )}
          </List>
          <img alt="book cover" src={this.props.book.bookCover} />
        </Drawer>
        <AppBar
          title={this.props.book.title}
          onTitleTouchTap={this.handleToggle}
          onLeftIconButtonTouchTap={this.handleToggle}
        />

        {this.props.book.annotations.map((annotation) =>
          <Annotation
            annotation={annotation}
            key={annotation.location || annotation.timestamp}
          />
        )}
      </div>
    );
  }
}

// bookCover
// title
// annotations
// annotations.type == 'chapter'
// annotation.name
// annotation.location
// annotation.annotations
// asin: asin,
// highlight: highlight,
// startLocation: startLocation,
// endLocation: endLocation,
// timestamp: timestamp,
// location: location

        // <div data-tid="container">
        //   {annotations.map((annotation) =>
        //     <Annotation
        //       annotation={annotation}
        //       key={annotation.location || annotation.timestamp}
        //     />
        //   )}
        // </div>
