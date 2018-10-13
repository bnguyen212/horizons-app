import React, { Component } from 'react';
import { Segment, List, Button, Form, Menu } from 'semantic-ui-react';
import moment from 'moment';
import StudentsTab from './StudentsTab';
import PairsTab from './PairsTab';
import AttendanceTab from './AttendanceTab';

export default class CohortsTab extends Component {
  state = {
    cohortPage: 'all',
    cohortName: '',
    cohortStatus: ''
  }

  navigate = (cohortPage, name, status) => this.setState({ cohortPage, cohortName: name, cohortStatus: status })

  handleRender = () => {
    switch(this.state.cohortPage) {
      case 'all':
        return <AllCohorts navigate={ this.navigate } />
      default:
        return <Cohort navigate={ this.navigate }
                       cohortId={ this.state.cohortPage }
                       cohortName={ this.state.cohortName }
                       cohortStatus={ this.state.cohortStatus }
                       showProfile={ this.props.showProfile } />
    }
  }

  render() {
    return this.handleRender()
  }
}

class Cohort extends Component {
  state = {
    activePane: 'general'
  }

  handleRender = (pane) => {
    switch (pane) {
      case 'general':
        return <h1 style={{fontSize: 80, color: 'crimson'}}>{ this.props.cohortName }</h1>
      case 'pairs':
        return <PairsTab cohort={ this.props.cohortId }
                         cohortStatus={this.props.cohortStatus}
                         showProfile={ this.props.showProfile } />
      case 'students':
        return <StudentsTab cohort={ this.props.cohortId }
                            cohortName={ this.props.cohortName }
                            cohortStatus={ this.props.cohortStatus }
                            showProfile={ this.props.showProfile } />
      case 'attendance':
        return <AttendanceTab cohort={ this.props.cohortId }
                              cohortStatus={ this.props.cohortStatus }
                              showProfile={ this.props.showProfile } />
      default:
        return <h1>Hey there</h1>
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activePane: name })

  render() {
    const { activePane } = this.state
    return (
      <div className="tab">
        <Menu size="large"
              compact={ true }
              borderless={ false }
              pointing
              vertical
              style={{ flex: 1, margin: 0, borderColor: '#6435c9' }} >
          <Menu.Item name='general'
                     color="violet"
                     active={ activePane === 'general' }
                     onClick={ this.handleItemClick } >{ this.props.cohortName }</Menu.Item>
          <Menu.Item name='attendance'
                     color="violet"
                     active={ activePane === 'attendance' }
                     onClick={ this.handleItemClick } >Attendance</Menu.Item>
          <Menu.Item name='pairs'
                     color="violet"
                     active={ activePane === 'pairs' }
                     onClick={ this.handleItemClick } >Pairs</Menu.Item>
          <Menu.Item name='students'
                     color="violet"
                     active={ activePane === 'students' }
                     onClick={ this.handleItemClick } >Students</Menu.Item>
          <Menu.Item onClick={ () => this.props.navigate('all') } >View All Cohorts</Menu.Item>
        </Menu>
        <Segment style={{ display: 'flex',
                          flex: 6,
                          marginTop: 0,
                          marginLeft: '1%',
                          alignItems: 'center',
                          padding: 0,
                          border: 0,
                          justifyContent: 'center' }} >
          { this.handleRender(activePane) }
        </Segment>
      </div>
    )
  }
}

class AllCohorts extends Component {
  state = {
    cohorts: [],
    newCohortInput: '',
  }

  componentDidMount = () => {
    fetch('/admin/cohort/', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ cohorts: result.cohorts })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  deleteCohort = (e, cohortId, cohort) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${cohort} cohort?`)) return
    fetch('/admin/cohort/'+cohortId, {
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

  addCohort = () => {
    if (!this.state.newCohortInput) {
      return alert('Please enter a valid cohort name')
    }
    fetch('/admin/cohort/new', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cohortName: this.state.newCohortInput })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ newCohortInput: '' }, this.componentDidMount)
      } else {
        alert(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  archiveCohort = (e, cohortId, cohort) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to archive ${cohort} cohort? All students in ${cohort} cohort will also be deactivated.`)) return
    fetch('/admin/cohort/'+cohortId, { credentials: 'same-origin', method: 'LOCK' })
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

  editCohort = (e, cohortId, cohort) => {
    e.stopPropagation();
    const cohortName = window.prompt(`What should ${cohort} cohort be renamed to?`)
    if (cohortName) {
      fetch('/admin/cohort/'+cohortId, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cohortName })
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
    } else {
      alert('Please enter a valid new cohort name')
    }
  }

  render() {
    const { cohorts } = this.state
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.column2 } >Cohort <span>&darr;</span></div>
            <div style={ styles.column2 } >Status</div>
            <div style={ styles.column1 } >Actions</div>
          </Segment>

          <List selection style={ styles.list } >
          { cohorts.map(cohort => {
            return <List.Item key={cohort._id} style={ styles.listItem } onClick={ () => this.props.navigate(cohort._id, cohort.name, cohort.status) } >
                     <Segment attached={true} style={ styles.wordContainer } >
                       <div style={ styles.cohort } >{ cohort.name }</div>
                       <div style={ styles.column2 }>{ cohort.status === 'Active' ? cohort.status : `Archived by ${cohort.archivedBy.user.username } on ${ moment(cohort.archivedBy.time).format('MMM Do, YYYY') }` }</div>
                       <div style={ styles.actions } >
                         <Button color='blue'
                                 size="tiny"
                                 compact={true}
                                 onClick={ (e) => this.editCohort(e, cohort._id, cohort.name) } >Edit</Button>
                         { cohort.status === 'Active' ? <Button compact={true}
                                                                color='grey'
                                                                size="tiny"
                                                                onClick={ (e) => this.archiveCohort(e, cohort._id, cohort.name) } >Archive</Button> : null }
                         <Button color='red'
                                 size="tiny"
                                 compact={true}
                                 onClick={ (e) => this.deleteCohort(e, cohort._id, cohort.name) } >Delete</Button>
                       </div>
                     </Segment>
                   </List.Item>
          }) }
          </List>
          <Segment inverted attached="bottom" style={ styles.bottom }>
            <div style={ styles.column2 } >
              <Form size="small" style={{ width: '175px' }}>
                <Form.Field>
                  <input placeholder="Enter a new cohort..."
                         value={ this.state.newCohortInput }
                         onChange={ e => this.setState({ newCohortInput: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column2 } ></div>
            <div style={ styles.column1 } >
              <Button compact={true}
                      color='blue'
                      size="tiny"
                      onClick={ this.addCohort } >Add</Button>
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
    color: '#6435c9',
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
    minHeight: '60px',
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
  cohort: {
    flex: 2,
    textAlign: 'left',
    fontSize: '25px',
    fontWeight: 'bold',
    color: 'crimson'
  },
  cohortLogs: {
    fontSize: '10px',
    fontStyle: 'italic'
  }
}