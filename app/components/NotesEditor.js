import React from 'react';
import { Container, Editor } from 'react-mobiledoc-editor';
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';

import ItemTypes from './ItemTypes';

const boxTarget = {
  drop() {
    return { name: 'NotesEditor' }
  }
}

class NotesEditor extends React.Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired
  }

  render() {
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    let backgroundColor = 'bg-red'

    if (isActive) {
      backgroundColor = 'bg-yellow'
    }

    return connectDropTarget(
      <div>
        <Container className={`absolute-fill ${backgroundColor} w-100 h-100`}>
          <Editor />
        </Container>
      </div>
    )
  }
}

export default DropTarget(ItemTypes.HIGHLIGHT, boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(NotesEditor)
