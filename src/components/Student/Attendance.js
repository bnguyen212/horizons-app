import React, { Component } from 'react';
import { Segment, List } from 'semantic-ui-react';
import moment from 'moment';

export default class Attendance extends Component {
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
    const { attendance } = this.state
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

const styles = {
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
    minHeight: '40px',
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
  pairContainer: {
    margin: 0,
    width: '100%',
    minHeight: '40px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%',
    fontSize: '12px'
  },
  day: {
    flex: 2,
    textAlign: 'left',
    color: 'green',
    fontWeight: 'bold',
  },
  warning: {
    color: 'red',
    margin: '25px 0'
  },
  description: {
    color: 'grey',
    flex: 1
  }
}