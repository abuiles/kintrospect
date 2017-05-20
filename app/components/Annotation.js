import React from 'react';
import { Sticky } from 'react-sticky';
import { DragSource } from 'react-dnd';

import ItemTypes from './ItemTypes';

const highlightSource = {
  beginDrag(props) {
    console.log('dragging', props.annotation);
    return {
      text: props.annotation.highlight,
      annotation: props.annotation
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    console.log('dragging', props.annotation);

    if (monitor.didDrop()) {
      // do this in the notes store
      dropResult.component.wrappedInstance.addHighlight(item)
    }
  }
}

class AnnotationView extends React.Component {
  props: {
    annotation: any,
    updateLocation: (boolean, any) => void,
    connectDragSource: () => void,
    isDragging: boolean
  }

  render() {
    let content;
    const { annotation } = this.props;
    const { isDragging, connectDragSource } = this.props

    const styles = {
      opacity: isDragging ? 0.4 : 1,
      cursor: 'move'
    }

    if (annotation.isChapter) {
      content = (
        <div className="bg-washed-blue ba bw1">
          <h2>{annotation.name}</h2>
        </div>
      )
    } else {
      const location = annotation.location;

      content = (
        <div className="bg-white pa3 mb3">
          <p className="f5 mv0">
            {annotation.highlight}
          </p>
          <a className="" href={`kindle://book?action=open&asin=${annotation.asin}&location=${location}`}>
            Read more at location {location}...
          </a>
        </div>
      );
    }

    return (
      connectDragSource(
        <div style={styles}>
          {content}
        </div>
      )
    );
  }
}

export default DragSource(ItemTypes.HIGHLIGHT, highlightSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(AnnotationView)
