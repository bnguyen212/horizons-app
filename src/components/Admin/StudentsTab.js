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

  // showProfile = (studentId) => {
  //   fetch('/admin/student/'+studentId, { credentials: 'same-origin' })
  //   .then(res => res.json())
  //   .then(result => {
  //     this.setState({
  //       modalOpen: true,
  //       modalInfo: result.student
  //     })
  //   })
  //   .catch(err => console.log(err.message))
  // }

  // handleClose = () => this.setState({ modalOpen: false })

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

// class StudentModal extends Component {
//   state = {
//     activeIndex: 0
//   }

//   handleItemClick = (e, { index }) => this.setState({ activeIndex: index })

//   handleRender = (tab) => {
//     switch (tab) {
//       case 0:
//         return <StudentAttendance id={ this.props.info._id } />
//       case 1:
//         return <StudentPairs id={ this.props.info._id } name={ this.props.info.name } />
//       case 2:
//         return <Segment className="ratings" attached={true}
//                         style={{color: 'blue', height: '500px', overflow: 'scroll'}} >
//                         TBA
//                </Segment>
//       case 3:
//         return <Segment className="rated" attached={true}
//                         style={{color: 'violet', height: '500px', overflow: 'scroll'}} >
//                         TBA
//                </Segment>
//       default:
//         return null
//     }
//   }

//   render() {
//     const { activeIndex } = this.state
//     return (
//       <Modal onClose={this.props.handleClose}
//              dimmer='blurring'
//              closeIcon
//              defaultOpen={true}
//              centered={false}
//              size='large' >
//         <Header size="small"
//                 icon='user'
//                 attached="top"
//                 content={`${ this.props.info.name } (${ this.props.info.status } - ${ this.props.info.cohort.name })`}
//                 subheader={ `Created by ${ this.props.info.createdBy.username } | Last modified by ${ this.props.info.lastModifiedBy.kind === 'Student' ? this.props.info.lastModifiedBy.info.name : this.props.info.lastModifiedBy.info.username} on ${moment(this.props.info.lastModifiedBy.time).format('MMM Do, YYYY')}`} />
//         <Menu inverted
//               size="small"
//               compact={true}
//               attached={true}
//               className="nav-bar"
//               widths={4} >
//           <Menu.Item
//             index={ 0 }
//             active={ activeIndex === 0 }
//             color='blue'
//             style={{ borderRadius: 0 }}
//             onClick={ this.handleItemClick } >
//             <Icon name="calendar check" size='large' /> Attendance
//           </Menu.Item>
//           <Menu.Item
//             index={ 1 }
//             active={ activeIndex === 1 }
//             color='blue'
//             onClick={ this.handleItemClick } >
//             <Icon name="users" size='large' /> Pairs
//           </Menu.Item>
//           <Menu.Item
//             index={ 2 }
//             active={ activeIndex === 2 }
//             color='blue'
//             onClick={ this.handleItemClick } >
//             <Icon name="star" size='large' /> Rated by Others
//           </Menu.Item>
//           <Menu.Item
//             index={ 3 }
//             active={ activeIndex === 3 }
//             color='blue'
//             style={{ borderRadius: 0 }}
//             onClick={ this.handleItemClick } >
//             <Icon name="thumbs up" size='large' /> Rated Others
//           </Menu.Item>
//         </Menu>
//           { this.handleRender(activeIndex) }
//       </Modal>
//     )
//   }
// }

// class StudentAttendance extends Component {
//   state = {
//     attendance: []
//   }

//   componentDidMount = () => {
//     fetch('/admin/attendance/'+this.props.id, { credentials: 'same-origin' })
//     .then(res => res.json())
//     .then(result => {
//       if (result.success) {
//         this.setState({ attendance: result.attendance })
//       } else {
//         console.log(result.error)
//       }
//     })
//     .catch(err => console.log(err.message))
//   }

