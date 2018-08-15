import express from 'express';
import { Word } from '../models/models';
import setResponse from '../setResponse';
import moment from 'moment';

const router = express.Router();

// get today's word
router.get('/today', (req, res) => {
  const today = moment().toISOString(true).slice(0, 10);
  Word.findOne({ date: today })
    .then((word) => {
      if (!word) throw new Error(`No word of the day created for ${moment(today).format('dddd, MMMM Do, YYYY')}`);
      return setResponse(res, 200, true, { word });
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// get words of the day
router.get('/', (req, res) => {
  // return words of the day between start and end dates in descending order
  // if (req.query.start || req.query.end) {
  //   // check if end date comes after start date
  //   if (req.query.start && req.query.end && req.query.end < req.query.start) {
  //     return setResponse(res, 400, false, { error: 'Invalid date range' });
  //   }
  //   return Word.find().sort({ date: -1 }).populate('createdBy', 'username')
  //     .then((words) => {
  //       words = words.filter((word) => {
  //         if (req.query.start && req.query.end) {
  //           return word.date >= req.query.start && word.date <= req.query.end;
  //         }
  //         if (req.query.start) {
  //           return word.date >= req.query.start;
  //         }
  //         if (req.query.end) {
  //           return word.date <= req.query.end;
  //         }
  //         return false;
  //       });
  //       return setResponse(res, 200, true, { words });
  //     })
  //     .catch(err => setResponse(res, 500, false, { error: err.message }));
  // }
  // return default the last 20
  return Word.find().sort({ date: -1 }).limit(50).populate('createdBy', 'username')
    .then(words => setResponse(res, 200, true, { words }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// create new word of the day
router.post('/new', (req, res) => {
  if (!req.body.word || !req.body.date) {
    return setResponse(res, 400, false, { error: 'Missing parameter(s)' });
  }
  if (req.body.word.length < 4 || !/^[a-z](?!.*[-]{2}).*[a-z-]+[a-z]$/i.test(req.body.word)) {
    return setResponse(res, 400, false, { error: 'Word of the day must be at least 4 characters long' });
  }
  const today = moment().toISOString(true).slice(0, 10);
  if (req.body.date < today) {
    return setResponse(res, 400, false, { error: 'Cannot set word of the day in the past' });
  }
  return Word.findOne({ $or: [{ date: req.body.date }, { word: req.body.word.toLowerCase() }] })
    .then((word) => {
      if (word) {
        if (word.date === req.body.date) {
          throw new Error(`A word of the day already exist for ${moment(req.body.date).format('MMMM Do, YYYY')}`);
        } else {
          throw new Error(`Word of the day already used on ${moment(word.date).format('MMMM Do, YYYY')}`);
        }
      }
      const newWord = new Word({
        word: req.body.word.toLowerCase(),
        date: req.body.date,
        createdBy: req.user.id,
        lastModifiedBy: { time: new Date(), user: req.user.id }
      });
      return newWord.save();
    })
    .then(word => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// only admin users has access to fthe following routes
router.use('*', (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return setResponse(res, 401, false, { error: 'Only Admin users have access' });
});

// update word of the day
router.post('/:wordId', (req, res) => {
  if (!req.body.word) {
    return setResponse(res, 400, false, { error: 'Missing parameter' });
  }
  if (req.body.word.length < 4 || !/^[a-z](?!.*[ -]{2}).*[ a-z-]+[a-z]$/i.test(req.body.word)) {
    return setResponse(res, 400, false, { error: 'Word of the day must be at least 4 characters long' });
  }
  const today = moment().toISOString(true).slice(0, 10);
  Word.findById(req.params.wordId)
    .then((word) => {
      if (!word) throw new Error('Invalid word ID');
      if (word.date <= today) throw new Error('Cannot modify WOTD in the past');
      word.word = req.body.word.toLowerCase();
      word.lastModifiedBy = { time: new Date(), user: req.user.id };
      return word.save();
    })
    .then((word) => {
      if (!word) throw new Error('Invalid word ID');
      return setResponse(res, 200, true);
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// delete word of the day
router.delete('/:wordId', (req, res) => {
  const today = moment().toISOString(true).slice(0, 10);
  Word.findById(req.params.wordId)
    .then((word) => {
      if (!word) throw new Error('Invalid word ID');
      if (word.date <= today) throw new Error('Cannot delete WOTD in the past');
      return word.remove();
    })
    .then((word) => {
      console.log(word);
      if (word) return setResponse(res, 200, true);
      throw new Error('Invalid word ID');
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

export default router;
