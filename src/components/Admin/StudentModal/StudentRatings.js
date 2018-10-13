import React, { Component } from 'react';
import { Segment, Form, Modal } from 'semantic-ui-react';
import moment from 'moment';
import _ from 'underscore';

export default class StudentRatings extends Component {
  state = {
    rated: [],
    ratings: [],
    sortBy: 'Date',
    sortReverse: true,
  }

  componentDidMount = () => {
    fetch('/admin/rating/'+this.props.id, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ rated: result.rated, ratings: result.ratings })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  sort = (type) => {
    if (this.state.sortBy === type) {
      this.setState({ sortReverse: !this.state.sortReverse })
    } else {
      this.setState({ sortBy: type, sortReverse: false })
    }
  }

  render() {
    let { rated, ratings, sortBy, sortReverse, queryPartner } = this.state
    if (sortBy) {
      rated = _.sortBy(rated, rate => {
        if (sortBy === 'Date') {
          return rate.date
        } else if (sortBy === 'Rating') {
          return rate.rating
        }
      })
      ratings = _.sortBy(ratings, rate => {
        if (sortBy === 'Date') {
          return rate.date
        } else if (sortBy === 'Rating') {
          return rate.rating
        }
      })
    }
    if (queryPartner) {
      rated = rated.filter(rate => rate.partner.name.toLowerCase().includes(queryPartner.toLowerCase()))
      ratings = ratings.filter(rate => rate.student.name.toLowerCase().includes(queryPartner.toLowerCase()))
    }
    if (sortReverse) {
      rated = rated.reverse();
      ratings = ratings.reverse();
    }
    return (
      <Modal.Content style={{padding: 0, display: 'flex', flexDirection: 'column'}}>
        <Segment inverted attached={true} style={ styles.header2 } >
          <div style={ styles.column } >
            Partner: <Form size="small" style={{ margin: '0 30px' }}>
              <Form.Field>
                <input placeholder="Filter by partner name..."
                       value={ queryPartner }
                       onChange={ e => this.setState({ queryPartner: e.target.value }) } />
              </Form.Field>
            </Form>
          </div>
          <div style={ styles.column } onClick={ () => this.sort('Date') } >
            Date { sortBy === 'Date' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
          </div>
          <div style={ styles.column } onClick={ () => this.sort('Rating') } >
            Rating { sortBy === 'Rating' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
          </div>
        </Segment>
        <Segment style={{padding: 0, margin: 0, border: 0, display: 'flex', flexDirection: 'row' }}>
          <Modal.Content scrolling={true} style={ styles.ratingsContainer } >
          { rated.length ? rated.map(rate => {
            return <Segment key={rate._id} attached={true} style={ styles.rating } >
                     { showRating(rate.student.name, rate.partner.name, rate.rating, rate.date) }
                   </Segment>
          }) : <h3 style={{color: 'red', textAlign: 'center', padding: '10% 0'}}>No ratings found</h3>}
          </Modal.Content>

          <Modal.Content scrolling={true} style={ styles.ratingsContainer } >
          { ratings.length ? ratings.map(rate => {
            return <Segment key={rate._id} attached={true} style={ styles.rating } >
                     { showRating(rate.student.name, rate.partner.name, rate.rating, rate.date) }
                   </Segment>
          }) : <h3 style={{color: 'red', textAlign: 'center', padding: '10% 0'}}>No ratings found</h3>}
          </Modal.Content>
        </Segment>
      </Modal.Content>
    )
  }
}

const showRating = (rater, rated, rating, date) => {
  if (rating === 1) {
    return <span style={{fontSize: '15px', color: 'red'}}><b>{ rater }</b> rated <b>{ rated }</b> 1 star on <u>{moment(date).format('LL')}</u></span>
  } else if (rating === 2) {
    return <span style={{fontSize: '15px', color: 'red'}}><b>{ rater }</b> rated <b>{ rated }</b> 2 stars on <u>{moment(date).format('LL')}</u></span>
  } else if (rating === 3) {
    return <span style={{fontSize: '15px'}}><b>{ rater }</b> rated <b>{ rated }</b> 3 star on <u>{moment(date).format('LL')}</u></span>
  } else if (rating === 4 || rating === 5) {
    return <span style={{fontSize: '15px', color: 'green'}}><b>{ rater }</b> rated <b>{ rated }</b> {rating} stars on <u>{moment(date).format('LL')}</u></span>
  } else {
    return <span style={{fontSize: '15px'}}>{`No rating from ${ rater } yet`}</span>
  }
}

 const styles = {
  header2: {
    color: '#2185d0',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%',
    minHeight: '50px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 5%',
    border: 0
  },
  column: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  ratingsContainer: {
    padding: 0,
    flex: 1
  },
  rating: {
    width: '100%',
    margin: 0,
    padding: '2% 5%',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center'
  },
 }