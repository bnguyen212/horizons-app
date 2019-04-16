import React, { Component } from 'react';
import moment from 'moment';
import { Modal, Header, Icon, Menu } from 'semantic-ui-react';
import StudentPairs from './StudentPairs';
import StudentRatings from './StudentRatings';
import StudentAttendance from './StudentAttendance';

export default class StudentModal extends Component {
  state = {
    activeIndex: 0
  }

  handleItemClick = (e, { index }) => this.setState({ activeIndex: index })

  handleRender = (tab) => {
    switch (tab) {
      case 0:
        return <StudentAttendance id={ this.props.info._id } />
      case 1:
        return <StudentPairs id={ this.props.info._id } name={ this.props.info.name } />
      case 2:
        return <StudentRatings id={ this.props.info._id } />
      default:
        return null
    }
  }

  render() {
    const { activeIndex } = this.state
    return (
      <Modal onClose={this.props.handleClose}
             dimmer='blurring'
             closeIcon
             defaultOpen={true}
             centered={false}
             size='large' >
        <Header size="tiny"
                icon='user'
                attached="top"
                content={`${ this.props.info.name } (${ this.props.info.status } - ${ this.props.info.cohort.name })`}
                subheader={ `Created by ${ this.props.info.createdBy.username } | Last modified by ${ this.props.info.lastModifiedBy.kind === 'Student' ? this.props.info.lastModifiedBy.info.name : this.props.info.lastModifiedBy.info.username} on ${moment(this.props.info.lastModifiedBy.time).format('MMM Do, YYYY')}`} />
        <Menu inverted
              size="tiny"
              compact={true}
              attached={true}
              className="nav-bar"
              widths={3} >
          <Menu.Item
            index={ 0 }
            active={ activeIndex === 0 }
            color='blue'
            style={{ borderRadius: 0 }}
            onClick={ this.handleItemClick } >
            <Icon name="calendar check" size='large' /> Attendance
          </Menu.Item>
          <Menu.Item
            index={ 1 }
            active={ activeIndex === 1 }
            color='blue'
            onClick={ this.handleItemClick } >
            <Icon name="users" size='large' /> Pairs
          </Menu.Item>
          <Menu.Item
            index={ 2 }
            active={ activeIndex === 2 }
            color='blue'
            style={{ borderRadius: 0 }}
            onClick={ this.handleItemClick } >
            <Icon name="star" size='large' /> Ratings
          </Menu.Item>
        </Menu>
          { this.handleRender(activeIndex) }
      </Modal>
    )
  }
}