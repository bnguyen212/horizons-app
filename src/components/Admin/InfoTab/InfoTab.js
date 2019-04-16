import React, { Component } from 'react';
import {  Menu, Segment } from 'semantic-ui-react';
import TodayWord from './TodayWord';
import AccountUpdate from './AccountUpdate';

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
        return <h1>Welcome to Horizons!</h1>
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