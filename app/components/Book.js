// @flow
import React from 'react';
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
      <div>
        {book.annotations.map((annotation) =>
          <div id={annotation.linkId}>
            <Annotation
              annotation={annotation}
              key={annotation.location || annotation.timestamp}
              updateLocation={(isSticky, chapter) => this.updateLocation(isSticky, chapter)}
            />
            <div className="fboard f0 flex flex-wrap">
              {annotation.annotations.map((hl) =>
                <div key={hl.timestamp}>
                  <Annotation
                    annotation={hl}
                    key={hl.timestamp}
                    updateLocation={(isSticky, chapter) => this.updateLocation(isSticky, chapter)}
                  />
                </div>
            )}
            </div>
          </div>
        )}
      </div>
    )

    return (
      <div className="flex w-100 ph3-ns">
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
        <div className="bg-washed-blue dib" >
          <button onClick={() => this.handleToggle()}>
            Table of contents
          </button>
          <Link to="/" >
            Home
          </Link>
        </div>
        <div style={{ height: 1000 }} className="w-40 pa1 ba overflow-y-auto">
          <h2>
            {book.title}
          </h2>
          {book.annotations.length ? annotationsList : <h3>{"You don't have annotations"}</h3>}
        </div>
        <div style={{ height: 1000 }} className="w-60 mr-2 ba pa1 overflow-y-auto">
          <NotesEditor book={book}/>
        </div>
      </div>
    );
  }
}
