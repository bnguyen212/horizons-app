import React, { Component } from 'react';
import { Segment, Form, Modal } from 'semantic-ui-react';
import moment from 'moment';

export default class StudentPairs extends Component {
  state = {
    pairs: [],
    queryPartner: '',
    queryFrom: '',
    queryTo: ''
  }

  componentDidMount = () => {
    fetch('/admin/pair/'+this.props.id, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ pairs: result.pairs })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  showRating = (rater, rating) => {
    if (rating === 1) {
      return <span style={{fontSize: '10px', color: 'red'}}>{`${ rater.split(' ')[0]} rated 1 star`}</span>
    } else if (rating === 2) {
      return <span style={{fontSize: '10px', color: 'red'}}>{`${ rater.split(' ')[0]} rated 2 stars`}</span>
    } else if (rating === 3) {
      return <span style={{fontSize: '10px'}}>{`${ rater.split(' ')[0]} rated 3 stars`}</span>
    } else if (rating === 4 || rating === 5) {
      return <span style={{fontSize: '10px', color: 'green'}}>{`${ rater.split(' ')[0]} rated ${rating} stars`}</span>
    } else {
      return <span style={{fontSize: '10px', fontStyle: 'italic'}}>{`No rating from ${ rater.split(' ')[0]} yet`}</span>
    }
  }

  render() {
    let { pairs, queryPartner, queryFrom, queryTo } = this.state
    if (queryPartner) {
      pairs = pairs.filter(pair => {
        const index = pair.students.findIndex(student => student.name.toLowerCase().includes(queryPartner.toLowerCase()))
        return index !== -1
      })
    }
    if (queryFrom) {
      pairs = pairs.filter(pair => pair.date >= queryFrom)
    }
    if (queryTo) {
      pairs = pairs.filter(pair => pair.date <=queryTo)
    }
    return (
      <Modal.Content style={{padding: 0, border: 0}}>
        <Segment inverted attached={true} style={ styles.header2 } >
          <div style={ styles.column } >
            Partner: <Form size="small" style={{ margin: '0 30px' }}>
              <Form.Field>
                <input placeholder="Filter by partner name..."
                       style={styles.input}
                       value={ queryPartner }
                       onChange={ e => this.setState({ queryPartner: e.target.value }) } />
              </Form.Field>
            </Form>
          </div>
          <div style={ styles.column } >
            From: <Form size="small" style={{ margin: '0 30px' }}>
              <Form.Field>
                <input type="date"
                       style={styles.input}
                       value={ queryFrom }
                       onChange={ e => this.setState({ queryFrom: e.target.value }) } />
              </Form.Field>
            </Form>
          </div>
          <div style={ styles.column } >
            To: <Form size="small" style={{ margin: '0 30px' }}>
              <Form.Field>
                <input type="date"
                       value={ queryTo }
                       style={styles.input}
                       onChange={ e => this.setState({ queryTo: e.target.value }) } />
              </Form.Field>
            </Form>
          </div>
        </Segment>

        <Modal.Content scrolling={true} style={ styles.pairsContainer } >
        { pairs.length ? pairs.map(pair => {
          return <Segment key={pair._id} attached={false} style={ styles.pair } >
                   <div style={ styles.pairDate } >{ moment(pair.date).format('dddd, l') }</div>
                   <div style={ styles.partnerColumn } >
                   { pair.students.map(student => {
                      return <div key={student._id} style={{ marginTop: '5px' }}>
                               <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{ student.name }</div>
                                 <ul>
                                   <li>{ student.rated ? this.showRating(student.name, student.rated.rating) : this.showRating(student.name, null) }</li>
                                   <li>{ student.rating ? this.showRating(this.props.name, student.rating.rating) : this.showRating(this.props.name, null) }</li>
                                 </ul>
                             </div>
                   }) } </div>
                   { pair.students.length === 0 ? <div style={ styles.pairSub }>No partner assigned</div> : null}
                 </Segment>
        }) : <h1 style={{color: 'red', textAlign: 'center', padding: '10% 0'}}>No pairing history found</h1>}
        </Modal.Content>
      </Modal.Content>
    )
  }
}

const styles = {
  header2: {
    color: '#2185d0',
    fontSize: '15px',
    fontWeight: 'bold',
    width: '100%',
    minHeight: '40px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 5%',
    border: 0
  },
  pair: {
    width: '23%',
    padding: '10px 20px',
    margin: '10px 1% 10px 1%'
  },
  pairDate: {
    color: 'blue',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  pairSub: {
    textAlign: 'left',
    paddingTop: '10px',
    fontSize: '10px',
    fontStyle: 'italic'
  },
  column: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  pairsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: '1.5em'
  },
  partnerColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    paddingTop: 0,
    paddingBottom: 0,
    height: '20px'
  }
}