import React from 'react';

const Rating = ({rater, rated, rating}) => {
  if (rating === 1) {
    return <span style={{ color: 'red' }}><b>{rater}</b> rated <b>{rated}</b> 1 star</span>
  } else if (rating === 2) {
    return <span style={{ color: 'red' }}><b>{rater}</b> rated <b>{rated}</b> 2 stars</span>
  } else if (rating === 3) {
    return <span><b>{rater}</b> rated <b>{rated}</b> 3 stars</span>
  } else if (rating === 4 || rating === 5) {
    return <span style={{ color: 'green' }}><b>{rater}</b> rated <b>{rated}</b> {rating} stars</span>
  } else {
    return <span>{`No rating from ${rater} yet`}</span>
  }
}

export default Rating;