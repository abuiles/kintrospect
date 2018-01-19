// @flow
import React, { Component } from 'react'
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor'
import createInlineToolbarPlugin, { Separator } from 'draft-js-inline-toolbar-plugin'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
// import createLinkPlugin from 'draft-js-anchor-plugin';
import createToolbarPlugin from 'draft-js-static-toolbar-plugin';
import createToolbarLinkPlugin from 'draft-js-toolbar-link-plugin'

import {
  convertFromRaw,
  convertToRaw,
  CompositeDecorator,
  ContentState,
  Modifier,
  EditorState,
  RichUtils
} from 'draft-js'

import { OrderedSet } from 'immutable'

import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton
} from 'draft-js-buttons'


import { observer, inject } from 'mobx-react'
import { DropTarget } from 'react-dnd'
import { Book } from '../stores/Book'
import NoteStore from '../stores/Note'

import ItemTypes from './ItemTypes'

const boxTarget = {
  drop(props, monitor, component) {
    return {
      name: 'Editor',
      component
    }
  }
}

import editorStyles from './Editor.css'

// const linkPlugin = createLinkPlugin()

const linkifyPlugin = createLinkifyPlugin()

const toolbarLinkPlugin = createToolbarLinkPlugin()
const { LinkButton } = toolbarLinkPlugin

@inject('notesStore', 'analytics')
class ExportButton extends React.Component {
  downloadNotes() {}
  render() {
    return  (
      <button className="" onClick={() => this.downloadNotes()}>
        Export Notes
      </button>
    )
  }
}


const staticToolbarPlugin = createToolbarPlugin({
  structure: [
    BoldButton,
    ItalicButton,
    Separator,
    HeadlineOneButton,
    HeadlineTwoButton,
    HeadlineThreeButton,
    UnorderedListButton,
    OrderedListButton,
    LinkButton,
    BlockquoteButton,
    ExportButton
  ]
});
const { Toolbar } = staticToolbarPlugin;

const plugins = [staticToolbarPlugin, linkifyPlugin, toolbarLinkPlugin]

@inject('notesStore', 'analytics')
@observer
class NotesEditor extends React.Component {
  state: {
    editorState: any
  }

  state = {
    editorState: createEditorStateWithText('hola mundo')
  }

  props: {
    connectDropTarget: () => void,
    isOver: boolean,
    canDrop: boolean,
    book: Book,
    notesStore: NoteStore,

  }

  addHighlight(highlight) {

  }

  onEditorStateChange(editorState) {
    this.setState({
      editorState
    })
  }

  downloadNotes() {}

  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  setEditor(editor) {
    this.editor = editor
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
        <div className="flex flex-column w-100 h-100 bg-white">
          <div className={`h-100 overflow-y-auto ${editorStyles.editor}`} onClick={() => this.focus()}>
            <Toolbar className="mb3" />
            <Editor
              className="pa4 outline-0 h-100"
              editorState={this.state.editorState}
              onChange={(editorState) => this.onEditorStateChange(editorState)}
              onDrop={() => {  }}
              plugins={plugins}
              ref={(element) => { this.setEditor(element) }}
              />
          </div>
        </div>
      </div>
    )
  }
}

export default DropTarget(ItemTypes.HIGHLIGHT, boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(NotesEditor)
