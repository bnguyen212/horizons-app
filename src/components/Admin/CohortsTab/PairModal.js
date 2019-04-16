import React from 'react';
import moment from 'moment';
import { Segment, Modal, Header } from 'semantic-ui-react';
import Rating from './Rating';

const PairModal = ({ ratings, modalPair, handleClose }) => {
  return (
    <Modal onClose={handleClose}
      dimmer='blurring'
      closeIcon
      defaultOpen={true}
      size='small'>
      <Header size="medium"
        icon='users'
        attached="top"
        content={`${modalPair.students[0].name} - ${modalPair.students[1].name}${modalPair.students[2] ? ` - ${modalPair.students[2].name}` : ''}`}
        subheader={moment(modalPair.date).format('dddd, LL')} />
      <Modal.Content style={{ padding: 0, border: 0 }} >
        {ratings.length ? ratings.map(rating => {
          return <Segment key={rating._id} attached={false} style={styles.pair} >
            <div style={{ fontSize: '12px' }} ><Rating rater={rating.student.name} rated={rating.partner.name} rating={rating.rating} /></div>
          </Segment>
        }) : <h1 style={{ color: 'red', textAlign: 'center', padding: '10% 0' }}>No ratings found for this pair</h1>}
      </Modal.Content>
    </Modal>
  )
}

const styles = {
  pair: {
    padding: "20px 10%",
    margin: 0
  }
}

export default PairModal;