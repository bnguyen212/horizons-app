import React, { Component } from 'react';
import { Segment, List } from 'semantic-ui-react';
import moment from 'moment';
import _ from 'underscore';

export default class AllPairs extends Component {
  state = {
    pairs: [],
    showDate: ''
  }

  componentDidMount = () => {
    fetch('/student/pair/cohort', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ pairs: result.pairs, showDate: result.date })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  render() {
    let { pairs, showDate } = this.state
    pairs = _.sortBy(pairs, pair => pair.table)
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.columnPairTitle }>Pairs { showDate ? `for ${moment(showDate).format('dddd, LL')}` : '' }</div>
            <div style={ styles.columnTableTitle } >Table</div>
          </Segment>
          <List selection style={ styles.list } >
          { pairs.length ? pairs.map((pair) => {
            return <List.Item key={pair._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.pairContainer } >
                       <div style={ styles.pairName } >{ pair.students[0].name }</div>
                       <div style={ styles.pairName } >{ pair.students[1] ? pair.students[1].name : null }</div>
                       <div style={ styles.pairName } >{ pair.students[2] ? pair.students[2].name : null }</div>
                       <div style={ styles.table } >{ pair.table ? pair.table : '-None-' }</div>
                     </Segment>
                   </List.Item>
          }) : <h1 style={ styles.warning }>Pairs are not yet created { showDate ? `for ${moment(showDate).format('dddd, LL')}` : '' }</h1> }
          </List>
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
  columnTableTitle: {
    flex: 0.5,
    textAlign: 'left'
  },
  columnPairTitle: {
    flex: 3,
    textAlign: 'left',
  },
  pairContainer: {
    margin: 0,
    width: '100%',
    minHeight: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  pairName: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: '20px',
    flex: 1,
    textAlign: 'left'
  },
  pair: {
    flex: 1.5,
    textAlign: 'left',
  },
  table: {
    flex: 0.5,
    textAlign: 'left',
    color: 'red',
    fontSize: '20px'
  },
  warning: {
    color: 'red',
    margin: '25px 0'
  }
}