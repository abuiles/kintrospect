// @flow
import React from 'react'
import { StickyContainer, Sticky } from 'react-sticky'
import Drawer from 'react-motion-drawer'
import {
  Link
} from 'react-router-dom'

import Annotation, { AnnotationObject } from './Annotation';

export class BookObject {
  bookCover: string;
  title: string;
  asin: string;
  updatedAt: string;
  annotations: AnnotationObject[];

  constructor({ bookCover, title, asin, annotations }) {
    this.bookCover = bookCover;
    this.title = title;
    this.asin = asin;
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
        <Drawer className="bg-washed-blue" open={open} containerStyle={{ zIndex: 4000 }}>
          <h2 onClick={() => this.handleToggle()} >
            Table of contents
          </h2>
          <ul className="list pl0 ml0 center mw6 ba b--light-silver br2" >
            {chapters.map((a) =>
              <li className="ph3 pv3 bb b--light-silver" key={a.location}>
                <a href={`#${a.linkId}`} >{a.name}</a>
              </li>
            )}
          </ul>
          <img alt="book cover" src={`http://images.amazon.com/images/P/${book.asin}`} />
        </Drawer>
        <StickyContainer>
          <Sticky style={{ zIndex: 2000 }} className="bg-washed-blue" >
            <h2 onClick={() => this.handleToggle()}>
              {book.title}
            </h2>
            <Link to="/" >
              Home
            </Link>
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
