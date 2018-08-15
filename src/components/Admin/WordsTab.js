import React, { Component } from 'react';
import { Segment, List, Button, Form } from 'semantic-ui-react';
import moment from 'moment';
import _ from 'underscore';

export default class WordsTab extends Component {
  state = {
    words: [],
    sortBy: 'Date',
    sortReverse: true,
    newWordInput: '',
    newWordDate: moment().toISOString(true).slice(0, 10),
  }

  componentDidMount = () => {
    fetch('/admin/word/', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ words: result.words })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  sort = (type) => {
    if (this.state.sortBy === type) {
      this.setState({ sortReverse: !this.state.sortReverse })
    } else {
      this.setState({ sortBy: type, sortReverse: false })
    }
  }

  deleteWord = (wordId, date) => {
    if (!window.confirm(`Are you sure you want to delete the WOTD for ${moment(date).format('MMM Do, YYYY')}?`)) return
    fetch('/admin/word/'+wordId, {
      credentials: 'same-origin',
      method: 'DELETE',
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.componentDidMount();
      } else {
        alert(result.error)
      }
    })
    .catch(err => alert(err.message))
  }

  editWord = (wordId, date) => {
    const newWord = window.prompt(`What is the new WOTD for ${moment(date).format('MMM Do, YYYY')}?`)
    if (newWord) {
      if (newWord.length < 4) {
       return alert('Word of the day must be at least 4 characters long')
      }
      fetch('/admin/word/'+wordId, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          word: newWord
        })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.componentDidMount();
        } else {
          alert(result.error)
        }
      })
      .catch(err => alert(err.message))
    }
  }

  addWord = () => {
    if (this.state.newWordInput.length < 4) {
      return alert('Word of the day must be at least 4 characters long')
    }
    if (this.state.newWordDate < moment().toISOString(true).slice(0, 10)) {
      return alert('You can only add word of the day for current and future dates')
    }
    fetch('/admin/word/new', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word: this.state.newWordInput,
        date: this.state.newWordDate,
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({newWordDate: '', newWordInput: ''}, this.componentDidMount)
      } else {
        alert(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  render() {
    let { words, sortBy, sortReverse } = this.state
    if (sortBy) {
      words = _.sortBy(words, word => {
        if (sortBy === 'Word') {
          return word.word
        } else if (sortBy === 'Date') {
          return word.date
        }
      })
    }
    if (sortReverse) {
      words = words.reverse()
    }
    return (
      <div className="tab" >
        <Segment style={ styles.container } >

          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.column2 }
                 onClick={ () => this.sort('Date') } >
              Date { sortBy === 'Date' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
            </div>
            <div style={ styles.column2 }
                 onClick={ () => this.sort('Word') } >
              Word { sortBy === 'Word' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
             </div>
            <div style={ styles.column2 } >Created By</div>
            <div style={ styles.column1 } >Actions</div>
          </Segment>

          <List selection style={ styles.list } >
          { words.map(word => {
            return <List.Item key={word._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.wordContainer } >
                       <div style={ styles.column2 } >{ moment(word.date).format('dddd, L') }</div>
                       <div style={ styles.word } >{ word.word }</div>
                       <div style={ styles.column2 } >{ word.createdBy.username}</div>
                       <div style={ styles.actions } >
                         { word.date > moment().toISOString(true).slice(0,10) ? <Button color='blue'
                                                                                        size="tiny"
                                                                                        compact={true}
                                                                                        onClick={ () => this.editWord(word._id, word.date) } >Edit</Button> : null }
                         { word.date > moment().toISOString(true).slice(0,10) ? <Button color='red'
                                                                                        size="tiny"
                                                                                        compact={true}
                                                                                        onClick={ () => this.deleteWord(word._id, word.date) } >Delete</Button> : null }
                       </div>
                     </Segment>
                   </List.Item>
          }) }
          </List>
          <Segment inverted attached="bottom" style={ styles.bottom }>
            <div style={ styles.column2 } >
              <Form size="small" style={{ width: '175px' }}>
                <Form.Field>
                  <input placeholder="Enter new employee..."
                         value={ this.state.newWordDate }
                         type="date"
                         onChange={ e => this.setState({ newWordDate: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column2 } >
              <Form size="small" style={{ width: '150px' }}>
                <Form.Field>
                  <input placeholder="Enter new word..."
                         value={ this.state.newWordInput }
                         onChange={ e => this.setState({ newWordInput: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column2 } ></div>
            <div style={ styles.column1 } >
              <Button compact={true}
                      color='blue'
                      size="tiny"
                      onClick={ this.addWord } >Add</Button>
            </div>

          </Segment>
        </Segment>
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    marginTop: 0,
    flexDirection: 'column',
    padding: 0,
  },
  header: {
    color: '#f2711c',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%',
    minHeight: '50px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  list: {
    margin: 0,
    overflow: 'scroll',
    height: '100%'
  },
  column1: {
    flex: 1,
    textAlign: 'left'
  },
  column2: {
    flex: 2,
    textAlign: 'left'
  },
  bottom: {
    width: '100%',
    minHeight: '50px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  listItem: {
    padding: 0,
    margin: 0
  },
  wordContainer: {
    margin: 0,
    width: '100%',
    minHeight: '40px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  actions: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start'
  },
  word: {
    flex: 2,
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: 'bold',
    color: 'green' }
}