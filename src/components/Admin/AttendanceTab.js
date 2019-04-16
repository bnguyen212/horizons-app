import React, { Component } from 'react';
import { Segment, List, Button, Form, Icon } from 'semantic-ui-react';
import moment from 'moment';
import _ from 'underscore';

export default class AttendanceTab extends Component {
  state = {
    attendance: [],
    sortBy: 'Name',
    sortReverse: false,
    queryDate: '',
    today: moment().toISOString(true).slice(0,10),
    showDate: ''
  }

  componentDidMount = () => this.search()

  search = () => {
    let url = `/admin/cohort/${this.props.cohort}/attendance`;
    if (this.state.queryDate) url = url + `?date=${this.state.queryDate}`
    fetch(url, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ attendance: result.attendance, showDate: result.date })
      } else {
        this.setState({ attendance: [], showDate: this.state.queryDate || this.state.today})
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

  checkin = (e, studentId, name) => {
    e.stopPropagation();
    if (this.state.showDate < this.state.today) {
      if (!window.confirm(`Are you sure you want to check ${name} in for a day in the past?`)) return
    }
    if (this.state.showDate > this.state.today) {
      alert(`Cannot check ${name} in for a day in the future`)
      return
    }
    fetch('/admin/attendance/new/'+studentId, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: this.state.showDate })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.search()
      } else {
        alert(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  render() {
    let { attendance, sortBy, sortReverse, queryDate, showDate } = this.state
    if (sortBy) attendance = _.sortBy(attendance, student => {
      if (sortBy === 'Name') return student.name;
      if (sortBy === 'Status') return !!student.attendance;
    })
    if (sortReverse) attendance = attendance.reverse()
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.column2 }
                 onClick={ () => this.sort('Name') } >
              Name { sortBy === 'Name' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
             </div>
            <div style={ styles.column1 }
                 onClick={ () => this.sort('Status') } >
             Status { sortBy === 'Status' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
            </div>
            <div style={ styles.attendanceActions } >Actions</div>
          </Segment>

          <Segment inverted attached={true} style={ styles.header } >
            <div style={ styles.column2Title } >{ showDate ? `Attendance on ${moment(showDate).format('dddd, MMMM Do, YYYY')}` : ''}</div>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '100%' }}>
                <Form.Field>
                  <input value={ queryDate }
                         type="date"
                         style={ styles.input }
                         onChange={ e => this.setState({ queryDate: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.attendanceActions } >
              <Button compact={true}
                      color='blue'
                      size="tiny"
                      style={ styles.button }
                      onClick={ this.search } >Search</Button>
            </div>
          </Segment>

          <List selection style={ styles.list } >
          { attendance.map((student) => {
            return <List.Item key={student._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.attendanceContainer } >
                       <div style={ styles.column2 } onClick={ () => this.props.showProfile(student._id) } >{ student.name }</div>
                       <div style={ styles.column1 } ><Icon name={ student.attendance ? "checkmark" : "x" } size="large" color={ student.attendance ? "green" : "red" }/> { student.attendance && student.attendance.checkedInBy ? `(by ${student.attendance.checkedInBy.user.username})` : null }</div>
                       <div style={ styles.attendanceActions } >
                         { this.props.cohortStatus === 'Active' && !student.attendance ? <Button compact={true}
                                                                                                 color="teal"
                                                                                                 size="tiny"
                                                                                                 style={ styles.button }
                                                                                                 onClick={ (e) => this.checkin(e, student._id, student.name) } >Check In</Button> : null }
                       </div>
                     </Segment>
                   </List.Item>
          }) }
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
    padding: 0,
  },
  header: {
    color: '#b5cc18',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%',
    minHeight: '40px',
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
  column2Title: {
    flex: 2,
    textAlign: 'left',
    color: 'white',
    fontSize: '15px'
  },
  button: {
    marginLeft: '5px'
  },
  listItem: {
    padding: 0,
    margin: 0
  },
  attendanceContainer: {
    margin: 0,
    width: '100%',
    minHeight: '40px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  attendanceActions: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  input: {
    paddingTop: 0,
    paddingBottom: 0,
    height: '20px'
  }
}