// @flow
import React from 'react';
import Drawer from 'react-motion-drawer';
import TimeAgo from 'react-timeago';

import {
  Link
} from 'react-router-dom';

import { observer, inject } from 'mobx-react'

import SearchInput, { createFilter } from 'react-search-input'

const KEYS_TO_FILTERS = ['highlight', 'name']

import NotesEditor from './NotesEditor';
import AnnotationView from './Annotation';
import { Book, Annotation } from '../stores/Book'
import AmazonStore from '../stores/Amazon'
import NoteStore from '../stores/Note'

interface BookState {
  open: boolean,
  currentLocation: number,
  locations: number[],
  searchTerm: string,
  selectedAnnotation: any
}

@inject('amazonStore', 'notesStore')
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
      searchTerm: '',
      selectedAnnotation: null
    };
  }

  state: BookState

  props: {
    book: Book,
    amazonStore: AmazonStore,
    notesStore: NoteStore
  }

  // handleToggle() {
  //   // this.setState({ open: !this.state.open });
  // }

  selectAnnotation(annotation: any) {
    this.setState({
      selectedAnnotation: this.state.selectedAnnotation === annotation ? null : annotation
    })
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

  addAllAnnotationsToEditor() {
    const { book, notesStore } = this.props
    const { annotations } = book
    notesStore.addAnnotations(annotations)
  }

  render() {
    const { book, amazonStore, notesStore } = this.props;
    const { open, selectedAnnotation } = this.state;
    const chapters = book.annotations.filter((a) => a.isChapter)
    const { isRunning, kindleSignedIn } = amazonStore

    const filteredAnnotations = book.annotations.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))

    const annotationsList = (
      <div className="pt1">
        {filteredAnnotations.map((annotation) =>
          <div id={annotation.linkId} key={annotation.uniqueKey}>
            <AnnotationView
              annotation={annotation}
              asin={book.asin}
              isHighlighted={annotation === selectedAnnotation}
              updateLocation={(isSticky, chapter) => this.updateLocation(isSticky, chapter)}
              selectAnnotation={(selected) => this.selectAnnotation(selected)}
            />
          </div>
        )}
      </div>
    )

    const drawer = (
      <Drawer className="bg-washed-blue" open={open} containerStyle={{ zIndex: 4000 }}>
        <button type="button" className="f3" >
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
    )

    return (
      <div className="flex w-100 h-100">
        <div className="w-40 bl b--near-white bg-light-gray flex flex-column pv3">
          <div className="ph3 mb2">
            <h2 className="f3 lh-title serif">
              {book.title}
            </h2>
            <h3>{book.annotations.length} annotations</h3>
            {isRunning && <h3>Loading highlights</h3>}
            <p>
              Highlights updated <TimeAgo date={book.highlightsUpdatedAt} minPeriod={60} />
            </p>
            <SearchInput className="search-input w-100" onChange={(term) => this.searchUpdated(term)} />
            <button onClick={() => { this.addAllAnnotationsToEditor() }} className="btn f6 mt4 fr" >
              Add All &#187;
            </button>
          </div>
          <div className="overflow-y-auto h-100 ph3">
            {book.annotations.length ? annotationsList : !isRunning && <h3>Create some highlights first</h3>}
          </div>
        </div>

        <div className="w-60 bg-light-gray">
          {!notesStore.loading && <NotesEditor book={book} />}
        </div>
      </div>
    );
  }
}
