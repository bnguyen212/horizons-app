import express from 'express';
import setResponse from '../setResponse';
import { Rating, Student, Pair } from '../models/models';

const router = express.Router();

// student submit new rating
router.post('/new', (req, res) => {
  if (!req.body.partner || !req.body.rating || !req.body.date) {
    return setResponse(res, 400, false, { error: 'Missing parameter(s)' });
  }
  const newRating = new Rating({
    student: req.user.id,
    createdOn: new Date()
  });
  // check if already rated this partner
  return Rating.findOne({ student: req.user.id, partner: req.body.partner, date: req.body.date })
    .then((rating) => {
      if (rating) throw new Error(`Already rated this partner for ${req.body.date}`);
      return Pair.findOne({
        students: { $all: [req.user.id, req.body.partner] },
        date: req.body.date
      });
    })
    .then((pair) => {
      if (!pair) throw new Error('Invalid pair');
      newRating.date = pair.date;
      newRating.rating = req.body.rating;
      return Student.findById(req.body.partner);
    })
    .then((partner) => {
      if (!partner) throw new Error('Invalid partner ID');
      newRating.partner = partner.id;
      return newRating.save();
    })
    .then(rating => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// see your own rating history
// router.get('/', (req, res) => {
//   Rating.find({ student: req.user.id })
//     .sort({ date: -1 })
//     .populate('partner', 'name')
//     .then(ratings => setResponse(res, 200, true, { ratings }))
//     .catch(err => setResponse(res, 400, false, { error: err.message }));
// });

export default router;
