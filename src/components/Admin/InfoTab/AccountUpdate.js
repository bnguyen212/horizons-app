import React, { Component } from 'react';

export default class AccountUpdate extends Component {
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
      <form className="form" onSubmit={this.updatePassword} >
        <h1>Update Password</h1>
        <br />
        <div className="ui input">
          <input value={this.state.currentPassword}
            type="password"
            placeholder="Current Password"
            onChange={e => this.setState({ currentPassword: e.target.value })} />
        </div>
        <br />
        <br />
        <div className="ui input">
          <input value={this.state.newPassword}
            type="password"
            placeholder="New Password"
            onChange={e => this.setState({ newPassword: e.target.value })} />
        </div>
        <br />
        <br />
        <div className="ui input">
          <input value={this.state.repeatPassword}
            type="password"
            placeholder="Repeat New Password"
            onChange={e => this.setState({ repeatPassword: e.target.value })} />
        </div>
        <br />
        <br />
        <br />
        <button type="submit" className="ui blue button">Update Password</button>
      </form>
    )
  }
}