import React, { Component } from 'react';
import { Menu, Segment, List, Button, Icon } from 'semantic-ui-react';
import moment from 'moment';
import logo from '../app.png';
import _ from 'underscore';

export default class StudentPortal extends Component {
  state = {
    activePane: 'general',
    myPair: null,
    attendance: false,
    name: ''
  }

  componentDidMount = () => {
    fetch('/student/pair/today', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        console.log(result)
        this.setState({ myPair: result.pair, attendance: result.attendance, name: result.name })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  checkin = () => {
    const wotd = window.prompt('What is the word of the day?')
    if (wotd) {
      fetch('/student/attendance/new', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          today: moment().toISOString(true).slice(0,10),
          word: wotd
        })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert('Successfully checked in')
          this.setState({activePane: 'attendance'})
        } else {
          alert(result.error)
        }
      })
      .catch(err => console.log(err.message))
    } else {
      alert('Please enter a valid word of the day')
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activePane: name })

  handleRender = (pane) => {
    switch (pane) {
      case 'general':
        return <div style={ styles.general }>
                 { this.state.name ? <h1 style={ styles.welcome } >{`Welcome, ${this.state.name.split(' ')[0]}!`}</h1> : null }
                 <h1 style={ styles.date }>{ moment().format('dddd, LL') }</h1>
                 <div>{ this.state.attendance ? <Icon name="check circle" color="green" size="huge" /> : <Button onClick={ this.checkin } color="blue" size="large" >Check In</Button> }</div>
                 <h1 style={ styles.partners }>{ this.state.myPair ? this.displayPartner(this.state.myPair.students) : null }</h1>
                 { this.state.myPair && this.state.myPair.table ? <h2 style={{fontSize: '30px'}}><i>Table</i> : { this.state.myPair.table }</h2> : null }
               </div>
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

  displayPartner = (students) => {
    switch (students.length) {
      case 1:
        return `Your partner for today is ${students[0].name}`
      case 2:
        return `Your partners for today are ${students[0].name} and ${students[1].name}`
      default:
        return 'You do not have a partner today'
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

class Attendance extends Component {
  state = {
    attendance: [],
  }

  componentDidMount = () => {
    fetch('/student/attendance', { credentials: 'same-origin' })
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
    let { attendance } = this.state
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.column3Title }>You checked in on the following dates:</div>
            <div style={ styles.column1 } ></div>
          </Segment>
          <List selection style={ styles.list } >
          { attendance.length ? attendance.map((day) => {
            return <List.Item key={day._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.pairContainer } >
                       <div style={ styles.day } >{ moment(day.date).format('dddd, LL') }</div>
                       <div style={ styles.description } >{ day.checkedInBy ? `Checked in by ${day.checkedInBy.user.username}` : '' }</div>
                     </Segment>
                   </List.Item>
          }) : <h1 style={ styles.warning }>No attendance records found</h1> }
          </List>
        </Segment>
      </div>
    )
  }
}

class AllPairs extends Component {
  state = {
    pairs: [],
    showDate: ''
  }

  componentDidMount = () => {
    fetch('/student/pair/cohort', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ pairs: result.pairs, showDate: result.date })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  render() {
    let { pairs, showDate } = this.state
    pairs = _.sortBy(pairs, pair => pair.table)
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.columnPairTitle }>Pairs { showDate ? `for ${moment(showDate).format('dddd, LL')}` : '' }</div>
            <div style={ styles.columnTableTitle } >Table</div>
          </Segment>
          <List selection style={ styles.list } >
          { pairs.length ? pairs.map((pair) => {
            return <List.Item key={pair._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.pairContainer } >
                       <div style={ styles.pairName } >{ pair.students[0].name }</div>
                       <div style={ styles.pairName } >{ pair.students[1] ? pair.students[1].name : null }</div>
                       <div style={ styles.pairName } >{ pair.students[2] ? pair.students[2].name : null }</div>
                       <div style={ styles.table } >{ pair.table ? pair.table : '-None-' }</div>
                     </Segment>
                   </List.Item>
          }) : <h1 style={ styles.warning }>Pairs are not yet created { showDate ? `for ${moment(showDate).format('dddd, LL')}` : '' }</h1> }
          </List>
        </Segment>
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
      fetch('/student/update', {
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

class PairsHistory extends Component {
  state = {
    pairs: []
  }

  componentDidMount = () => {
    fetch('/student/pair/history', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        console.log(result.history)
        this.setState({ pairs: result.history })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  rate = (partner, partnerName, date) => {
    const rating = window.prompt(`On ${moment(date).format('l')}, how many stars would you rate ${partnerName}?\n (1 star for "Not A Good Match", 5 stars for "Best Partner Ever")`)
    if (Number(rating) > 0 && Number(rating) < 6) {
      fetch('/student/rating/new', {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partner,
          rating: Number(rating),
          date
        })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.componentDidMount()
        } else {
          console.log(result.error)
        }
      })
      .catch(err => console.log(err.message))
    } else {
      alert('Please enter a valid rating between 1 and 5')
    }
  }

  render() {
    let { pairs } = this.state
    pairs = _.sortBy(pairs, pair => pair.date).reverse()
    return (
      <div className="tab" >
        <Segment style={ styles.container } >
          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.columnPairTitle }>Partner(s)</div>
            <div style={ styles.columnDateTitle } >Date</div>
          </Segment>
          <List selection style={ styles.list } >
          { pairs.length ? pairs.map((pair) => {
            return <List.Item key={pair._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.pairHistoryContainer } >
                       <div style={ styles.pair } >
                        <div style={ styles.pairNameHistory }>{ pair.students[0] ? pair.students[0].name : 'No partner assigned.' } { pair.students[0] ? pair.students[0].rated ? null : <Button style={{marginLeft: '20px'}} compact={true} size="tiny" color="grey" onClick={ () => this.rate(pair.students[0]._id, pair.students[0].name, pair.date) }>Rate</Button>  : null }</div>
                         { pair.students[0] ? pair.students[0].rated ? <div style={ styles.subtext } >You rated {pair.students[0].rated.rating} star(s)</div> : null : null }
                        </div>
                       <div style={ styles.pair } >
                         <div style={ styles.pairNameHistory }>{ pair.students[1] ? pair.students[1].name : null } { pair.students[1] ? pair.students[1].rated ? null : <Button style={{marginLeft: '20px'}} compact={true} size="tiny" color="grey" onClick={ () => this.rate(pair.students[1]._id, pair.students[1].name, pair.date) }>Rate</Button>  : null }</div>
                         { pair.students[1] ? pair.students[1].rated ? <div style={ styles.subtext } >You rated {pair.students[1].rated.rating} star(s)</div> : null : null }
                       </div>
                       <div style={ styles.pairDate } >{ moment(pair.date).format('dddd, LL') }</div>
                     </Segment>
                   </List.Item>
          }) : <h1 style={ styles.warning }>No previous pairs found</h1> }
          </List>
        </Segment>
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
  subtext: {
    fontSize: '15px',
    color: 'grey',
    fontStyle: 'italic',
    marginTop: '5px'
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
  container: {
    display: 'flex',
    flex: 1,
    marginTop: 0,
    flexDirection: 'column',
    padding: 0
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
    padding: '0 10%'
  },
  list: {
    margin: 0,
    overflow: 'scroll',
    height: '100%'
  },
  listItem: {
    padding: 0,
    margin: 0
  },
  columnTableTitle: {
    flex: 0.5,
    textAlign: 'left'
  },
  columnDateTitle: {
    flex: 1,
    textAlign: 'left'
  },
  columnPairTitle: {
    flex: 3,
    textAlign: 'left',
  },
  pairContainer: {
    margin: 0,
    width: '100%',
    minHeight: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  pairName: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: '20px',
    flex: 1,
    textAlign: 'left'
  },
  pairHistoryContainer: {
    margin: 0,
    width: '100%',
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  pair: {
    flex: 1.5,
    textAlign: 'left',
  },
  pairNameHistory: {
    color: 'blue',
    fontSize: '20px',
    textAlign: 'left'
  },
  pairDate: {
    fontSize: '15px',
    textAlign: 'left',
    flex: 1
  },
  day: {
    flex: 2,
    textAlign: 'left',
    color: 'green',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  table: {
    flex: 0.5,
    textAlign: 'left',
    color: 'red',
    fontSize: '20px'
  },
  warning: {
    color: 'red',
    margin: '25px 0'
  },
  description: {
    fontStyle: '15px',
    color: 'grey',
    flex: 1
  }
}