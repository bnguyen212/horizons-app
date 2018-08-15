import React, { Component } from 'react';
import logo from '../app.png';
import { Menu, Icon } from 'semantic-ui-react';
import InfoTab from './Admin/InfoTab';
import UsersTab from './Admin/UsersTab';
import StudentsTab from './Admin/StudentsTab';
import CohortsTab from './Admin/CohortsTab';
import WordsTab from './Admin/WordsTab';
import TablesTab from './Admin/TablesTab';
import StudentModal from './Admin/StudentModal';

export default class AdminPortal extends Component {
  state = {
    activeIndex: 0,
    modalInfo: {},
    modalOpen: false
  }

  handleItemClick = (e, { index }) => this.setState({ activeIndex: index })

  handleRender = (tab) => {
    switch (tab) {
      case 0:
        return <InfoTab navigate={ this.props.navigate } />
      case 1:
        return <StudentsTab showProfile={ this.showProfile } />
      case 2:
        return <CohortsTab showProfile={ this.showProfile } />
      case 3:
        return <WordsTab />
      case 4:
        return <UsersTab />
      case 5:
        return <TablesTab />
      default:
        return <h1>TBA</h1>
    }
  }

  showProfile = (studentId) => {
    fetch('/admin/student/'+studentId, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      this.setState({
        modalOpen: true,
        modalInfo: result.student
      })
    })
    .catch(err => console.log(err.message))
  }

  handleClose = () => this.setState({ modalOpen: false })

  render() {
    const { activeIndex, modalInfo, modalOpen } = this.state
    return (
      <div className="App">
        <header className="small-header">
          <div className="logo-container">
            <img src={logo} className="small-logo" alt="logo" />
            <h1 className="small-title">Horizons!</h1>
          </div>
          <Menu inverted size="small" compact={ true } className="nav-bar">
            <Menu.Item
              index={ 0 }
              active={ activeIndex === 0 }
              color='red'
              onClick={ this.handleItemClick } >
              <Icon name="info circle" size='large' /> Info
            </Menu.Item>
            <Menu.Item
              index={ 1 }
              active={ activeIndex === 1 }
              color='blue'
              onClick={ this.handleItemClick } >
              <Icon name="address card" size='large' /> Students
            </Menu.Item>
            <Menu.Item
              index={ 2 }
              active={ activeIndex === 2 }
              color='violet'
              onClick={ this.handleItemClick } >
              <Icon name="group" size='large' /> Cohorts
            </Menu.Item>
            <Menu.Item
              index={ 3 }
              active={ activeIndex === 3 }
              color='orange'
              onClick={ this.handleItemClick } >
              <Icon name="calendar" size='large' /> Words of the Day
            </Menu.Item>
            <Menu.Item
              index={4 }
              active={ activeIndex === 4 }
              color='green'
              onClick={ this.handleItemClick } >
              <Icon name="user" size='large' /> Staff
            </Menu.Item>
            <Menu.Item
              index={ 5 }
              active={ activeIndex === 5 }
              color='teal'
              onClick={ this.handleItemClick } >
              <Icon name="building" size='large' /> Tables
            </Menu.Item>
          </Menu>
        </header>
        <div className="Dashboard">
          { this.handleRender(activeIndex) }
        </div>
        { modalOpen ? <StudentModal handleClose={ this.handleClose } info={ modalInfo } /> : null }
      </div>
    )
  }
}
