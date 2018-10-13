import React, { Component } from 'react';

export default class StudentAuth extends Component {
  state = {
    name: '',
    password: '',
    passwordRepeat: '',
    show: 'Login'
  }

  login = (e) => {
    e.preventDefault();
    if (!this.state.name) return alert('Please fill out your full name')
    if (this.state.password.length < 8 || !/^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/.test(this.state.password)) {
      return alert('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long');
    }
    fetch('/student/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.name,
        password: this.state.password
      })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        this.props.navigate('StudentPortal')
      } else {
        alert(res.error)
      }
    })
    .catch(err => alert(err.message))
  }

  register = (e) => {
    e.preventDefault();
    if (!this.state.name) return alert('Please fill out your full name')
    if (this.state.password.length < 8 || !/^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/.test(this.state.password)) {
      return alert('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long');
    }
    if (this.state.password !== this.state.passwordRepeat) return alert('Passwords do not match!')
    fetch('/student/register', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.name,
        password: this.state.password
      })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert('Successfully registered!')
        this.setState({ name: '', password: '', passwordRepeat: '', show: 'Login' })
      } else {
        alert(res.error)
      }
    })
    .catch(err => alert(err.message))
  }

  render() {
    return (
      <div className="form-container">
        <div className="form-title">
          <h1>Students</h1>
        </div>
        { this.state.show === 'Login' ?
          <form className="form" onSubmit={ this.login } >
            <div className="ui input">
              <input value={ this.state.name }
                     type="text"
                     placeholder="Name"
                     onChange={ e => this.setState({ name: e.target.value }) } />
            </div>
            <br />
            <br />
            <div className="ui input">
              <input value={ this.state.password }
                     type="password"
                     placeholder="Password"
                     onChange={ e => this.setState({ password: e.target.value }) } />
            </div>
            <br />
            <br />
            <button type="submit" className="ui blue button">Login</button>
          </form> :
          <form className="form" onSubmit={ this.register } >
            <div className="ui input">
              <input value={ this.state.name }
                     type="text"
                     placeholder="Name"
                     onChange={ e => this.setState({ name: e.target.value }) } />
            </div>
            <br />
            <br />
            <div className="ui input">
              <input value={ this.state.password }
                     type="password"
                     placeholder="Password"
                     onChange={ e => this.setState({ password: e.target.value }) } />
            </div>
            <br />
            <br />
            <div className="ui input">
              <input value={ this.state.passwordRepeat }
                     type="password"
                     placeholder="Repeat Password"
                     onChange={ e => this.setState({ passwordRepeat: e.target.value }) } />
            </div>
            <br />
            <br />
            <button type="submit" className="ui red button">Register</button>
          </form>
        }
        { this.state.show === 'Login' ?
        <div className="switch-btn">
          <button type="submit"
                  className="ui red button"
                  onClick={ () => this.setState({ show: 'Register', name: '', password: '' }) } >Register</button>
        </div> :
        <div className="switch-btn">
          <button type="submit"
                  className="ui blue button"
                  onClick={ () => this.setState({ show: 'Login',  name: '', password: '', passwordRepeat: '' }) } >Login</button>
        </div> }
      </div>
    )
  }
}