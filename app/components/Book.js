// @flow
import React from 'react';
import { StickyContainer, Sticky } from 'react-sticky';
import Drawer from 'react-motion-drawer';
import {
  Link
} from 'react-router-dom';

import NotesEditor from './NotesEditor';
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
    let location: number = 0

    if (this.props.book.annotations[0]) {
      location = this.props.book.annotations[0].location
    }

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

  scrollToChapter(chapter: AnnotationObject) {
    const tag = document.getElementById(chapter.linkId);

    if (tag) {
      tag.scrollIntoView();
    }
  }

  render() {
    const { book } = this.props;
    const { open } = this.state;
    const chapters = book.annotations.filter((a) => a.isChapter);

    const annotationsList = (
      <StickyContainer>
        {book.annotations.map((annotation) =>
          <Annotation
            annotation={annotation}
            key={annotation.location || annotation.timestamp}
            updateLocation={(isSticky, chapter) => this.updateLocation(isSticky, chapter)}
          />
        )}
      </StickyContainer>
    )

    return (
      <div className="flex ph3-ns">
        <Drawer className="bg-washed-blue" open={open} containerStyle={{ zIndex: 4000 }}>
          <button type="button" className="f3" onClick={() => this.handleToggle()} >
            Table of contents
          </button>
          <ul className="list pl0 ml0 center mw6 ba b--light-silver br2" >
            {chapters.map((a) =>
              <li className="ph3 pv3 bb b--light-silver" key={a.location}>
                <button type="button" onClick={() => this.scrollToChapter(a)}>
                  {a.name}
                </button>
              </li>
            )}
          </ul>
          <img alt="book cover" src={`http://images.amazon.com/images/P/${book.asin}`} />
        </Drawer>
        <StickyContainer className="w-40 relative">
          <Sticky style={{ zIndex: 2000 }} className="bg-washed-blue" >
            <button onClick={() => this.handleToggle()}>
              {book.title}
            </button>
            <Link to="/" >
              Home
            </Link>
          </Sticky>
          <div className="absolute-fill">
            {book.annotations.length ? annotationsList : <h3>{"You don't have annotations"}</h3>}
          </div>
        </StickyContainer>
        <div className="w-60 relative">
          <NotesEditor />
        </div>
      </div>
    );
  }
}
