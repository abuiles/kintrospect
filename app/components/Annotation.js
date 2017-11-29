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
    isDragging: boolean,
    isHighlighted: boolean,
    asin: string,
    updateLocation: (boolean, any) => void,
    connectDragSource: () => void,
    selectAnnotation: (any) => void
  }

  render() {
    let content;
    const { annotation, asin, isHighlighted, selectAnnotation } = this.props
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
        <div className={`pa3 mb3 shadow-1 ${isHighlighted ? 'bg-blue' : 'bg-white'}`}>
          <p className="f5 mv0">
            {annotation.highlight}
          </p>
          <a href={`kindle://book?action=open&asin=${asin}&location=${location}`} className={`link underline ${isHighlighted ? 'white' : 'blue'}`} >
            Open in Kindle
          </a>
        </div>
      );
    }

    return (
      connectDragSource(
        <div style={styles} onDoubleClick={() => selectAnnotation(annotation)}>
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
