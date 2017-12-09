// @flow
import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import SearchInput, { createFilter } from 'react-search-input'
import {
  Link
} from 'react-router-dom'
import { withRouter } from 'react-router'
import Modal from 'react-modal';
import TimeAgo from 'react-timeago'
import CommonplaceStore, { Commonplace } from '../stores/Commonplace'

const KEYS_TO_FILTERS = ['title']

// eventually we should move this onto its own file
class CommonplaceCard extends Component {
  props: {
    commonplace: Commonplace
  }

  render() {
    const { commonplace: { title, createdAt, slug, id } } = this.props

    return (
      <div className="w-20-l w-third-m w-100 pa3-ns pb3 f5 v-top flex">
        <div className="bg-white flex flex-column shadow-1 w-100">
          <Link className="no-underline" to={`/commonplace-books/${id}`} >
            <div className="aspect-ratio aspect-ratio--5x8">
              {title}
            </div>
            <div className="pa3 cf bt b--light-gray tr">
              <p>
                Created <TimeAgo date={createdAt} minPeriod={60} />
              </p>
            </div>
          </Link>
        </div>
      </div>
    )
  }
}

@inject('commonplaceStore')
@observer
export default class Home extends Component {
  state: {
    searchTerm: string,
    modalIsOpen: boolean,
    commonplaceName: string
  }

  state = {
    searchTerm: '',
    modalIsOpen: false,
    commonplaceName: ''
  }

  props: {
    commonplaceStore: CommonplaceStore
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term })
  }

  createCommonplace(history) {
    const { commonplaceStore } = this.props
    const { commonplaceName } = this.state
    const { id } = commonplaceStore.createCommonplace(commonplaceName)
    this.setState({ commonplaceName: '', modalIsOpen: false})
    history.push(`/commonplace-books/${id}`)
  }

  closeModal() {
    this.setState({ modalIsOpen: false, commonplaceName: '' })
  }

  render() {
    const { commonplaceStore } = this.props
    const { modalIsOpen, searchTerm, commonplaceName } = this.state
    const commonplaces = commonplaceStore.all
    const filtered = commonplaces.filter(createFilter(searchTerm, KEYS_TO_FILTERS));

    const SaveButton = withRouter(({ history }) => (
      <button onClick={() => this.createCommonplace(history) }>Save</button>
    ))

    return (
      <div className="h-100 flex flex-column ph3 bl b--near-white bg-light-gray relative">
        <header className="pv4 ph3 flex cf">
          <SearchInput className="search-input paragraph mw-100" onChange={(term) => this.searchUpdated(term)} />
          <div className="w-100 tr">
            <button className="btn" onClick={() => this.setState({ modalIsOpen: true })}>
              <i className="fa fa-plus white" aria-hidden="true"></i>&nbsp;New commonplace book
            </button>
          </div>
        </header>
        <div className="overflow-y-auto h-100">
          <div className="f0 flex flex-wrap">
            {filtered.map((commonplace) => (
              <CommonplaceCard commonplace={commonplace} key={commonplace.createdAt} />
            ))}
            {!filtered && <h2>Create some commonplaces first </h2>}
          </div>
        </div>
        <Modal
          isOpen={modalIsOpen}
          contentLabel="New commonplace book"
        >
          <h2>Name your commonplace</h2>
          <button onClick={() => this.closeModal() }>close</button>
          <SaveButton />
          <form>
          <input type="text" value={commonplaceName} onChange={(event) => this.setState({ commonplaceName: event.target.value })} />
          </form>
        </Modal>
      </div>
    );
  }
}
