import React, { Component } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import AdminPortal from './components/AdminPortal';
import StudentPortal from './components/StudentPortal';

class App extends Component {
  state = {
    currentPage: 'Home'
  }

  navigate = (page) => {
    this.setState({currentPage: page})
  }

  render() {
    return (
      <div className="App">
        { this.state.currentPage === 'Home' ? <WelcomeScreen navigate={this.navigate} /> : null }
        { this.state.currentPage === 'AdminPortal' ? <AdminPortal navigate={this.navigate} /> : null }
        { this.state.currentPage === 'StudentPortal' ? <StudentPortal navigate={this.navigate} /> : null }
      </div>
    )
  }
}

export default App;
