import React, { Component } from 'react';
import {  Menu, Segment } from 'semantic-ui-react';
import moment from 'moment';

export default class InfoTab extends Component {
  state = {
    activePane: 'word'
  }

  handleRender = (pane) => {
    switch (pane) {
      case 'word':
        return <TodayWord />
      case 'account':
        return <AccountUpdate />
      default:
        return <h1>TBA</h1>
    }
  }

  logout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to log out?')) {
      fetch('/logout', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.props.navigate('Home')
        } else {
          console.log(result.error)
        }
      })
      .catch(err => console.log(err.message))
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activePane: name })

  render() {
    const { activePane } = this.state
    return (
      <div className="tab" >
        <Menu size="large"
              compact={ true }
              borderless={ false }
              pointing
              vertical
              style={{ flex: 1, margin: 0 }} >
          <Menu.Item name='word'
                     color="red"
                     active={ activePane === 'word' }
                     onClick={ this.handleItemClick } >Word of the Day</Menu.Item>
          <Menu.Item name='announcements'
                     color="red"
                     active={ activePane === 'announcements' }
                     onClick={ this.handleItemClick } >Announcements</Menu.Item>
          <Menu.Item name='lecture'
                     color="red"
                     active={ activePane === 'lecture' }
                     onClick={ this.handleItemClick } >Lecture Schedule</Menu.Item>
          <Menu.Item name='schedule'
                     color="red"
                     active={ activePane === 'schedule' }
                     onClick={ this.handleItemClick } >Staff Schedule</Menu.Item>
          <Menu.Item name='notes'
                     color="red"
                     active={ activePane === 'notes' }
                     onClick={ this.handleItemClick } >Notes</Menu.Item>
          <Menu.Item name='links'
                     color="red"
                     active={ activePane === 'links' }
                     onClick={ this.handleItemClick } >Important Links</Menu.Item>
          <Menu.Item name='FAQ'
                     color="red"
                     active={ activePane === 'FAQ' }
                     onClick={ this.handleItemClick } >FAQ</Menu.Item>
          <Menu.Item name='account'
                     color="red"
                     active={ activePane === 'account' }
                     onClick={ this.handleItemClick } >Account Settings</Menu.Item>
          <Menu.Item name='logout'
                     color="red"
                     active={ activePane === 'logout' }
                     onClick={ this.logout } >Logout</Menu.Item>
        </Menu>
        <Segment style={{ display: 'flex',
                          flex: 6,
                          marginTop: 0,
                          marginLeft: '2%',
                          alignItems: 'center',
                          justifyContent: 'center' }} >
          { this.handleRender(activePane) }
        </Segment>
      </div>
    )
  }
}

class TodayWord extends Component {
  state = {
    word: null,
    error: ''
  }

  componentDidMount = () => {
    fetch('/admin/word/today', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ word: result.word })
      } else {
        this.setState({ error: result.error })
      }
    })
    .catch(err => alert(err.message))
  }

  render() {
    return (
      <div>
        { this.state.word ? <div className="word-container" >
                              <h1>{ moment(this.state.word.date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY') }</h1>
                              <h1 className="word" >{ this.state.word.word }</h1>
                            </div> : <h1>{ this.state.error }</h1> }
      </div>
    )
  }
}

class AccountUpdate extends Component {
  state = {
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  }

  updatePassword = (e) => {
    e.preventDefault();
    if (this.state.currentPassword === this.state.newPassword) return alert('New password cannot be the same as your current password');
    if (this.state.newPassword !== this.state.repeatPassword) return alert('New passwords do not match')
    if (this.state.newPassword.length < 8 || !/^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/.test(this.state.newPassword)) {
      return alert('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long');
    }
    if (this.state.currentPassword && this.state.newPassword && this.state.repeatPassword) {
      fetch('/admin/update', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: this.state.currentPassword,
          newPassword: this.state.newPassword
        })
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          alert('Successfully updated your password')
          this.setState({ currentPassword: '', newPassword: '', repeatPassword: '' })
        } else {
          alert(res.error)
        }
      })
      .catch(err => alert(err.message))
    } else {
      return alert('Please fill out all fields')
    }
  }

  render() {
    return (
      <form className="form" onSubmit={ this.updatePassword } >
        <h1>Update Password</h1>
        <br />
        <div className="ui input">
          <input value={ this.state.currentPassword }
                 type="password"
                 placeholder="Current Password"
                 onChange={ e => this.setState({ currentPassword: e.target.value }) } />
        </div>
        <br />
        <br />
        <div className="ui input">
          <input value={ this.state.newPassword }
                 type="password"
                 placeholder="New Password"
                 onChange={ e => this.setState({ newPassword: e.target.value }) } />
        </div>
        <br />
        <br />
        <div className="ui input">
          <input value={ this.state.repeatPassword }
                 type="password"
                 placeholder="Repeat New Password"
                 onChange={ e => this.setState({ repeatPassword: e.target.value }) } />
        </div>
        <br />
        <br />
        <br />
        <button type="submit" className="ui blue button">Update Password</button>
      </form>
    )
  }
}