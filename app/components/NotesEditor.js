// @flow
import React from 'react';
import { Container, Editor, MarkupButton, SectionButton, LinkButton } from 'react-mobiledoc-editor';
import { observer, inject } from 'mobx-react'
import { DropTarget } from 'react-dnd';
import { Book } from '../stores/Book';
import NoteStore from '../stores/Note';

import ItemTypes from './ItemTypes';
import HighlightCard from './HighlightCard';

const CARDS = [
  HighlightCard
]

function imageToCardParser(editor, annotation) {
  const payload = { annotation: annotation.card };

  editor.run((postEditor) => {
    postEditor.editor.insertCard('HighlightCard', payload)
  })
}

const boxTarget = {
  drop(props, monitor, component) {
    return {
      name: 'NotesEditor',
      component
    }
  }
}

@inject('notesStore')
@observer
class NotesEditor extends React.Component {
  state: {
    editor: any
  }

  state = {
    editor: null
  }

  onMobiledocChange(mobiledoc) {
    console.log('doc changed', mobiledoc)
    const { notesStore, book } = this.props

    notesStore.saveNotes(book.asin, mobiledoc)
  }

  props: {
    connectDropTarget: () => void,
    isOver: boolean,
    canDrop: boolean,
    book: Book,
    notesStore: NoteStore
  }

  addHighlight(highlight) {
    imageToCardParser(this.state.editor, highlight.annotation)
  }

  didCreateEditor(editor) {
    console.log('created editor:', editor);
    this.setState({ editor })
  }

  render() {
    const { canDrop, isOver, connectDropTarget, notesStore, book } = this.props
    const isActive = canDrop && isOver

    let backgroundColor = ''


    const doc = notesStore.all[book.asin] || notesStore.initialNotes(book)

    if (isActive) {
      backgroundColor = 'bg-yellow'
    }

    return connectDropTarget(
      <div>
        <Container
          className={`absolute-fill ${backgroundColor} w-100 h-100 bg-white pa1`}
          cards={CARDS}
          didCreateEditor={(e) => this.didCreateEditor(e)}
          mobiledoc={doc}
          onChange={(mobiledoc) => this.onMobiledocChange(mobiledoc)}
        >
          <ul className="list bb b--light-gray pb2 ph4 mb4">
            <li className="dib mr3">
              <MarkupButton tag="strong" className="bn pa0 bg-inherit">
                <i className="silver fa fa-bold" aria-hidden="true"></i>
              </MarkupButton>
            </li>
            <li className="dib mr3">
              <MarkupButton tag="em" className="bn pa0 bg-inherit">
                <i className="silver fa fa-italic" aria-hidden="true"></i>
              </MarkupButton>
            </li>
            <li className="dib mr3">
              <LinkButton />
            </li>
            <li className="dib mr3">
              <SectionButton tag="h1" className="bn pa0 bg-inherit">
                <i className="silver fa fa-header" aria-hidden="true"></i>
              </SectionButton>
            </li>
            <li className="dib mr3">
              <SectionButton tag="h2" className="bn pa0 bg-inherit">
                <i className="silver fa fa-header f7" aria-hidden="true"></i>
              </SectionButton>
            </li>
            <li className="dib mr3">
              <SectionButton tag="blockquote" className="bn pa0 bg-inherit">
                <i className="silver fa fa-quote-right" aria-hidden="true"></i>
              </SectionButton>
            </li>
            <li className="dib mr3">
              <SectionButton tag="pull-quote" className="bn pa0 bg-inherit">
                Pull-quote
              </SectionButton>
            </li>
            <li className="dib mr3">
              <SectionButton tag="ul" className="bn pa0 bg-inherit">
                <i className="silver fa fa-list" aria-hidden="true"></i>
              </SectionButton>
            </li>
            <li className="dib mr3">
              <SectionButton tag="ol" className="bn pa0 bg-inherit">
                <i className="silver fa fa-o-list" aria-hidden="true"></i>
              </SectionButton>
            </li>
          </ul>
          <Editor className="ph4 outline-0" />
        </Container>
      </div>
    )
  }
}

export default DropTarget(ItemTypes.HIGHLIGHT, boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(NotesEditor)
