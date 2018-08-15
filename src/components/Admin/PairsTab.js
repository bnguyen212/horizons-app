import React, { Component } from 'react';
import { Segment, List, Button, Form, Modal, Header } from 'semantic-ui-react';
import moment from 'moment';
import _ from 'underscore';

export default class PairsTab extends Component {
  state = {
    pairs: [],
    tables: [],
    students: [],
    sortBy: 'Table',
    sortReverse: false,
    newStudent1Input: '',
    newStudent2Input: '',
    newStudent3Input: '',
    newPairTable: '',
    queryDate: '',
    today: moment().toISOString(true).slice(0,10),
    showDate: '',
    modalOpen: false,
    modalPair: '',
    modalRatings: [],
    modalCheckOpen: false,
    modalCheckPairs: [],
    modalCheckRatings: [],
    modalCheckStudents: []
  }

  componentDidMount = () => {
    fetch('/admin/table/', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ tables: result.tables })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))

    fetch('/admin/cohort/'+this.props.cohort, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ students: result.students }, this.search)
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  search = () => {
    let url = `/admin/cohort/${this.props.cohort}/pairs`;
    if (this.state.queryDate) url = url + `?date=${this.state.queryDate}`
    fetch(url, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ pairs: result.pairs, showDate: result.date })
      } else {
        this.setState({ pairs: [], showDate: this.state.queryDate || this.state.today })
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

  addPair = () => {
    const students = [];
    if (this.state.newStudent1Input) students.push(this.state.newStudent1Input);
    if (this.state.newStudent2Input) students.push(this.state.newStudent2Input);
    if (this.state.newStudent3Input) students.push(this.state.newStudent3Input);
    if (students.length < 1) {
      return alert("Please provide at least one student name to make pair");
    }
    fetch('/admin/pair/new/'+this.props.cohort, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        students,
        date: this.state.showDate,
        table: this.state.newPairTable
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ newStudent1Input: '', newStudent2Input: '', newStudent3Input: '', newPairTable: '' }, this.search)
      } else {
        alert(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  deletePair = (e, pairId, date) => {
    e.stopPropagation();
    if (date < this.state.today) return alert('Cannot delete a pair in the past')
    if (!window.confirm(`Are you sure you want to delete this pair?`)) return
    fetch('/admin/pair/'+pairId, {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.search();
      } else {
        alert(result.error)
      }
    })
    .catch(err => alert(err.message))
  }

  changeTable = (e, pairId) => {
    e.stopPropagation();
    const newTable = window.prompt(`Which table should this pair be reassigned to?`)
    if (newTable || newTable === '') {
      fetch('/admin/pair/move/'+pairId, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ table: newTable })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert(newTable ? `Successfully moved this pair to ${newTable}` : 'Successfully removed table assignment')
          this.search()
        } else {
          alert(result.error)
        }
      })
      .catch(err => console.log(err.message))
    }
  }

  checkCompatibility = () => {
    let url = `/admin/pair/check/${this.props.cohort}?`;
    const students = [];
    if (this.state.newStudent1Input) {
      url += `s1=${this.state.newStudent1Input}&`;
      students.push(this.state.newStudent1Input)
    }
    if (this.state.newStudent2Input) {
      url += `s2=${this.state.newStudent2Input}&`;
      students.push(this.state.newStudent2Input);
    }
    if (this.state.newStudent3Input) {
      url += `s3=${this.state.newStudent3Input}`;
      students.push(this.state.newStudent3Input);
    }
    if (students.length < 2) {
      return alert('Please enter at least two names to check compatibility')
    }
    fetch(url, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        console.log(result)
        this.setState({
          modalCheckOpen: true,
          modalCheckPairs: result.pairs,
          modalCheckRatings: result.ratings,
          modalCheckStudents: result.students
       })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  showPairInfo = (pairId) => {
    fetch('/admin/pair/info/'+pairId, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ modalRatings: result.ratings, modalPair: result.pair, modalOpen: true })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  handleClose = () => this.setState({ modalOpen: false })

  handleClose2 = () => this.setState({ modalCheckOpen: false })

  render() {
    let { pairs, tables, students, sortBy, sortReverse, queryDate, today, showDate,
          modalOpen, modalPair, modalRatings, modalCheckOpen, modalCheckPairs, modalCheckRatings, modalCheckStudents,
          newStudent1Input, newStudent2Input, newStudent3Input, newPairTable } = this.state
    if (sortBy) pairs = _.sortBy(pairs, pair => pair.table)
    if (sortReverse) pairs = pairs.reverse()
    let assigned = []
    const usedTables = []
    pairs.forEach(pair => {
      if (pair.table) usedTables.push(pair.table);
      assigned = assigned.concat(pair.students);
    })
    const unassigned = students.filter(student => {
      if (showDate >= today && this.props.cohortStatus === 'Active') {
        return assigned.findIndex(stud => stud._id === student._id) === -1 && student.status !== 'Inactive';
      }
      return assigned.findIndex(stud => stud._id === student._id) === -1;
    })
    const unusedTables = tables.filter(table => !usedTables.includes(table.table))
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.column3Title }>Pair</div>
            <div style={ styles.column1 }
                 onClick={ () => this.sort('Table') } >
              Table { sortBy === 'Table' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
             </div>
            <div style={ styles.column1 } >Date</div>
            <div style={ styles.pairActions } >Actions</div>
          </Segment>

          <Segment inverted attached={true} style={ styles.header } >
            <div style={ styles.column3 } >{ showDate ? pairs.length !== 0 ? `Currently viewing pairs for ${moment(showDate).format('dddd, MMMM Do, YYYY')} ` : `Pairs are not (yet) made for ${moment(showDate).format('dddd, MMMM Do, YYYY')}` : ''}</div>
            <div style={ styles.column1 } ></div>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '100%' }}>
                <Form.Field>
                  <input value={ queryDate }
                         type="date"
                         onChange={ e => this.setState({ queryDate: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.pairActions } >
              <Button compact={true}
                      color='blue'
                      size="tiny"
                      style={ styles.button }
                      onClick={ this.search } >Search</Button>
            </div>
          </Segment>

          <List selection style={ styles.list } >
          { pairs.map((pair) => {
            return <List.Item key={pair._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.pairContainer } onClick={ pair.students.length > 1 ? () => this.showPairInfo(pair._id) : null } >
                       <div style={ styles.pairName } >{ pair.students[0].name }</div>
                       { pair.students[1] ? <div style={ styles.pairName } >{ pair.students[1].name }</div> : <div style={ styles.pairName } /> }
                       { pair.students[2] ? <div style={ styles.pairName } >{ pair.students[2].name }</div> : <div style={ styles.pairName } /> }
                       <div style={ styles.column1 } >{ pair.table ? pair.table : '-None-' }</div>
                       <div style={ styles.column1 } >{ `Created by ${pair.createdBy.username}` }</div>
                       <div style={ styles.pairActions } >
                         { pair.date < today  ? null : <Button compact={true}
                                                                          color="purple"
                                                                          size="tiny"
                                                                          style={ styles.button }
                                                                          onClick={ (e) => this.changeTable(e, pair._id) } >Move</Button> }
                         { pair.date < today  ? null : <Button compact={true}
                                                                          color='red'
                                                                          size="tiny"
                                                                          style={ styles.button }
                                                                          onClick={ (e) => this.deletePair(e, pair._id, pair.date) } >Delete</Button> }
                       </div>
                     </Segment>
                   </List.Item>
          }) }
          { this.props.cohortStatus === 'Inactive' && pairs.length === 0 ? null : unassigned.map((student) => {
            return <List.Item key={student._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.pairContainer } >
                       <div style={ styles.pairName } ></div>
                       <div style={ styles.pairNameUnassigned } onClick={ () => this.props.showProfile(student._id) } >{ student.name }</div>
                       <div style={ styles.pairName } ></div>
                       <div style={ styles.column1 } >Unassigned</div>
                       <div style={ styles.column1 } ></div>
                       <div style={ styles.pairActions } ></div>
                     </Segment>
                   </List.Item>
          }) }
          </List>
          { this.props.cohortStatus === 'Active' && showDate >= today ? <Segment inverted attached="bottom" style={ styles.bottom }>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '150px' }}>
                <Form.Field control="select"
                            onChange={ e => this.setState({ newStudent1Input: e.target.value })}
                            value={ newStudent1Input } >
                  <option value="" >Student 1</option>
                  { unassigned.filter(student => student._id !== newStudent2Input && student._id !== newStudent3Input).map(student => <option key={student._id} value={student._id} >{student.name}</option>) }
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '150px' }}>
                <Form.Field control="select"
                            onChange={ e => this.setState({ newStudent2Input: e.target.value })}
                            value={ newStudent2Input } >
                  <option value="" >Student 2</option>
                  { unassigned.filter(student => student._id !== newStudent1Input && student._id !== newStudent3Input).map(student => <option key={student._id} value={student._id} >{student.name}</option>) }
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '150px' }}>
                <Form.Field control="select"
                            onChange={ e => this.setState({ newStudent3Input: e.target.value })}
                            value={ newStudent3Input } >
                  <option value="" >Student 3</option>
                  { unassigned.filter(student => student._id !== newStudent1Input && student._id !== newStudent2Input).map(student => <option key={student._id} value={student._id} >{student.name}</option>) }
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '150px' }}>
                <Form.Field control="select"
                            onChange={ e => this.setState({ newPairTable: e.target.value })}
                            value={ newPairTable } >
                  <option value="" >No table assignment</option>
                  { unusedTables.map(table => <option key={table._id} value={table.table} >{table.table}</option>) }
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '100%' }}>
                <Form.Field>
                  <input value={ showDate }
                         type="date"
                         disabled={true} />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.pairActions } >
              <Button compact={true}
                      color='red'
                      size="tiny"
                      style={ styles.button }
                      onClick={ this.checkCompatibility }  >Check Compatibility</Button>
              <Button compact={true}
                      color='blue'
                      size="tiny"
                      style={ styles.button }
                      onClick={ this.addPair } >Add</Button>
            </div>
          </Segment> : null }
        </Segment>
        { modalOpen ? <PairModal handleClose={ this.handleClose } modalPair={ modalPair } ratings={ modalRatings } /> : null }
        { modalCheckOpen ? <CheckModal handleClose={ this.handleClose2 } pairs={ modalCheckPairs } ratings={ modalCheckRatings } students={ modalCheckStudents } /> : null }
      </div>
    )
  }
}

