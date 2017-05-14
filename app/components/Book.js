// @flow
import React from 'react';
import Drawer from 'react-motion-drawer';

import {
  Link
} from 'react-router-dom';

import { observer, inject } from 'mobx-react'

import SearchInput, { createFilter } from 'react-search-input'

const KEYS_TO_FILTERS = ['highlight', 'name']

import NotesEditor from './NotesEditor';
import AnnotationView from './Annotation';
import { Book, Annotation } from '../stores/Book'
import Crawler from '../components/Crawler'
import AmazonStore from '../stores/Amazon'

interface BookState {
  open: boolean,
  currentLocation: number,
  locations: number[],
  searchTerm: string
}

@inject('amazonStore')
@observer
export default class BookView extends React.Component {
  constructor(props: { book: Book }) {
    super(props);
    // assume annotations are sorted
    let location: number = 0

    if (this.props.book.annotations[0]) {
      location = this.props.book.annotations[0].location
    }

    this.state = {
      open: false,
      currentLocation: location,
      locations: [location],
      searchTerm: ''
    };
  }

  state: BookState

  props: {
    book: Book,
    amazonStore: AmazonStore
  }

  handleToggle() {
    this.setState({ open: !this.state.open });
  }

  updateLocation(isCurrent: boolean, { location }: Annotation) {
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

  scrollToChapter(chapter: Annotation) {
    const tag = document.getElementById(chapter.linkId);

    if (tag) {
      tag.scrollIntoView();
    }
  }

  searchUpdated(term: string) {
    this.setState({ searchTerm: term })
  }

  render() {
    const { book, amazonStore } = this.props;
    const { open } = this.state;
    const chapters = book.annotations.filter((a) => a.isChapter)
    const { isRunning } = amazonStore

    const filteredAnnotations = book.annotations.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))

    const annotationsList = (
      <div>
        {filteredAnnotations.map((annotation) =>
          <div id={annotation.linkId} key={annotation.uniqueKey}>
            <AnnotationView
              annotation={annotation}
              updateLocation={(isSticky, chapter) => this.updateLocation(isSticky, chapter)}
            />
            <div className="fboard f0 flex flex-wrap">
              {annotation.annotations.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS)).map((hl) =>
                <div key={hl.uniqueKey}>
                  <AnnotationView
                    annotation={hl}
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
      <div className={ `flex w-100 ${isRunning ? 'o-40':''}` }>
        <Drawer className="bg-washed-blue" open={open} containerStyle={{ zIndex: 4000 }}>
          <button type="button" className="f3" onClick={() => this.handleToggle()} >
            Table of contents
          </button>
          <ul className="list pl0 ml0 center mw6 ba b--light-silver br2" >
            {chapters.map((a) =>
              <li className="ph3 pv3 bb b--light-silver" key={a.uniqueKey}>
                <button type="button" onClick={() => this.scrollToChapter(a)}>
                  {a.name}
                </button>
              </li>
            )}
          </ul>
          <img alt="book cover" src={`http://images.amazon.com/images/P/${book.asin}`} />
        </Drawer>
        <div className="bg-blue pa3 dib">
          <Link className="db mb2" to="/" >
            <i className="fa fa-home white" aria-hidden="true"></i>
          </Link>
          <button className="db mb4 bn pa0 bg-inherit" onClick={() => this.handleToggle()}>
            <i className="fa fa-th-list white" aria-hidden="true"></i>
          </button>
          <Crawler />
        </div>
        <div style={{ height: 1000 }} className="w-40 pa3 bl b--near-white bg-light-gray overflow-y-auto">
          <h2>
            {book.title}
          </h2>
          <h3>{book.annotations.length} annotations</h3>
          <p>Highlights updated on: {book.highlightsUpdatedAt} </p>
          <SearchInput className="search-input mb3 w-100" onChange={(term) => this.searchUpdated(term)} />
          {book.annotations.length ? annotationsList : <h3>{amazonStore.isRunning ? "Downloading your highlights" : "You don't have annotations"}</h3>}
        </div>
        <div style={{ height: 1000 }} className="w-60 bg-light-gray overflow-y-auto pa3">
          <NotesEditor book={book}/>
        </div>
      </div>
    );
  }
}
