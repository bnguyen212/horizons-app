import React, { Component } from 'react';
import StudentsTab from '../StudentsTab';
import PairsTab from './PairsTab';
import AttendanceTab from '../AttendanceTab';
import { Segment, Menu } from 'semantic-ui-react';


export default class Cohort extends Component {
  state = {
    activePane: 'general'
  }

  handleRender = (pane) => {
    switch (pane) {
      case 'general':
        return <h1 style={{ fontSize: 80, color: 'crimson' }}>{this.props.cohortName}</h1>
      case 'pairs':
        return <PairsTab cohort={this.props.cohortId}
          cohortStatus={this.props.cohortStatus}
          showProfile={this.props.showProfile} />
      case 'students':
        return <StudentsTab cohort={this.props.cohortId}
          cohortName={this.props.cohortName}
          cohortStatus={this.props.cohortStatus}
          showProfile={this.props.showProfile} />
      case 'attendance':
        return <AttendanceTab cohort={this.props.cohortId}
          cohortStatus={this.props.cohortStatus}
          showProfile={this.props.showProfile} />
      default:
        return <h1>Hey there</h1>
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activePane: name })

  render() {
    const { activePane } = this.state
    return (
      <div className="tab">
        <Menu size="large"
          compact={true}
          borderless={false}
          pointing
          vertical
          style={{ flex: 1, margin: 0, borderColor: '#6435c9' }} >
          <Menu.Item name='general'
            color="violet"
            active={activePane === 'general'}
            onClick={this.handleItemClick} >{this.props.cohortName}</Menu.Item>
          <Menu.Item name='attendance'
            color="violet"
            active={activePane === 'attendance'}
            onClick={this.handleItemClick} >Attendance</Menu.Item>
          <Menu.Item name='pairs'
            color="violet"
            active={activePane === 'pairs'}
            onClick={this.handleItemClick} >Pairs</Menu.Item>
          <Menu.Item name='students'
            color="violet"
            active={activePane === 'students'}
            onClick={this.handleItemClick} >Students</Menu.Item>
          <Menu.Item onClick={() => this.props.navigate('all')} >View All Cohorts</Menu.Item>
        </Menu>
        <Segment style={{
          display: 'flex',
          flex: 6,
          marginTop: 0,
          marginLeft: '1%',
          alignItems: 'center',
          padding: 0,
          border: 0,
          justifyContent: 'center'
        }} >
          {this.handleRender(activePane)}
        </Segment>
      </div>
    )
  }
}