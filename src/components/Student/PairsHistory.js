import React, { Component } from 'react';
import { Segment, Button, List } from 'semantic-ui-react';
import moment from 'moment';
import _ from 'underscore';

export default class PairsHistory extends Component {
  state = {
    pairs: []
  }

  componentDidMount = () => {
    fetch('/student/pair/history', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        console.log(result.history)
        this.setState({ pairs: result.history })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  rate = (partner, partnerName, date) => {
    const rating = window.prompt(`On ${moment(date).format('l')}, how many stars would you rate ${partnerName}?\n (1 star for "Not A Good Match", 5 stars for "Best Partner Ever")`)
    if (Number(rating) > 0 && Number(rating) < 6) {
      fetch('/student/rating/new', {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partner,
          rating: Number(rating),
          date
        })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.componentDidMount()
        } else {
          console.log(result.error)
        }
      })
      .catch(err => console.log(err.message))
    } else {
      alert('Please enter a valid rating between 1 and 5')
    }
  }

  render() {
    let { pairs } = this.state
    pairs = _.sortBy(pairs, pair => pair.date).reverse()
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.columnPairTitle }>Partner(s)</div>
            <div style={ styles.columnDateTitle } >Date</div>
          </Segment>
          <List selection style={ styles.list } >
          { pairs.length ? pairs.map((pair) => {
            return <List.Item key={pair._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.pairHistoryContainer } >
                       <div style={ styles.pair } >
                        <div style={ styles.pairNameHistory }>{ pair.students[0] ? pair.students[0].name : 'No partner assigned.' } { pair.students[0] ? pair.students[0].rated ? null : <Button style={{marginLeft: '20px'}} compact={true} size="tiny" color="grey" onClick={ () => this.rate(pair.students[0]._id, pair.students[0].name, pair.date) }>Rate</Button>  : null }</div>
                         { pair.students[0] ? pair.students[0].rated ? <div style={ styles.subtext } >You rated {pair.students[0].rated.rating} star(s)</div> : null : null }
                        </div>
                       <div style={ styles.pair } >
                         <div style={ styles.pairNameHistory }>{ pair.students[1] ? pair.students[1].name : null } { pair.students[1] ? pair.students[1].rated ? null : <Button style={{marginLeft: '20px'}} compact={true} size="tiny" color="grey" onClick={ () => this.rate(pair.students[1]._id, pair.students[1].name, pair.date) }>Rate</Button>  : null }</div>
                         { pair.students[1] ? pair.students[1].rated ? <div style={ styles.subtext } >You rated {pair.students[1].rated.rating} star(s)</div> : null : null }
                       </div>
                       <div style={ styles.pairDate } >{ moment(pair.date).format('dddd, LL') }</div>
                     </Segment>
                   </List.Item>
          }) : <h1 style={ styles.warning }>No previous pairs found</h1> }
          </List>
        </Segment>
      </div>
    )
  }
}

const styles = {
  subtext: {
    fontSize: '15px',
    color: 'grey',
    fontStyle: 'italic',
    marginTop: '5px'
  },
  container: {
    display: 'flex',
    flex: 1,
    marginTop: 0,
    flexDirection: 'column',
    padding: 0
  },
  header: {
    color: '#fbbd08',
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
  listItem: {
    padding: 0,
    margin: 0
  },
  columnDateTitle: {
    flex: 1,
    textAlign: 'left'
  },
  columnPairTitle: {
    flex: 3,
    textAlign: 'left',
  },
  pairHistoryContainer: {
    margin: 0,
    width: '100%',
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  pair: {
    flex: 1.5,
    textAlign: 'left',
  },
  pairNameHistory: {
    color: 'blue',
    fontSize: '20px',
    textAlign: 'left'
  },
  pairDate: {
    fontSize: '15px',
    textAlign: 'left',
    flex: 1
  },
  warning: {
    color: 'red',
    margin: '25px 0'
  },
}