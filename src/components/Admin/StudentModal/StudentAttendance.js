import React, { Component } from 'react';
import { Segment, Modal } from 'semantic-ui-react';
import moment from 'moment';

export default class StudentAttendance extends Component {
  state = {
    attendance: []
  }

  componentDidMount = () => {
    fetch('/admin/attendance/'+this.props.id, { credentials: 'same-origin' })
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
      <Modal.Content scrolling={true} style={ styles.pairsContainer } >
        { attendance.length ? attendance.map(day => {
          return <Segment key={day._id} attached={false} style={ styles.attendance } >
                   <div style={styles.date} >{moment(day.date).format('dddd, LL') }</div>
                   { day.checkedInBy ? <div style={ styles.description }>Checked in by { day.checkedInBy.user.username }</div> : null}
                 </Segment>
        }) : <h1 style={ styles.warning }>No attendance record found</h1>}
      </Modal.Content>
    )
  }
}

const styles = {
  pairsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: '1.5em'
  },
  attendance: {
    width: '23%',
    padding: '10px',
    margin: '10px 1%',
  },
  date: {
    color: 'green',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  description: {
    textAlign: 'right',
    paddingTop: '5px',
    fontSize: '8px',
    fontStyle: 'italic'
  },
  warning: {
    color: 'red',
    textAlign: 'center',
    padding: '10% 0'
  }
}