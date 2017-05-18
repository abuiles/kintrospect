import React from 'react';
import ReactDom from 'react-dom';
import { classToDOMCard } from 'react-mobiledoc-editor';

class HighlightCard extends React.Component {
  componentDidMount() {
    // const parent = ReactDom.findDOMNode(this).parentNode
    // parent.parentElement.parentElement.contentEditable = 'false'
  }

  render() {
    const { isChapter, location, asin, highlight } = this.props.payload.annotation

    if (isChapter) {
      return (
        <h2>
          {this.props.payload.annotation.name}
        </h2>
      )
    } else {
      return (
        <blockquote className="serif pl4 bl bw2 b--blue ma0">
          <p className="f4 lh-copy measure mb3">
            {highlight}
          </p>
          <cite>
            <a className="f5" href={`kindle://book?action=open&asin=${asin}&location=${location}`}>
              Read more at location {location}...
            </a>
          </cite>
        </blockquote>
      )
    }
  }
}

export default classToDOMCard(HighlightCard, 'HighlightCard');
