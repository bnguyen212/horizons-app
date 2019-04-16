import React from 'react';
import moment from 'moment';
import Rating from './Rating';
import { Modal, Segment, Header } from 'semantic-ui-react';


const CheckCompatibilityModal = ({ ratings, pairs, handleClose, students }) => {
  return (
    <Modal onClose={handleClose}
      dimmer='blurring'
      closeIcon
      defaultOpen={true}
      size='small'>
      <Header size="large"
        icon='users'
        attached="top"
        content={`${students[0]} - ${students[1]}${students[2] ? ` - ${students[2]}` : ''}`} />
      <Modal.Content style={{ display: 'flex', flexDirection: 'row' }}>
        <Modal.Content scrolling={true} style={{ flex: 1, margin: '0 5% 0 0' }} >
          {pairs.length ? pairs.map(pair => {
            return <Segment key={pair._id} attached={false} >
              <div style={styles.pairDate} >Partners on: <u>{moment(pair.date).format(' l')}</u></div>
              <ul>
                {pair.students.map(student => {
                  return <li key={student._id} style={{ marginTop: '10px', fontWeight: students.includes(student.name) ? 'bold' : 'normal' }} >{student.name}</li>
                })} </ul>
            </Segment>
          }) : <h1 style={{ color: 'red', textAlign: 'center', padding: '10% 0', fontSize: '15px' }}>No pairing history found</h1>}
        </Modal.Content>

        <Modal.Content scrolling={true} style={{ flex: 1, margin: '0 0 0 5%' }} >
          {ratings.length ? ratings.map(rate => {
            return <Segment key={rate._id} attached={false} >
              <div style={styles.pairDate} >{moment(rate.date).format('dddd, l')}</div>
              <div style={{ fontSize: '15px' }} ><Rating rater={rate.student.name} rated={rate.partner.name} rating={rate.rating} /></div>
            </Segment>
          }) : <h3 style={{ color: 'red', textAlign: 'center', padding: '10% 0', fontSize: '15px' }}>No ratings found</h3>}
        </Modal.Content>
      </Modal.Content>
    </Modal>
  )
}

const styles = {
  pairDate: {
    color: 'blue',
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '10px'
  }
}

export default CheckCompatibilityModal;