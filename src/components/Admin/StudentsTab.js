import React, { Component } from 'react';
import { Segment, List, Button, Form } from 'semantic-ui-react';
import _ from 'underscore';

export default class StudentsTab extends Component {
  state = {
    students: [],
    sortBy: 'Name',
    sortReverse: false,
    newStudentInput: '',
    newStudentCohort: this.props.cohortName || '',
    queryName: '',
    queryCohort: '',
    queryStatus: '',
    cohorts: []
  }

  componentDidMount = () => {
    if (this.props.cohort) {
      fetch('/admin/cohort/'+this.props.cohort, { credentials: 'same-origin' })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const cohorts = Object.keys(_.groupBy(result.students, student => student.cohort.name))
          this.setState({ students: result.students, cohorts })
        } else {
          console.log(result.error)
        }
      })
      .catch(err => console.log(err.message))
    } else {
      fetch('/admin/student/', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const cohorts = Object.keys(_.groupBy(result.students, student => student.cohort.name))
          this.setState({ students: result.students, cohorts })
        } else {
          console.log(result.error)
        }
      })
      .catch(err => console.log(err.message))
    }
  }

  sort = (type) => {
    if (this.state.sortBy === type) {
      this.setState({ sortReverse: !this.state.sortReverse })
    } else {
      this.setState({ sortBy: type, sortReverse: false })
    }
  }

  modifyStatus = (e, studentId, status, name) => {
    e.stopPropagation();
    if (status === 'Inactive' && !window.confirm(`Are you sure you want to deactive ${name}'s account?`)) {
      return
    }
    if (status === 'New' && !window.confirm(`Are you sure you want to reset ${name}'s account?`)) {
      return
    }
    fetch('/admin/student/'+studentId, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
    .then(res => {
      return res.status === 200 ? res.json() : []
    })
    .then(result => {
      if (result.success) {
        this.componentDidMount();
      } else {
        alert(result.error)
      }
    })
    .catch(err => alert(err.message))
  }

  // deleteStudent = (e, studentId, name) => {
  //   e.stopPropagation();
  //   if (!window.confirm(`Are you sure you want to delete ${name}'s account?`)) return
  //   fetch('/admin/student/'+studentId, {
  //     credentials: 'same-origin',
  //     method: 'DELETE',
  //   })
  //   .then(res => res.json())
  //   .then(result => {
  //     if (result.success) {
  //       this.componentDidMount();
  //     } else {
  //       alert(result.error)
  //     }
  //   })
  //   .catch(err => alert(err.message))
  // }

  addStudent = () => {
    if (this.state.newStudentInput.length < 5 || !/^[a-z](?!.*[ '-]{2})(?!.*[.'-]{2}).*[ a-z\-'.]+[a-z]$/i.test(this.state.newStudentInput)) {
      return alert("Name must be at least 5 characters long and contain only letters, spaces");
    }
    if (!this.state.newStudentCohort) return alert('Please enter a valid cohort name')
    fetch('/admin/student/new', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.newStudentInput,
        cohortName: this.state.newStudentCohort
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ newStudentInput: '', newStudentCohort: '' }, this.componentDidMount)
      } else {
        alert(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  changeCohort = (e, studentId, name) => {
    e.stopPropagation();
    const newCohortName = window.prompt(`Which cohort should ${name} be moved to?`)
    if (newCohortName) {
      fetch('/admin/student/'+studentId, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newCohortName })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert(`Successfully moved ${name} to ${newCohortName} cohort`)
          this.componentDidMount()
        } else {
          alert(result.error)
        }
      })
      .catch(err => console.log(err.message))
    }
  }

  updateName = (e, studentId, name) => {
    e.stopPropagation();
    const newName = window.prompt(`Please enter an updated name for ${name}:`)
    if (newName) {
      if (newName.length < 5 || !/^[a-z](?!.*[ '-]{2})(?!.*[.'-]{2}).*[ a-z\-'.]+[a-z]$/i.test(newName)) {
        return alert("Name must be at least 5 characters long and contain only letters, spaces");
      }
      fetch('/admin/student/'+studentId, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert(`Successfully changed ${name} to ${newName}`)
          this.componentDidMount()
        } else {
          alert(result.error)
        }
      })
      .catch(err => console.log(err.message))
    }
  }

  render() {
    let { students, cohorts, sortBy, sortReverse,
          queryName, queryCohort, queryStatus,
          newStudentInput, newStudentCohort } = this.state
    if (sortBy) {
      students = _.sortBy(students, student => {
        if (sortBy === 'Name') {
          return student.name
        } else if (sortBy === 'Cohort') {
          return student.cohort.name
        } else if (sortBy === 'Status') {
          return student.status
        }
      })
    }
    if (queryName) {
      students = students.filter(student => student.name.toLowerCase().includes(queryName.toLowerCase()))
    }
    if (queryCohort) {
      students = students.filter(student => student.cohort.name.toLowerCase().includes(queryCohort.toLowerCase()))
    }
    if (queryStatus) {
      students = students.filter(student => student.status === queryStatus)
    }
    if (sortReverse) {
      students = students.reverse()
    }
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.column1 }
                 onClick={ () => this.sort('Name') } >
              Name { sortBy === 'Name' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
            </div>
            <div style={ styles.columnMid }
                 onClick={ () => this.sort('Cohort') } >
              Cohort { sortBy === 'Cohort' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
             </div>
            <div style={ styles.columnMid }
                 onClick={ () => this.sort('Status') } >
              Status { sortBy === 'Status' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
            </div>
            <div style={ styles.studentActions } >Actions</div>
          </Segment>

          <Segment inverted attached={true} style={ styles.header } >
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '200px' }}>
                <Form.Field>
                  <input placeholder="Filter by name..."
                         value={ queryName }
                         onChange={ e => this.setState({ queryName: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.columnMid } >
              { this.props.cohort ? null : <Form size="small" style={{ width: '70%' }}>
                <Form.Field control="select"
                            onChange={ e => this.setState({ queryCohort: e.target.value }) }
                            value={ queryCohort } >
                  <option value="" ></option>
                  { cohorts.map(option => <option key={ option } value={ option } >{ option }</option>) }
                </Form.Field>
              </Form> }
            </div>
            <div style={ styles.columnMid } >
              <Form size="small" style={{width: '50%'}} >
                <Form.Field control="select"
                            onChange={ e => this.setState({ queryStatus: e.target.value }) }
                            value={ queryStatus } >
                  <option value="" ></option>
                  <option value="New" >New</option>
                  <option value="Active" >Active</option>
                  <option value="Inactive" >Inactive</option>
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column2 } ></div>
          </Segment>

          <List selection style={ styles.list } >
          { students.map((student) => {
            return <List.Item key={student._id} style={ styles.listItem } onClick={ () => this.props.showProfile(student._id) } >
                     <Segment attached={true} style={ styles.studentContainer } >
                       <div style={ styles.studentInfo } >{ student.name }</div>
                       <div style={ styles.cohort }>{ student.cohort.name }</div>
                       <div style={{flex: 2, textAlign: 'left', fontSize: '15px', fontWeight: 'bold', color: student.status === 'Active' ? 'green' : student.status === 'Inactive' ? 'grey' : 'purple' }}>{ student.status }</div>
                       <div style={ styles.studentActions } >
                         { student.status === 'Inactive' ? null : <Button compact={true}
                                                                          color="blue"
                                                                          size="tiny"
                                                                          style={ styles.button }
                                                                          onClick={ (e) => this.updateName(e, student._id, student.name) } >Edit</Button> }
                         { student.status === 'Inactive' ? null : <Button compact={true}
                                                                          color="purple"
                                                                          size="tiny"
                                                                          style={ styles.button }
                                                                          onClick={ (e) => this.changeCohort(e, student._id, student.name) } >Move</Button> }
                         { student.status === 'Inactive' ? null : <Button compact={true}
                                                                          color='grey'
                                                                          size="tiny"
                                                                          style={ styles.button }
                                                                          onClick={ (e) => this.modifyStatus(e, student._id, 'Inactive', student.name) } >Deactivate</Button> }
                         { student.status === 'Inactive' ? null : <Button color='green'
                                                                          size="tiny"
                                                                          compact={true}
                                                                          style={ styles.button }
                                                                          onClick={ (e) => this.modifyStatus(e, student._id, 'New', student.name) } >Reset</Button> }
                         {/* <Button color='red'
                                 size="tiny"
                                 compact={true}
                                 style={ styles.button }
                                 onClick={ (e) => this.deleteStudent(e, student._id, student.name) } >Delete</Button> */}
                       </div>
                     </Segment>
                   </List.Item>
          }) }
          </List>
          { this.props.cohortStatus === 'Inactive' ? null : <Segment inverted attached="bottom" style={ styles.bottom }>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '200px' }}>
                <Form.Field>
                  <input placeholder="Enter new student's full name"
                         value={ newStudentInput }
                         onChange={ e => this.setState({ newStudentInput: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.columnMid } >
              <Form size="small" style={{ width: '150px' }}>
                <Form.Field>
                  <input placeholder="Enter cohort name..."
                         value={ newStudentCohort }
                         disabled={ this.props.cohort ? true : false }
                         onChange={ e => this.setState({ newStudentCohort: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.columnMid } ></div>
            <div style={ styles.column2 } >
              <Button compact={true}
                      color='blue'
                      size="tiny"
                      style={ styles.button }
                      onClick={ this.addStudent } >Add</Button>
            </div>
          </Segment> }
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
    height: '20%'
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
    width: '30%',
    padding: '10px 20px',
    margin: '10px 0'
  },
  pairDate: {
    color: 'blue',
    fontSize: '20px',
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
    alignItems: 'center'
  },
  pairsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: '1.5em'
  },
  partnerColumn: {
    display: 'flex',
    flexDirection: 'column'
  }
}