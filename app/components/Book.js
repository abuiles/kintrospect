// @flow
import React from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { List, ListItem, makeSelectable } from 'material-ui/List';
import { StickyContainer, Sticky } from 'react-sticky';

import Annotation, { AnnotationObject } from './Annotation';

const SelectableList = makeSelectable(List);

export class BookObject {
  bookCover: string;
  title: string;
  annotations: AnnotationObject[];

  constructor({ bookCover, title, annotations }) {
    this.bookCover = bookCover;
    this.title = title;
    this.annotations = annotations.map((annotation) => new AnnotationObject(annotation));
  }
}

interface BookState {
  open: boolean,
  currentLocation: number,
  locations: number[]
}

export default class Book extends React.Component {
  constructor(props: { book: BookObject }) {
    super(props);
    // assume annotations are sorted
    const { location } = this.props.book.annotations[0];
    this.state = {
      open: false,
      currentLocation: location,
      locations: [location]
    };
  }

  state: BookState

  props: {
    book: BookObject
  }

  handleToggle() {
    this.setState({ open: !this.state.open });
  }

  updateLocation(isCurrent: boolean, { location }: AnnotationObject) {
    const { locations } = this.state;
    if (isCurrent) {
      if (locations.indexOf(location) < 0) {
        locations.unshift(location);
      }

      this.setState({
        currentLocation: location,
        locations
      });
    } else if (locations.length) {
      locations.shift();

      this.setState({
        currentLocation: locations[0],
        locations
      });
    }
  }

  render() {
    const { book } = this.props;
    const { open, currentLocation } = this.state;
    const chapters = book.annotations.filter((a) => a.isChapter);

    return (
      <div>
        <Drawer open={open} containerStyle={{ zIndex: 4000 }}>
          <AppBar
            title="Table of contents"
            iconElementRight={<IconButton><NavigationClose /></IconButton>}
            showMenuIconButton={false}
            onTitleTouchTap={() => this.handleToggle()}
            onRightIconButtonTouchTap={() => this.handleToggle()}
          />
          <SelectableList
            value={currentLocation}
          >
            {chapters.map((a) =>
              <ListItem
                key={a.location}
                value={a.location}
                primaryText={a.name}
                href={`#${a.linkId}`}
              />
            )}
          </SelectableList>
          <img alt="book cover" src={book.bookCover} />
        </Drawer>
        <StickyContainer>
          <Sticky style={{ zIndex: 2000 }}>
            <h2 onClick={() => this.handleToggle()}>
              {book.title}
            </h2>
          </Sticky>
          <StickyContainer>
            {book.annotations.map((annotation) =>
              <Annotation
                annotation={annotation}
                key={annotation.location || annotation.timestamp}
                updateLocation={(isSticky, chapter) => this.updateLocation(isSticky, chapter)}
              />
            )}
          </StickyContainer>
        </StickyContainer>
      </div>
    );
  }
}
