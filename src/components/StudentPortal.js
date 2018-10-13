import React, { Component } from 'react';
import { Menu, Segment } from 'semantic-ui-react';
import Attendance from './Student/Attendance';
import AllPairs from './Student/AllPairs';
import AccountUpdate from './Student/AccountUpdate';
import PairsHistory from './Student/PairsHistory';
import General from './Student/General';
import logo from '../app.png';

export default class StudentPortal extends Component {
  state = {
    activePane: 'general',
  }

  handleItemClick = (e, { name }) => this.setState({ activePane: name })

  handleRender = (pane) => {
    switch (pane) {
      case 'general':
        return <General />
      case 'pairs':
        return <AllPairs />
      case 'attendance':
        return <Attendance />
      case 'prevPairs':
        return <PairsHistory />
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

  render () {
    const { activePane } = this.state
    return (
      <div className="App">
        <header className="small-header">
          <div className="logo-container">
            <img src={logo} className="small-logo" alt="logo" />
            <h1 className="small-title">Horizons!</h1>
          </div>
        </header>
        <div className="Dashboard">
          <div className="tab" >
            <Menu size="large"
                  compact={ true }
                  borderless={ false }
                  pointing
                  vertical
                  style={{ flex: 1, margin: 0 }} >
              <Menu.Item name='general'
                         color="red"
                         active={ activePane === 'general' }
                         onClick={ this.handleItemClick } >General</Menu.Item>
              <Menu.Item name='lecture'
                         color="red"
                         active={ activePane === 'lecture' }
                         onClick={ this.handleItemClick } >Lecture Schedule</Menu.Item>
              <Menu.Item name='pairs'
                         color="red"
                         active={ activePane === 'pairs' }
                         onClick={ this.handleItemClick } >All Pairs</Menu.Item>
              <Menu.Item name='attendance'
                         color="red"
                         active={ activePane === 'attendance' }
                         onClick={ this.handleItemClick } >Attendance</Menu.Item>
              <Menu.Item name='prevPairs'
                         color="red"
                         active={ activePane === 'prevPairs' }
                         onClick={ this.handleItemClick } >Previous Pairs</Menu.Item>
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
            <Segment style={ styles.rightTab } >
              { this.handleRender(activePane) }
            </Segment>
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  general: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  welcome: {
    fontSize: '40px',
    color: 'green'
  },
  date: {
    fontSize: '30px',
    margin: '60px 0',
    color: 'indigo',
    fontStyle: 'italic',
  },
  partners: {
    fontSize: '30px',
    margin: '60px 0 30px 0'
  },
  rightTab: {
    display: 'flex',
    flex: 6,
    padding: 0,
    border: 0,
    marginTop: 0,
    marginLeft: '2%',
    alignItems: 'center',
    justifyContent: 'center'
  },
}