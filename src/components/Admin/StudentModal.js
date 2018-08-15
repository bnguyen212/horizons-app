import React, { Component } from 'react';
import { Segment, Form, Modal, Header, Icon, Menu } from 'semantic-ui-react';
import moment from 'moment';
import _ from 'underscore'

export default class StudentModal extends Component {
  state = {
    activeIndex: 0
  }

  handleItemClick = (e, { index }) => this.setState({ activeIndex: index })

  handleRender = (tab) => {
    switch (tab) {
      case 0:
        return <StudentAttendance id={ this.props.info._id } />
      case 1:
        return <StudentPairs id={ this.props.info._id } name={ this.props.info.name } />
      case 2:
        return <StudentRatings id={ this.props.info._id } />
      default:
        return null
    }
  }

  render() {
    const { activeIndex } = this.state
    return (
      <Modal onClose={this.props.handleClose}
             dimmer='blurring'
             closeIcon
             defaultOpen={true}
             centered={false}
             size='large' >
        <Header size="small"
                icon='user'
                attached="top"
                content={`${ this.props.info.name } (${ this.props.info.status } - ${ this.props.info.cohort.name })`}
                subheader={ `Created by ${ this.props.info.createdBy.username } | Last modified by ${ this.props.info.lastModifiedBy.kind === 'Student' ? this.props.info.lastModifiedBy.info.name : this.props.info.lastModifiedBy.info.username} on ${moment(this.props.info.lastModifiedBy.time).format('MMM Do, YYYY')}`} />
        <Menu inverted
              size="small"
              compact={true}
              attached={true}
              className="nav-bar"
              widths={3} >
          <Menu.Item
            index={ 0 }
            active={ activeIndex === 0 }
            color='blue'
            style={{ borderRadius: 0 }}
            onClick={ this.handleItemClick } >
            <Icon name="calendar check" size='large' /> Attendance
          </Menu.Item>
          <Menu.Item
            index={ 1 }
            active={ activeIndex === 1 }
            color='blue'
            onClick={ this.handleItemClick } >
            <Icon name="users" size='large' /> Pairs
          </Menu.Item>
          <Menu.Item
            index={ 2 }
            active={ activeIndex === 2 }
            color='blue'
            style={{ borderRadius: 0 }}
            onClick={ this.handleItemClick } >
            <Icon name="star" size='large' /> Ratings
          </Menu.Item>
        </Menu>
          { this.handleRender(activeIndex) }
      </Modal>
    )
  }
}

class StudentAttendance extends Component {
  state = {
    attendance: []
  }

  componentDidMount = () => {
    fetch('/admin/attendance/'+this.props.id, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ attendance: result.attendance })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  render() {
    const { attendance } = this.state
    return (
      <Modal.Content scrolling={true} style={ styles.pairsContainer } >
        { attendance.length ? attendance.map(day => {
          return <Segment key={day._id} attached={false} style={ styles.attendance } >
                   <div style={ styles.weekday } >{ moment(day.date).format('dddd') }</div>
                   <div style={ styles.date } >{ moment(day.date).format('LL') }</div>
                   { day.checkedInBy ? <div style={ styles.description }>Checked in by { day.checkedInBy.user.username }</div> : null}
                 </Segment>
        }) : <h1 style={{color: 'red', textAlign: 'center', padding: '10% 0'}}>No attendance record found</h1>}
      </Modal.Content>
    )
  }
}

