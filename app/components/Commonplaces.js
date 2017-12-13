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
import { Commonplace } from '../stores/Commonplace'
import RootStore from '../stores/Root'

const KEYS_TO_FILTERS = ['title']

// eventually we should move this onto its own file
class CommonplaceCard extends Component {
  props: {
    commonplace: Commonplace
  }

  render() {
    const { commonplace: { description, title, createdAt, slug, id } } = this.props

    return (
      <div className="w-20-l w-third-m w-100 pa3-ns pb3 f5 v-top flex">
        <div className="bg-white flex flex-column shadow-1 w-100">
          <Link className="no-underline near-black" to={`/commonplace-books/${id}`} >
            <div className="aspect-ratio aspect-ratio--5x8 overflow-hidden">
              <div className="mt2 bg-blue tracked pv1 ph4-l ph3 w-auto dib">
                <p className="f5 white mv0"><i className="fa fa-book white" aria-hidden="true"></i></p>
              </div>
              <div className="ph4-l ph3 pv3">
                <h1 className="lh-title serif f4 ttc">{title}</h1>
                <p className="">{description}</p>
              </div>
            </div>
            <div className="pv3 ph4-l ph3 cf bt b--light-gray tr">
              <p className="f7 gray">Created <TimeAgo date={createdAt} minPeriod={60} /></p>
            </div>
          </Link>
        </div>
      </div>
    )
  }
}

@inject('rootStore')
@observer
export default class Home extends Component {
  state: {
    searchTerm: string,
    modalIsOpen: boolean,
    commonplaceName: string,
    commonplaceDescription: string
  }

  state = {
    searchTerm: '',
    modalIsOpen: false,
    commonplaceName: '',
    commonplaceDescription: ''
  }

  props: {
    rootStore: RootStore
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term })
  }

  createCommonplace(history) {
    const { rootStore } = this.props
    const { commonplaceName, commonplaceDescription } = this.state

    if (commonplaceName) {
      const { id } = rootStore.commonplaceStore.createCommonplace({
        title: commonplaceName,
        description: commonplaceDescription || ''
      })

      this.setState({ commonplaceDescription: '', commonplaceName: '', modalIsOpen: false })
      history.push(`/commonplace-books/${id}`)
    }
  }

  closeModal() {
    this.setState({ modalIsOpen: false, commonplaceName: '' })
  }

  render() {
    const { rootStore } = this.props
    const { modalIsOpen, searchTerm, commonplaceName, commonplaceDescription } = this.state
    const commonplaces = rootStore.commonplaceStore.all
    const filtered = commonplaces.filter(createFilter(searchTerm, KEYS_TO_FILTERS));

    const SaveButton = withRouter(({ history }) => (
      <button onClick={() => this.createCommonplace(history)} className="btn mh2">
        Save
      </button>
    ))

    return (
      <div className="h-100 flex flex-column ph3 bl b--near-white bg-light-gray relative">
        <header className="pv4 ph3 flex cf">
          <SearchInput className="search-input paragraph mw-100" onChange={(term) => this.searchUpdated(term)} />
          <div className="w-100 tr">
            <button className="btn" onClick={() => this.setState({ modalIsOpen: true })}>
              <i className="fa fa-plus white" aria-hidden="true" />&nbsp;New commonplace book
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
          className="fixed absolute--fill flex justify-center items-center bg-white"
        >
          <form onSubmit={(event) => event.preventDefault()} acceptCharset="utf-8">

            <h1 className="serif tc">New commonplace book</h1>

            <label className="db lh-copy f6 mb1" htmlFor="name">Name</label>
            <input className="db w-100 mb3 pa2 ba b--gray" type="text" value={commonplaceName} onChange={(event) => this.setState({ commonplaceName: event.target.value })} />
            <label className="db lh-copy f6 mb1" htmlFor="name">Description</label>
            <textarea className="db w-100 pa2 ba b--gray mb4" value={commonplaceDescription} onChange={(event) => this.setState({ commonplaceDescription: event.target.value })} />
            <div className="tc">
              <button className="btn mh2" onClick={() => this.closeModal()}>Cancel</button>
              <SaveButton />
            </div>
          </form>
        </Modal>
      </div>
    );
  }
}