const CheckModal = ({ ratings, pairs, handleClose, students }) => {
  return (
    <Modal onClose={ handleClose }
           dimmer='blurring'
           closeIcon
           defaultOpen={true}
           size='small'>
      <Header size="large"
              icon='users'
              attached="top"
              content={ `${ students[0] } - ${ students[1] }${ students[2] ? ` - ${students[2]}` : '' }` } />
      <Modal.Content style={{display: 'flex', flexDirection: 'row' }}>
        <Modal.Content scrolling={true} style={{ flex: 1, margin: '0 5% 0 0' }} >
        { pairs.length ? pairs.map(pair => {
          return <Segment key={pair._id} attached={false} style={ styles.rating } >
                   <div style={ styles.pairDate } >Partners on: <u>{ moment(pair.date).format(' l') }</u></div>
                   <ul>
                   { pair.students.map(student => {
                      return <li key={student._id} style={{ marginTop: '10px', fontWeight: students.includes(student.name) ? 'bold' : 'normal' }} >{ student.name }</li>
                   }) } </ul>
                 </Segment>
        }) : <h1 style={{color: 'red', textAlign: 'center', padding: '10% 0', fontSize: '15px'}}>No pairing history found</h1>}
        </Modal.Content>

        <Modal.Content scrolling={true} style={{ flex: 1, margin: '0 0 0 5%'  }} >
          { ratings.length ? ratings.map(rate => {
            return <Segment key={rate._id} attached={false} style={ styles.rating } >
                     <div style={ styles.pairDate } >{ moment(rate.date).format('dddd, l') }</div>
                     <div style={{fontSize: '15px'}} >{ showRating(rate.student.name, rate.partner.name, rate.rating) }</div>
                   </Segment>
          }) : <h3 style={{color: 'red', textAlign: 'center', padding: '10% 0', fontSize: '15px'}}>No ratings found</h3>}
          </Modal.Content>
      </Modal.Content>
    </Modal>
  )
}