class StudentPairs extends Component {
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
      return <span style={{fontSize: '12px', color: 'red'}}>{`${ rater.split(' ')[0]} rated 1 star`}</span>
    } else if (rating === 2) {
      return <span style={{fontSize: '12px', color: 'red'}}>{`${ rater.split(' ')[0]} rated 2 stars`}</span>
    } else if (rating === 3) {
      return <span style={{fontSize: '12px'}}>{`${ rater.split(' ')[0]} rated 3 stars`}</span>
    } else if (rating === 4 || rating === 5) {
      return <span style={{fontSize: '12px', color: 'green'}}>{`${ rater.split(' ')[0]} rated ${rating} stars`}</span>
    } else {
      return <span style={{fontSize: '12px'}}>{`No rating from ${ rater.split(' ')[0]} yet`}</span>
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
                       value={ queryPartner }
                       onChange={ e => this.setState({ queryPartner: e.target.value }) } />
              </Form.Field>
            </Form>
          </div>
          <div style={ styles.column } >
            From: <Form size="small" style={{ margin: '0 30px' }}>
              <Form.Field>
                <input type="date"
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
                      return <div key={student._id} style={{ marginTop: '10px' }}>
                               <div style={{ fontWeight: 'bold' }}>{ student.name }</div>
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

class StudentRatings extends Component {
  state = {
    rated: [],
    ratings: [],
    sortBy: 'Date',
    sortReverse: true,
  }

  componentDidMount = () => {
    fetch('/admin/rating/'+this.props.id, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ rated: result.rated, ratings: result.ratings })
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

  render() {
    let { rated, ratings, sortBy, sortReverse, queryPartner } = this.state
    if (sortBy) {
      rated = _.sortBy(rated, rate => {
        if (sortBy === 'Date') {
          return rate.date
        } else if (sortBy === 'Rating') {
          return rate.rating
        }
      })
      ratings = _.sortBy(ratings, rate => {
        if (sortBy === 'Date') {
          return rate.date
        } else if (sortBy === 'Rating') {
          return rate.rating
        }
      })
    }
    if (queryPartner) {
      rated = rated.filter(rate => rate.partner.name.toLowerCase().includes(queryPartner.toLowerCase()))
      ratings = ratings.filter(rate => rate.student.name.toLowerCase().includes(queryPartner.toLowerCase()))
    }
    if (sortReverse) {
      rated = rated.reverse();
      ratings = ratings.reverse();
    }
    return (
      <Modal.Content style={{padding: 0, display: 'flex', flexDirection: 'column'}}>
        <Segment inverted attached={true} style={ styles.header2 } >
          <div style={ styles.column } >
            Partner: <Form size="small" style={{ margin: '0 30px' }}>
              <Form.Field>
                <input placeholder="Filter by partner name..."
                       value={ queryPartner }
                       onChange={ e => this.setState({ queryPartner: e.target.value }) } />
              </Form.Field>
            </Form>
          </div>
          <div style={ styles.column } onClick={ () => this.sort('Date') } >
            Date { sortBy === 'Date' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
          </div>
          <div style={ styles.column } onClick={ () => this.sort('Rating') } >
            Rating { sortBy === 'Rating' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
          </div>
        </Segment>
        <Segment style={{padding: 0, margin: 0, border: 0, display: 'flex', flexDirection: 'row' }}>
          <Modal.Content scrolling={true} style={ styles.ratingsContainer } >
          { rated.length ? rated.map(rate => {
            return <Segment key={rate._id} attached={true} style={ styles.rating } >
                     { showRating(rate.student.name, rate.partner.name, rate.rating, rate.date) }
                   </Segment>
          }) : <h3 style={{color: 'red', textAlign: 'center', padding: '10% 0'}}>No ratings found</h3>}
          </Modal.Content>

          <Modal.Content scrolling={true} style={ styles.ratingsContainer } >
          { ratings.length ? ratings.map(rate => {
            return <Segment key={rate._id} attached={true} style={ styles.rating } >
                     { showRating(rate.student.name, rate.partner.name, rate.rating, rate.date) }
                   </Segment>
          }) : <h3 style={{color: 'red', textAlign: 'center', padding: '10% 0'}}>No ratings found</h3>}
          </Modal.Content>
        </Segment>
      </Modal.Content>
    )
  }
}

const showRating = (rater, rated, rating, date) => {
  if (rating === 1) {
    return <span style={{fontSize: '15px', color: 'red'}}><b>{ rater }</b> rated <b>{ rated }</b> 1 star on <u>{moment(date).format('LL')}</u></span>
  } else if (rating === 2) {
    return <span style={{fontSize: '15px', color: 'red'}}><b>{ rater }</b> rated <b>{ rated }</b> 2 stars on <u>{moment(date).format('LL')}</u></span>
  } else if (rating === 3) {
    return <span style={{fontSize: '15px'}}><b>{ rater }</b> rated <b>{ rated }</b> 3 star on <u>{moment(date).format('LL')}</u></span>
  } else if (rating === 4 || rating === 5) {
    return <span style={{fontSize: '15px', color: 'green'}}><b>{ rater }</b> rated <b>{ rated }</b> {rating} stars on <u>{moment(date).format('LL')}</u></span>
  } else {
    return <span style={{fontSize: '15px'}}>{`No rating from ${ rater } yet`}</span>
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
    color: '#2185d0',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%',
    minHeight: '50px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 5%'
  },
  header2: {
    color: '#2185d0',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%',
    minHeight: '50px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 5%',
    border: 0
  },
  list: {
    margin: 0,
    overflow: 'scroll',
    height: '100%'
  },
  column1: {
    flex: 5,
    textAlign: 'left'
  },
  columnMid: {
    flex: 2,
    textAlign: 'left'
  },
  column2: {
    flex: 4,
    textAlign: 'right'
  },
  bottom: {
    width: '100%',
    minHeight: '50px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 5%'
  },
  button: {
    marginLeft: '5px'
  },
  listItem: {
    padding: 0,
    margin: 0
  },
  studentContainer: {
    margin: 0,
    width: '100%',
    minHeight: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 5%'
  },
  studentInfo: {
    flex: 5,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  studentLogs: {
    fontSize: '10px',
    fontStyle: 'italic'
  },
  studentActions: {
    flex: 4,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  cohort: {
    flex: 2,
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  modal: {
    overflow: 'scroll',
    padding: 0,
    border: 0,
  },
  modalContainer: {
    height: 'stretch',
    overflow: 'scroll',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  attendance: {
    width: '23%',
    padding: '10px',
    margin: '10px 1%',
    // height: '20%'
  },
  weekday: {
    color: 'green',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  date: {
    color: 'green',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  description: {
    textAlign: 'right',
    paddingTop: '10px',
    fontSize: '10px',
    fontStyle: 'italic'
  },
  pair: {
    width: '23%',
    padding: '10px 20px',
    margin: '10px 1% 10px 1%'
  },
  rating: {
    width: '100%',
    margin: 0,
    padding: '2% 5%',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center'
  },
  pairDate: {
    color: 'blue',
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  pairSub: {
    textAlign: 'left',
    paddingTop: '20px',
    fontSize: '15px',
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
  ratingsContainer: {
    padding: 0,
    flex: 1
  },
  partnerColumn: {
    display: 'flex',
    flexDirection: 'column'
  }
}