// @flow
import React from 'react';
import { Container, Editor, MarkupButton, SectionButton, LinkButton } from 'react-mobiledoc-editor';
import { UI } from 'mobiledoc-kit';
import { observer, inject } from 'mobx-react'
import { DropTarget } from 'react-dnd';
import { Debounce } from 'react-throttle';
import { PortalWithState } from 'react-portal';
import { Annotation } from '../stores/Book';
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
  state: {
    currentLink: string,
    linkPortalStyle: any,
    range: any
  }

  state = {
    currentLink: '',
    linkPortalStyle: null
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
    didAddHighlight: ?(Annotation) => void
  }

  addHighlight(highlight) {
    const { notesStore, didAddHighlight, book } = this.props
    notesStore.addAnnotation(highlight.annotation, book.isCommonplace)

    if (didAddHighlight) {
      didAddHighlight(highlight.annotation)
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

  openLinkPortal(e) {
    const { mobiledocEditor } = this.props.notesStore
    const editor = mobiledocEditor

    if (!editor.hasCursor()) {
      return;
    }

    if (editor.hasActiveMarkup('a')) {
      editor.toggleMarkup('a');
    } else {
      this.setLinkPortalPosition()
    }
  }

  setLinkPortalPosition(opening = true) {
    if (!opening) {
      return this.setState({
        currentLink: '',
        linkPortalStyle: null
      })
    }

    const position =  window.getSelection().getRangeAt(0).getBoundingClientRect()

    const linkStyle = {
      position: 'absolute',
      left: position.left - 10,
      top: position.bottom + 18
    };

    const { mobiledocEditor } = this.props.notesStore
    const editor = mobiledocEditor

    this.setState({
      linkPortalStyle: linkStyle,
      range: editor.range
    })
  }

  setLink() {
    const { currentLink, range } = this.state

    const { mobiledocEditor } = this.props.notesStore
    const editor = mobiledocEditor

    editor.run(function (postEditor) {
      const markup = postEditor.builder.createMarkup('a', { href: currentLink });
      postEditor.addMarkupToRange(range, markup);
    });

    this.setLinkPortalPosition(false)
  }

  didCreateEditor(editor) {
    const { notesStore } = this.props
    notesStore.setEditor(editor)
  }

  render() {
    const { canDrop, isOver, connectDropTarget, notesStore, book } = this.props
    const isActive = canDrop && isOver

    const doc = notesStore.findNotes(book)

    const { linkPortalStyle, currentLink } = this.state

    let backgroundColor = ''

    if (isActive) {
      backgroundColor = 'bg-yellow'
    }

    const LinkForm = (
      <div className="bg-white ba pa1" style={linkPortalStyle}>
        <form onSubmit={(event) => event.preventDefault()} acceptCharset="utf-8">
          <label className="lh-copy f6 mb1" htmlFor="link">Link</label>
          <input className="w-100 mb3 pa2 ba b--gray" name="link" type="text" value={currentLink} onChange={(event) => this.setState({ currentLink: event.target.value })} />
            <div className="tc">
              <button className="btn mh2" onClick={() => this.setLink()}>Apply</button>
              <button className="btn mh2" onClick={() => this.setLinkPortalPosition(false)}>Cancel</button>
            </div>
        </form>
      </div>
    )

    return connectDropTarget(
      <div className="h-100 pa3">
        {linkPortalStyle && LinkForm}
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
                    onClick={(e) => this.openLinkPortal(e)}
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
