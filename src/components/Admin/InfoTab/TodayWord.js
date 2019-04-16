import React, { Component } from 'react';
import moment from 'moment';

export default class TodayWord extends Component {
  state = {
    word: null,
    error: ''
  }

  componentDidMount = () => {
    fetch('/admin/word/today', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.setState({ word: result.word })
        } else {
          this.setState({ error: result.error })
        }
      })
      .catch(err => alert(err.message))
  }

  render() {
    return (
      <div>
        {this.state.word ? <div className="word-container" >
          <h1>{moment(this.state.word.date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY')}</h1>
          <h1 className="word" >{this.state.word.word}</h1>
        </div> : <h1>{this.state.error}</h1>}
      </div>
    )
  }
}