const PairModal = ({ ratings, modalPair, handleClose }) => {
  return (
    <Modal onClose={ handleClose }
           dimmer='blurring'
           closeIcon
           defaultOpen={true}
           size='small'>
      <Header size="large"
              icon='users'
              attached="top"
              content={ `${ modalPair.students[0].name } - ${ modalPair.students[1].name }${ modalPair.students[2] ? ` - ${modalPair.students[2].name}` : '' }` }
              subheader={ moment(modalPair.date).format('dddd, LL') } />
      <Modal.Content style={{padding: 0, border: 0}} >
      { ratings.length ? ratings.map(rating => {
        return <Segment key={rating._id} attached={false} style={ styles.pair } >
                 <div style={{fontSize: '20px'}} >{ showRating(rating.student.name, rating.partner.name, rating.rating) }</div>
               </Segment>
      }) : <h1 style={{color: 'red', textAlign: 'center', padding: '10% 0'}}>No ratings found for this pair</h1>}
    </Modal.Content>
    </Modal>
  )
}

const showRating = (rater, rated, rating, date) => {
  if (rating === 1) {
    return <span style={{color: 'red'}}><b>{ rater }</b> rated <b>{ rated }</b> 1 star</span>
  } else if (rating === 2) {
    return <span style={{color: 'red'}}><b>{ rater }</b> rated <b>{ rated }</b> 2 stars</span>
  } else if (rating === 3) {
    return <span><b>{ rater }</b> rated <b>{ rated }</b> 3 stars</span>
  } else if (rating === 4 || rating === 5) {
    return <span style={{color: 'green'}}><b>{ rater }</b> rated <b>{ rated }</b> {rating} stars</span>
  } else {
    return <span>{`No rating from ${ rater } yet`}</span>
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
    color: '#fbbd08',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%',
    minHeight: '50px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0
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
  column3: {
    flex: 3,
    textAlign: 'left',
    color: 'white',
    fontSize: '15px'
  },
  column3Title: {
    flex: 3,
    textAlign: 'left',
  },
  bottom: {
    width: '100%',
    minHeight: '50px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0
  },
  button: {
    marginLeft: '5px'
  },
  listItem: {
    padding: 0,
    margin: 0
  },
  pairContainer: {
    margin: 0,
    width: '100%',
    minHeight: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0
  },
  pairActions: {
    flex: 1.5,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  pairName: {
    flex: 1,
    textAlign: 'left',
    color: 'blue'
  },
  pairNameUnassigned: {
    flex: 1,
    textAlign: 'left',
    color: 'red'
  },
  pair: {
    padding: "20px 10%",
    margin: 0
  },
  pairDate: {
    color: 'blue',
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
}