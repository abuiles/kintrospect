// @flow
import React from 'react';
import { Container, Editor, Toolbar } from 'react-mobiledoc-editor';
import { DropTarget } from 'react-dnd';
import { AnnotationObject } from './Annotation';
import { BookObject } from './Book';

import ItemTypes from './ItemTypes';
import HighlightCard from './HighlightCard';

const CARDS = [
  HighlightCard
]

function imageToCardParser(editor, annotation) {
  const payload = { annotation };

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

class NotesEditor extends React.Component {
  constructor(props) {
    super(props);
    const { book } = props;

    this.state = {
      doc: {
        version: '0.3.0',
        markups: [],
        atoms: [],
        cards: [],
        sections: [
          [1, 'h1', [[0, [], 0, book.title]]], [1, 'h1', []]]
      }
    }
  }

  state: {
    doc?: void,
    editor?: void
  }

  onMobiledocChange(mobiledoc) {
    console.log('doc changed', mobiledoc)
    this.setState({
      doc: mobiledoc
    })
  }

  addHighlight(highlight) {
    imageToCardParser(this.state.editor, highlight.annotation)
  }

  props: {
    connectDropTarget: () => void,
    isOver: boolean,
    canDrop: boolean,
    book: BookObject
  }

  didCreateEditor(editor) {
    console.log('created editor:', editor);
    this.setState({ editor })
  }

  render() {
    const { canDrop, isOver, connectDropTarget } = this.props
    const isActive = canDrop && isOver

    let backgroundColor = ''

    const { doc } = this.state

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
          <Toolbar />
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
