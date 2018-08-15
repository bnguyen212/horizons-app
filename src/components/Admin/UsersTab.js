import React, { Component } from 'react';
import { Segment, List, Button, Form } from 'semantic-ui-react';
import moment from 'moment';
import _ from 'underscore';

export default class UsersTab extends Component {
  state = {
    users: [],
    sortBy: 'Name',
    sortReverse: false,
    newUserInput: '',
    newUserRole: 'Instructor',
  }

  componentDidMount = () => {
    fetch('/admin/user/', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ users: result.users })
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

  makeAdmin = (userId, username) => {
    if (!window.confirm(`Are you sure you want to grant ${username} ADMIN access?`)) return
    fetch('/admin/user/'+userId, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'Admin'
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

  modifyStatus = (userId, status) => {
    fetch('/admin/user/'+userId, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
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

  updateName = (userId, name) => {
    const newUsername = window.prompt(`Please enter an updated name for ${name}:`)
    if (newUsername) {
      if (newUsername.length < 5 || !/^[a-z](?!.*[ '-]{2})(?!.*[.'-]{2}).*[ a-z\-'.]+[a-z]$/i.test(newUsername)) {
        return alert("Username must be at least 5 characters long and contain only letters, spaces");
      }
      fetch('/admin/user/'+userId, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newUsername })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert(`Successfully changed ${name} to ${newUsername}`)
          this.componentDidMount()
        } else {
          alert(result.error)
        }
      })
      .catch(err => console.log(err.message))
    }
  }

  // deleteUser = (userId, username) => {
  //   if (!window.confirm(`Are you sure you want to delete ${username}'s account?`)) return
  //   fetch('/admin/user/'+userId, {
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

  addUser = () => {
    if (this.state.newUserInput.length < 5 || !/^[a-z](?!.*[ '-]{2})(?!.*[.'-]{2}).*[ a-z\-'.]+[a-z]$/i.test(this.state.newUserInput)) {
      return alert("Username must be at least 5 characters long and contain only letters, spaces");
    }
    if (this.state.newUserRole === 'Admin' && !window.confirm(`Are you sure you want to grant ${this.state.newUserInput} ADMIN access?`)) {
      return
    }
    fetch('/admin/user/new', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.newUserInput,
        role: this.state.newUserRole,
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        alert('Successfully created account for ' + this.state.newUserInput)
        this.setState({newUserInput: '', newUserRole: 'Instructor'}, this.componentDidMount)
      } else {
        alert(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  render() {
    let { users, sortBy, sortReverse } = this.state
    if (sortBy) {
      users = _.sortBy(users, user => {
        if (sortBy === 'Name') {
          return user.username
        } else if (sortBy === 'Role') {
          return user.role
        } else if (sortBy === 'Status') {
          return user.status
        }
      })
    }
    if (sortReverse) {
      users = users.reverse()
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
                 onClick={ () => this.sort('Role') } >
              Access { sortBy === 'Role' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
             </div>
            <div style={ styles.columnMid }
                 onClick={ () => this.sort('Status') } >
              Status { sortBy === 'Status' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
            </div>
            <div style={ styles.column2 } >Actions</div>
          </Segment>

          <List selection style={ styles.list } >
          { users.map(user => {
            return <List.Item key={user._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.userContainer } >
                       <div style={ styles.userInfo } >
                         <div style={ styles.userName } >{ user.username }</div>
                         <div style={ styles.userLogs } >{ `Created by ${ user.createdBy.username } | Last modified by ${user.lastModifiedBy.user.username} on ${moment(user.lastModifiedBy.time).format('MMM Do, YYYY')}`} </div>
                       </div>
                       <div style={{flex: 2, textAlign: 'left', fontSize: '15px', fontWeight: 'bold', color: user.role === 'Admin' ? 'red' : 'blue' }}>{ user.role }</div>
                       <div style={{flex: 2, textAlign: 'left', fontSize: '15px', fontWeight: 'bold', color: user.status === 'Active' ? 'green' : user.status === 'Inactive' ? 'grey' : 'purple' }}>{ user.status }</div>
                       <div style={ styles.userActions } >
                         { user.status !== 'Inactive' && user.role !== 'Admin' ? <Button color='orange'
                                                                                         size="tiny"
                                                                                         compact={true}
                                                                                         style={ styles.button }
                                                                                         onClick={ () => this.makeAdmin(user._id, user.username) } >Make Admin</Button> : null }
                         { user.status === 'Inactive' ? null : <Button compact={true}
                                                                       color='blue'
                                                                       size="tiny"
                                                                       style={ styles.button }
                                                                       onClick={ () => this.updateName(user._id, user.username) } >Edit</Button> }
                         { user.status === 'Inactive' ? null : <Button compact={true}
                                                                       color='grey'
                                                                       size="tiny"
                                                                       style={ styles.button }
                                                                       onClick={ () => this.modifyStatus(user._id, 'Inactive') } >Deactivate</Button> }
                         <Button color='green'
                                 size="tiny"
                                 compact={true}
                                 style={ styles.button }
                                 onClick={ this.modifyStatus.bind(this, user._id, 'New') } >Reset</Button>
                         {/* <Button color='red'
                                 size="tiny"
                                 compact={true}
                                 style={ styles.button }
                                 onClick={ () => this.deleteUser(user._id, user.username) } >Delete</Button> */}
                       </div>
                     </Segment>
                   </List.Item>
          }) }
          </List>
          <Segment inverted attached="bottom" style={ styles.bottom }>
            <div style={ styles.column1 } >
              <Form size="small" style={{ width: '200px' }}>
                <Form.Field>
                  <input placeholder="Enter new employee..."
                         value={ this.state.newUserInput }
                         onChange={ e => this.setState({ newUserInput: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.columnMid } >
              <Form size="small" style={{width: '50%'}} >
                <Form.Field control="select"
                            onChange={ e => this.setState({ newUserRole: e.target.value })}
                            value={ this.state.newUserRole } >
                  <option value="Instructor" >Instructor</option>
                  <option value="Admin" >Admin</option>
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.columnMid } ></div>
            <div style={ styles.column2 } >
              <Button compact={true}
                      color='blue'
                      size="tiny"
                      style={ styles.button }
                      onClick={ this.addUser } >Add</Button>
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
    padding: 0
  },
  header: {
    color: '#21ba45',
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
  userContainer: {
    margin: 0,
    width: '100%',
    minHeight: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 5%'
  },
  userInfo: {
    flex: 5,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  userName: {
    fontSize: '20px',
    marginTop: '5px',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  userLogs: {
    fontSize: '10px',
    fontStyle: 'italic'
  },
  userActions: {
    flex: 4,
    display: 'flex',
    justifyContent: 'flex-end'
  }
}