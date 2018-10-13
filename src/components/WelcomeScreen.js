import React, { Component } from 'react';
import StudentAuth from './Auth/StudentAuth';
import InstructorAuth from './Auth/InstructorAuth';
import logo from '../app.png';

export default class WelcomeScreen extends Component {
  componentDidMount() {
    fetch('/session', {
      credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        if (res.user === 'Student') {
          this.props.navigate('StudentPortal')
        } else {
          this.props.navigate('AdminPortal')
        }
      }
    })
    .catch(err => console.log(err.message))
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Horizons!</h1>
        </header>
        <div className="Home">
          <StudentAuth navigate={this.props.navigate} />
          <InstructorAuth navigate={this.props.navigate} />
        </div>
      </div>
    );
  }
}
