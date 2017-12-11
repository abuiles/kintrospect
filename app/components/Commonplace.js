// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import SearchInput, { createFilter } from 'react-search-input'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from 'react-virtualized'

import NotesEditor from './NotesEditor';
import AnnotationView from './Annotation';

import { Commonplace } from '../stores/Commonplace'
import NoteStore from '../stores/Note'
import RootStore from '../stores/Root'

const KEYS_TO_FILTERS = ['highlight', 'name', 'bookTitle']

@inject('notesStore', 'rootStore')
@observer
export default class CommonplaceView extends Component {
  state: {
    searchTerm: string,
    selectedAnnotation: any
  }

  state = {
    searchTerm: '',
    selectedAnnotation: null
  }

  props: {
    commonplace: Commonplace,
    notesStore: NoteStore,
    rootStore: RootStore
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


  render() {
    const { commonplace, notesStore, rootStore } = this.props
    const { searchTerm, selectedAnnotation } = this.state
    const { title } = commonplace

    const annotations = rootStore.allAnnotations

    const filteredAnnotations = annotations.filter(createFilter(searchTerm, KEYS_TO_FILTERS))

    const cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50
    });

    const rowRenderer = (({key, index, isScrolling, isVisible, style}) => {
      const annotation = filteredAnnotations[index]
      debugger;

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

    const AnnotationsList = (({ list }) => (
      <List
        deferredMeasurementCache={cache}
        width={800}
        height={400}
        rowHeight={20}
        rowCount={list.length}
        rowRenderer={rowRenderer}
      />
    ))

    return (
      <div className="flex w-100 h-100">
        <div className="w-40 bl b--near-white bg-light-gray flex flex-column pv3">
          <div className="ph3 mb2">
            <h2 className="f3 lh-title serif">
              {title}
            </h2>
            <SearchInput className="search-input w-100" onChange={(term) => this.searchUpdated(term)} />
          </div>
          <div className="overflow-y-auto h-100 ph3">
            <AnnotationsList list={filteredAnnotations} />
          </div>
        </div>

        <div className="w-60 bg-light-gray">
          {!notesStore.loading && <NotesEditor book={commonplace} />}
        </div>
      </div>
    );
  }
}
