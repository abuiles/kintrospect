// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import SearchInput, { createFilter } from 'react-search-input'

import NotesEditor from './NotesEditor';
import AnnotationView from './Annotation';

import { Commonplace } from '../stores/Commonplace'
import NoteStore from '../stores/Note'
import RootStore from '../stores/Root'

const KEYS_TO_FILTERS = ['highlight', 'name']

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

    const AnnotationsList = (({ list }) => (
      <div className="pt1">
        {list.map((annotation) =>
          <div id={annotation.linkId} key={annotation.uniqueKey}>
            <AnnotationView
              annotation={annotation}
              asin={annotation.asin}
              isKindleBook={annotation.isKindleBook}
              isHighlighted={annotation === selectedAnnotation}
              selectAnnotation={(selected) => this.selectAnnotation(selected)}
            />
          </div>
        )}
      </div>
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
            {annotations.length ? <AnnotationsList list={filteredAnnotations} /> : !isRunning && <h3>Create some highlights first</h3>}
          </div>
        </div>

        <div className="w-60 bg-light-gray">
          {!notesStore.loading && <NotesEditor book={commonplace} />}
        </div>
      </div>
    );
  }
}
