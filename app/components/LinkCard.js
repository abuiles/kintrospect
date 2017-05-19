import React from 'react';
import { classToDOMCard } from 'react-mobiledoc-editor';

class LinkCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { href: props.payload.href };
  }

  state: {
    href: string
  }

  handleChange(event) {
    this.setState({ href: event.target.value })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.edit()
    this.props.save(this.state)
  }

  render() {
    let { payload, isInEditor, isEditing, cancel, edit } = this.props

    let editMode = (
      <div>
        <a href={payload.href} target="_blank" rel="noopener noreferrer">{payload.href}</a>
        <i className="ml1 fa fa-icon-edit" aria-hidden="true" onClick={() => edit()}/>
      </div>
    )

    if (isInEditor && (isEditing || !payload.href)) {
      editMode = (
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <input type="text" value={this.state.href} onChange={(e) => this.handleChange(e)} />
          <button type="submit">Link</button>
          <button onChange={() => cancel()}>Cancel</button>
        </form>
      )
    }

    return editMode
  }
}

export default classToDOMCard(LinkCard, 'LinkCard')