//   render() {
//     const { attendance } = this.state
//     return (
//       <Modal.Content scrolling={true} >
//         { attendance.length ? attendance.map(day => {
//           return <Segment key={day._id} attached={false} style={ styles.attendance } >
//                    <div style={ styles.weekday } >{ moment(day.date).format('dddd') }</div>
//                    <div style={ styles.date } >{ moment(day.date).format('LL') }</div>
//                    { day.checkedInBy ? <div style={ styles.description }>Checked in by { day.checkedInBy.user.username }</div> : null}
//                  </Segment>
//         }) : <h1 style={{color: 'red'}}>No attendance record found</h1>}
//       </Modal.Content>
//     )
//   }
// }

// class StudentPairs extends Component {
//   state = {
//     pairs: [],
//     queryPartner: '',
//     queryFrom: '',
//     queryTo: ''
//   }

//   componentDidMount = () => {
//     fetch('/admin/pair/'+this.props.id, { credentials: 'same-origin' })
//     .then(res => res.json())
//     .then(result => {
//       if (result.success) {
//         this.setState({ pairs: result.pairs })
//       } else {
//         console.log(result.error)
//       }
//     })
//     .catch(err => console.log(err.message))
//   }

//   render() {
//     let { pairs, queryPartner, queryFrom, queryTo } = this.state
//     if (queryPartner) {
//       pairs = pairs.filter(pair => {
//         const index = pair.students.findIndex(student => student.name.toLowerCase().includes(queryPartner.toLowerCase()))
//         return index !== -1
//       })
//     }
//     if (queryFrom) {
//       pairs = pairs.filter(pair => pair.date >= queryFrom)
//     }
//     if (queryTo) {
//       pairs = pairs.filter(pair => pair.date <=queryTo)
//     }
//     return (
//       <Modal.Content style={{padding: 0, border: 0}}>
//         <Segment inverted attached={true} style={ styles.header2 } >
//           <div style={ styles.column } >
//             Partner: <Form size="small" style={{ margin: '0 30px' }}>
//               <Form.Field>
//                 <input placeholder="Filter by partner name..."
//                        value={ queryPartner }
//                        onChange={ e => this.setState({ queryPartner: e.target.value }) } />
//               </Form.Field>
//             </Form>
//           </div>
//           <div style={ styles.column } >
//             From: <Form size="small" style={{ margin: '0 30px' }}>
//               <Form.Field>
//                 <input type="date"
//                        value={ queryFrom }
//                        onChange={ e => this.setState({ queryFrom: e.target.value }) } />
//               </Form.Field>
//             </Form>
//           </div>
//           <div style={ styles.column } >
//             To: <Form size="small" style={{ margin: '0 30px' }}>
//               <Form.Field>
//                 <input type="date"
//                        value={ queryTo }
//                        onChange={ e => this.setState({ queryTo: e.target.value }) } />
//               </Form.Field>
//             </Form>
//           </div>
//         </Segment>

//         <Modal.Content scrolling={true} style={ styles.pairsContainer } >
//         { pairs.length ? pairs.map(pair => {
//           return <Segment key={pair._id} attached={false} style={ styles.pair } >
//                    <div style={ styles.pairDate } >{ moment(pair.date).format('dddd, l') }</div>
//                    <div style={ styles.partnerColumn } >
//                    { pair.students.map(student => {
//                       return <div key={student._id} style={{ marinTop: '10px' }}>
//                                <div style={{ fontWeight: 'bold' }}>{ student.name }</div>
//                                  <ul>
//                                    <li>{ student.rated ? `${student.name.split(' ')[0]} rated ${student.rated.rating} stars` : `No rating from ${student.name.split(' ')[0]} yet` }</li>
//                                    <li>{ student.rating ? `${this.props.name.split(' ')[0]} rated ${student.rated.rating} stars` : `No rating from ${this.props.name.split(' ')[0]} yet` }</li>
//                                  </ul>
//                              </div>
//                    }) } </div>
//                    { pair.students.length === 0 ? <div style={ styles.pairSub }>No partner assigned on this day</div> : null}
//                  </Segment>
//         }) : <h1 style={{color: 'red'}}>No pairing history found</h1>}
//         </Modal.Content>
//       </Modal.Content>
//     )
//   }
// }

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