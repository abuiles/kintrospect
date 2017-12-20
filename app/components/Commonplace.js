// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import SearchInput, { createFilter } from 'react-search-input'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from 'react-virtualized'
import Drawer from 'react-motion-drawer';

import NotesEditor from './NotesEditor';
import AnnotationView from './Annotation';
import BookCover from './BookCover'

import { Commonplace } from '../stores/Commonplace'
import NoteStore from '../stores/Note'
import RootStore from '../stores/Root'

const KEYS_TO_FILTERS = ['highlight', 'name', 'bookTitle']

@inject('notesStore', 'rootStore')
@observer
export default class CommonplaceView extends Component {

  state: {
    searchTerm: string,
    selectedAnnotation: any,
    selectedBooks: [],
    isDrawerOpen: boolean
  }

  state = {
    searchTerm: '',
    selectedAnnotation: null,
    selectedBooks: [],
    isDrawerOpen: false
  }

  props: {
    commonplace: Commonplace,
    notesStore: NoteStore,
    rootStore: RootStore
  }

  onBookSelection = (book) => {
    const { selectedBooks } = this.state
    if (!selectedBooks.includes(book)) {
      selectedBooks.push(book)
    }
  }

  onBookDeselection = (book) => {
    const { selectedBooks } = this.state
    const idx = selectedBooks.indexOf(book)
    if (idx !== -1) {
      selectedBooks.splice(idx, 1)
    }
  }

  searchUpdated(term: string) {
    this.setState({ searchTerm: term })
  }

  selectAnnotation(annotation: any) {
    const { selectedAnnotation } = this.state

    this.setState({
      selectedAnnotation: selectedAnnotation === annotation ? null : annotation
    })
  }

  toggleDrawer(open) {
    this.setState({
      isDrawerOpen: open
    })
  }

  render() {
    const { commonplace, notesStore, rootStore } = this.props
    const { searchTerm, selectedAnnotation, isDrawerOpen, selectedBooks } = this.state
    const { title } = commonplace

    const annotations = rootStore.allAnnotations(selectedBooks)

    const filteredAnnotations = annotations.filter(createFilter(searchTerm, KEYS_TO_FILTERS))

    const cache = new CellMeasurerCache({
      fixedWidth: true
    });

    const rowRenderer = (({ key, index, style, parent }) => {
      const annotation = filteredAnnotations[index]

      return (
        <CellMeasurer
          cache={cache}
          columnIndex={0}
          key={key}
          rowIndex={index}
          parent={parent}
        >
          <div className="pt1" style={style} key={key}>
            <div key={annotation.uniqueKey}>
              <AnnotationView
                annotation={annotation}
                asin={annotation.asin}
                isKindleBook={annotation.isKindleBook}
                isHighlighted={annotation === selectedAnnotation}
                selectAnnotation={(selected) => this.selectAnnotation(selected)}
                showBookTitle
              />
            </div>
          </div>
        </CellMeasurer>
      )
    })

    const didAddHighlight = (annotation) => {
      if (annotation.book.isKindleBook) {
        commonplace.addUsedBook(annotation.book.isKindleBook)
        rootStore.saveCommonplaces()
      }
    }
    const books = rootStore.allBooks

    const drawer = (
      <Drawer open={isDrawerOpen} className="bg-washed-blue" onChange={(open) => { this.toggleDrawer(open) }}>
        <ul className="list center mw6 ba b--light-silver br2" >
          {books.map((book) => (
            <BookCover book={book} onBookSelection={this.onBookSelection} onBookDeselection={this.onBookDeselection} key={book.asin} />
          ))}
        </ul>
      </Drawer>)

    return (
      <div className="flex w-100 h-100">
        <div className="w-40 bl b--near-white bg-light-gray flex flex-column pv3">
          <div className="ph3 mb2">
            <h2 className="f3 lh-title serif">
              {title}
            </h2>
            <button className="btn" onClick={() => { this.toggleDrawer(true) }}>
              Filter
            </button>
            {drawer}
            <SearchInput className="search-input w-100" onChange={(term) => this.searchUpdated(term)} />
          </div>
          <div className="overflow-y-auto h-100 ph3">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  deferredMeasurementCache={cache}
                  width={width}
                  height={height}
                  rowHeight={cache.rowHeight}
                  rowCount={filteredAnnotations.length}
                  rowRenderer={rowRenderer}
                />
              )}
            </AutoSizer>
          </div>
        </div>

        <div className="w-60 bg-light-gray">
          {!notesStore.loading && <NotesEditor book={commonplace} didAddHighlight={(annotation) => didAddHighlight(annotation)} />}
        </div>
      </div>
    );
  }
}
