import express from 'express';
import moment from 'moment';
import { Pair, Rating, Attendance } from '../../models/models';
import setResponse from '../../util/setResponse';

const router = express.Router();

// get record of all previous pairs
router.get('/history', (req, res) => {
  let pairs;
  Pair.find({ students: req.user.id, date: {$lt: moment.format("YYYY-MM-DD")} },
    { createdBy: 0, lastModifiedBy: 0 })
    .sort({ date: -1 })
    .populate('students', 'name')
    .then((result) => {
      pairs = result.map(pair => pair.toObject());
      // take out student's name from partner list
      pairs.forEach((pair) => {
        pair.students = pair.students.filter(stud => stud.name !== req.user.name);
      });
      return Rating.find({ student: req.user.id }).populate('partner', 'name');
    })
    .then((ratings) => {
      // check whether student has rated their partners;
      pairs.forEach((pair) => {
        pair.students.forEach((student) => {
          const index = ratings.findIndex(rate => rate.partner.name === student.name &&
            rate.date === pair.date);
          if (index === -1) {
            student.rated = false;
          } else {
            student.rated = ratings[index];
          }
        });
      });
      return setResponse(res, 200, true, { history: pairs });
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// get a student's partner(s) for the day, check if already logged in
router.get('/today', (req, res) => {
  const resp = {};
  const today = moment().toISOString(true).slice(0, 10);
  Pair.findOne({ students: req.user.id, date: today },
    { createdBy: 0, lastModifiedBy: 0, cohort: 0 })
    .populate('students', 'name')
    .then((pair) => {
      if (pair) pair.students = pair.students.filter(stud => String(stud.id) !== String(req.user.id));
      // if pair.students arr length = 0, student has no partner for the day
      resp.pair = pair;
      return Attendance.findOne({ student: req.user.id, date: today });
    })
    .then((attendance) => {
      resp.attendance = !!attendance;
      resp.name = req.user.name;
      // check if word of the day exists
      return setResponse(res, 200, true, resp);
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// get entire cohort's pairs for the day
router.get('/cohort', (req, res) => {
  const today = moment().toISOString(true).slice(0, 10);
  Pair.find({ cohort: req.user.cohort, date: today }, { createdBy: 0, lastModifiedBy: 0 })
    .populate('students', 'name')
    .then((pairs) => {
      if (pairs.length === 0) {
        throw new Error(`Pairs are not (yet) made for ${today}`);
      }
      return setResponse(res, 200, true, { pairs, date: today });
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

export default router;
