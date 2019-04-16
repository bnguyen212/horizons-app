import express from 'express';
import moment from 'moment';
import { Attendance, Word } from '../../models/models';
import setResponse from '../../util/setResponse';

const router = express.Router();

// student fill out attendance with word of the day
// student are not allowed to modify previous attendance
router.post('/new/', (req, res) => {
  if (!req.body.today || !req.body.word) {
    return setResponse(res, 400, false, { error: 'Missing parameter(s)' });
  }
  // check if the date is today
  const today = moment().toISOString(true).slice(0, 10);
  if (today !== req.body.today) {
    return setResponse(res, 400, false, { error: 'Cannot check in for a previous or future date' });
  }
  // check if already checked in for the day
  return Attendance.findOne({ student: req.user.id, date: req.body.today }) // double check
    .then((attendance) => {
      if (attendance) throw new Error('You already checked in today');
      // check if word of the day exists
      return Word.findOne({ date: req.body.today });
    })
    .then((word) => {
      if (!word) {
        throw new Error('No word of the day created yet. Please let an instructor know!');
      }
      // check if word of the day matches
      if (word.word !== req.body.word.toLowerCase()) {
        throw new Error('Invalid word of the day');
      }
      const newAttendance = new Attendance({
        student: req.user.id,
        word: word.id,
        date: req.body.today
      });
      return newAttendance.save();
    })
    .then(attendance => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// get a student's attendance record
router.get('/', (req, res) => {
  Attendance.find({ student: req.user.id },
    { word: 0, student: 0 })
    .sort({ date: -1 })
    .populate('checkedInBy.user', 'username')
    .then(attendance => setResponse(res, 200, true, { attendance }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

export default router;
