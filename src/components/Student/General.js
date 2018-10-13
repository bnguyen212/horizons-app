import React, { Component } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import moment from 'moment';

export default class General extends Component {
  state = {
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
          this.componentDidMount();
        } else {
          alert(result.error)
        }
      })
      .catch(err => console.log(err.message))
    } else {
      alert('Please enter a valid word of the day')
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

  render() {
    return (
      <div style={ styles.general }>
        { this.state.name ? <h1 style={ styles.welcome } >{`Welcome, ${this.state.name.split(' ')[0]}!`}</h1> : null }
        <h1 style={ styles.date }>{ moment().format('dddd, LL') }</h1>
        <div>{ this.state.attendance ? <Icon name="check circle" color="green" size="huge" /> : <Button onClick={ this.checkin } color="blue" size="large" >Check In</Button> }</div>
        <h1 style={ styles.partners }>{ this.state.myPair ? this.displayPartner(this.state.myPair.students) : "Pairs are not (yet) made today." }</h1>
        { this.state.myPair && this.state.myPair.table ? <h2 style={{fontSize: '30px'}}><i>Table</i> : { this.state.myPair.table }</h2> : null }
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
  }
}