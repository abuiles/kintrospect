// @flow
import React from 'react';
import TimeAgo from 'react-timeago';

import {
  Link
} from 'react-router-dom';

import { observer, inject } from 'mobx-react'

import SearchInput, { createFilter } from 'react-search-input'

const KEYS_TO_FILTERS = ['highlight', 'name']

import NotesEditor from './NotesEditor';
import Editor from './Editor';
import AnnotationView from './Annotation';
import { Book, Annotation } from '../stores/Book'
import AmazonStore from '../stores/Amazon'
import NoteStore from '../stores/Note'

interface BookState {
  open: boolean,
  searchTerm: string,
  selectedAnnotation: any
}

@inject('amazonStore', 'notesStore')
@observer
export default class BookView extends React.Component {
  constructor(props: { book: Book }) {
    super(props);

    this.state = {
      open: false,
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

  selectAnnotation(annotation: any) {
    this.setState({
      selectedAnnotation: this.state.selectedAnnotation === annotation ? null : annotation
    })
  }

  searchUpdated(term: string) {
    this.setState({ searchTerm: term })
  }

  addAllAnnotationsToEditor() {
    const { book, notesStore } = this.props
    const { annotations, isKindleBook } = book
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
              isKindleBook={book.isKindleBook}
              showBookTitle={false}
              isHighlighted={annotation === selectedAnnotation}
              selectAnnotation={(selected) => this.selectAnnotation(selected)}
            />
          </div>
        )}
      </div>
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
          {!notesStore.loading && <Editor book={book} />}
        </div>
      </div>
    );
  }
}
