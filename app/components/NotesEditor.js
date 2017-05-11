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
          className={`absolute-fill ${backgroundColor} w-100 h-100`}
          cards={CARDS}
          didCreateEditor={(e) => this.didCreateEditor(e)}
          mobiledoc={doc}
          onChange={(mobiledoc) => this.onMobiledocChange(mobiledoc)}
        >
          <ul className="list">
            <li className="dib mr1">
              <MarkupButton tag="strong">
                Bold
              </MarkupButton>
            </li>
            <li className="dib mr1">
              <MarkupButton tag="em">
                Italic
              </MarkupButton>
            </li>
            <li className="dib mr1">
              <LinkButton />
            </li>
            <li className="dib mr1">
              <SectionButton tag="h1" >
                Headline
              </SectionButton>
            </li>
            <li className="dib mr1">
              <SectionButton tag="h2" >
                Subheadline
              </SectionButton>
            </li>
            <li className="dib mr1">
              <SectionButton tag="blockquote" >
                Blockquote
              </SectionButton>
            </li>
            <li className="dib mr1">
              <SectionButton tag="pull-quote" >
                Pull-quote
              </SectionButton>
            </li>
            <li className="dib mr1">
              <SectionButton tag="ul" >
                List
              </SectionButton>
            </li>
            <li className="dib mr1">
              <SectionButton tag="ol" >
                Numbered list
              </SectionButton>
            </li>
          </ul>
          <Editor />
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
