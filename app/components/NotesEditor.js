// @flow
import React from 'react';
import { Container, Editor, MarkupButton, SectionButton, LinkButton } from 'react-mobiledoc-editor';
import { observer, inject } from 'mobx-react'
import { DropTarget } from 'react-dnd';
import { Debounce } from 'react-throttle';
import { Book } from '../stores/Book';
import NoteStore from '../stores/Note';

import ItemTypes from './ItemTypes';
import HighlightCard from './HighlightCard';
import LinkCard from './LinkCard';

const CARDS = [
  HighlightCard,
  LinkCard
]

function linkToCardParser(editor) {
  const payload = { href: '' };

  editor.run((postEditor) => {
    postEditor.editor.insertCard('LinkCard', payload)
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

@inject('notesStore', 'analytics')
@observer
class NotesEditor extends React.Component {
  
  static defaultProps = {
    isCommonplace: false
  }

  componentWillUnmount() {
    const { notesStore } = this.props
    notesStore.setEditor(null)
  }

  onMobiledocChange(mobiledoc) {
    const { notesStore, book, analytics } = this.props

    analytics.event('Notes', 'saved', { evLabel: book.asin, clientID: analytics._machineID })
    notesStore.saveNotes(book, mobiledoc)
  }

  props: {
    connectDropTarget: () => void,
    isOver: boolean,
    canDrop: boolean,
    book: any,
    notesStore: NoteStore,
    isCommonplace: boolean
  }

  addHighlight(highlight) {
    const { notesStore, book, isCommonplace } = this.props
    notesStore.addAnnotation(highlight.annotation, isCommonplace)
    if (isCommonplace) {
      // book is a Commonplace object
      book.addUsedBook(highlight.annotation.book)
    }
  }

  addLink() {
    linkToCardParser(this.state.editor)
  }

  downloadNotes() {
    const { analytics, notesStore, book } = this.props
    notesStore.download(book)
    analytics.event('Notes', 'downloaded', { evLabel: book.asin, clientID: analytics._machineID })
  }

  didCreateEditor(editor) {
    console.log('created editor:', editor);
    const { notesStore } = this.props
    notesStore.setEditor(editor)
  }

  render() {
    const { canDrop, isOver, connectDropTarget, notesStore, book } = this.props
    const isActive = canDrop && isOver

    const doc = notesStore.findNotes(book)

    let backgroundColor = ''

    if (isActive) {
      backgroundColor = 'bg-yellow'
    }

    return connectDropTarget(
      <div className="h-100 pa3">
        <Debounce time="500" handler="onChange">
          <Container
            className="flex flex-column w-100 h-100 bg-white pa2"
            spellcheck
            cards={CARDS}
            didCreateEditor={(e) => this.didCreateEditor(e)}
            mobiledoc={doc}
            onChange={(mobiledoc) => this.onMobiledocChange(mobiledoc)}
          >

            <div className="bb b--light-gray pv2 ph4 flex items-center justify-between cf w-100">
              <ul className="pa0 mv0 cf lh-solid" style={{ marginRight: 'auto' }}>
                <li className="dib mr4">
                  <MarkupButton tag="strong" className="bn pa0 bg-inherit lh-solid">
                    <i className="silver fa fa-bold" aria-hidden="true" />
                  </MarkupButton>
                </li>
                <li className="dib mr4">
                  <MarkupButton tag="em" className="bn pa0 bg-inherit lh-solid">
                    <i className="silver fa fa-italic" aria-hidden="true" />
                  </MarkupButton>
                </li>
                <li className="dib mr4">
                  <button
                    className="bn pa0 bg-inherit lh-solid"
                    onClick={() => this.addLink()}
                  >
                    <i className="silver fa fa-link" aria-hidden="true" />

                  </button>
                </li>
                <li className="dib mr4">
                  <SectionButton tag="h1" className="bn pa0 bg-inherit lh-solid">
                    <i className="silver fa fa-header" aria-hidden="true" />
                  </SectionButton>
                </li>
                <li className="dib mr4">
                  <SectionButton tag="h2" className="bn pa0 bg-inherit lh-solid">
                    <i className="silver fa fa-header f7" aria-hidden="true" />
                  </SectionButton>
                </li>
                <li className="dib mr4">
                  <SectionButton tag="blockquote" className="bn pa0 bg-inherit lh-solid">
                    <i className="silver fa fa-quote-right" aria-hidden="true" />
                  </SectionButton>
                </li>
                <li className="dib mr4">
                  <SectionButton tag="ul" className="bn pa0 bg-inherit lh-solid">
                    <i className="silver fa fa-list" aria-hidden="true" />
                  </SectionButton>
                </li>
                <li className="dib mr4">
                  <SectionButton tag="ol" className="bn pa0 bg-inherit lh-solid">
                    <i className="silver fa fa-o-list" aria-hidden="true" />
                  </SectionButton>
                </li>
              </ul>
              <div>
                <button className="btn f6 mr3" onClick={() => this.downloadNotes()}>
                  Export Notes
                </button>
              </div>
            </div>

            <div className="h-100 overflow-y-auto">
              <Editor className="pa4 outline-0 h-100 notes-editor" />
            </div>
          </Container>
        </Debounce>
      </div>
    )
  }
}

export default DropTarget(ItemTypes.HIGHLIGHT, boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(NotesEditor)
