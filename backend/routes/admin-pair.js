import express from 'express';
import moment from 'moment';
import {
  Pair, Student, Rating, Cohort, Table
} from '../models/models';
import setResponse from '../setResponse';

const router = express.Router();

// get a student's pairing history, with ratings
router.get('/:studentId', (req, res) => {
  let pairs;
  let student;
  Student.findById(req.params.studentId)
    .then((info) => {
      if (!info) throw new Error('Invalid student ID');
      student = info;
      return Pair.find({ students: info.id })
        .sort({ date: -1 })
        .populate('students', 'name');
    })
    .then((result) => {
      pairs = result.map(pair => pair.toObject());
      // take out student's name from partner list
      pairs.forEach((pair) => {
        pair.students = pair.students.filter(stud => stud.name !== student.name);
      });
      return Rating.find({
        $or: [{
          student: req.params.studentId
        }, {
          partner: req.params.studentId
        }]
      }).populate('student partner', 'name');
    })
    .then((ratings) => {
      // check whether student has rated their partners;
      pairs.forEach((pair) => {
        pair.students.forEach((stud) => {
          const ratingIndex = ratings.findIndex(rate => rate.partner.name === stud.name &&
            rate.date === pair.date);
          const ratedIndex = ratings.findIndex(rate => rate.student.name === stud.name &&
            rate.date === pair.date);
          if (ratingIndex === -1) {
            stud.rating = false;
          } else {
            stud.rating = ratings[ratingIndex].toObject();
          }
          if (ratedIndex === -1) {
            stud.rated = false;
          } else {
            stud.rated = ratings[ratedIndex].toObject();
          }
        });
      });
      return setResponse(res, 200, true, { pairs });
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// get a specific pair info
router.get('/info/:pairId', (req, res) => {
  let students;
  let resp = {};
  Pair.findById(req.params.pairId).populate('students', 'name')
    .then((pair) => {
      if (!pair) throw new Error('Invalid pair ID');
      resp.pair = pair;
      students = pair.students.map(student => String(student.id));
      return Rating.find({ student: { $in: students }, partner: { $in: students }, date: pair.date }).populate('student partner', 'name');
    })
    .then((ratings) => {
      // if (!ratings.length) throw new Error('No ratings found for this pair');
      resp.ratings = ratings;
      return setResponse(res, 200, true, resp);
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// check pair history
router.get('/check/:cohortId', (req, res) => {
  let pairs;
  const students = Object.values(req.query);
  let studentNames;
  if (students.length < 2) {
    return setResponse(res, 400, false, { error: 'Please provide more than one student names to check' });
  }
  // validate cohort ID
  return Cohort.findOne({ _id: req.params.cohortId, status: 'Active' })
    .then((cohort) => {
      if (!cohort) throw new Error('Invalid cohort ID');
      return Student.find({ _id: { $in: students }, cohort: cohort.id }, { password: 0 });
    })
    .then((result) => {
      if (result.length !== students.length) throw new Error('Cannot match all names to valid students');
      studentNames = result.map(obj => obj.toObject().name);
      return Pair.find({ cohort: req.params.cohortId })
        .or([{
          'students.0': { $in: students },
          'students.1': { $in: students }
        }, {
          'students.1': { $in: students },
          'students.2': { $in: students }
        }, {
          'students.0': { $in: students },
          'students.2': { $in: students }
        }])
        .sort({ date: -1 })
        .populate('students', 'name');
    })
    .then((result2) => {
      pairs = result2.slice();
      return Rating.find({
        student: { $in: students },
        partner: { $in: students }
      }).populate('student partner', 'name').sort({ date: -1 });
    })
    .then(ratings => setResponse(res, 200, true, { pairs, ratings, students: studentNames }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// create pair
router.post('/new/:cohortId', (req, res) => {
  // let tableId;
  const today = moment().toISOString(true).slice(0, 10);
  if (!req.body.students || req.body.students.length < 1) {
    return setResponse(res, 400, false, { error: 'Please provide at least one student name to make pair' });
  }
  if (!req.body.date) {
    return setResponse(res, 400, false, { error: 'Missing parameter' });
  }
  if (req.body.date < today) {
    return setResponse(res, 400, false, { error: 'Cannot create pair for a date in the past' });
  }
  // validate cohort ID
  return Cohort.findOne({ _id: req.params.cohortId, status: 'Active' })
    .then((cohort) => {
      if (!cohort) throw new Error('Invalid active cohort ID');
      return Table.find({ table: req.query.table || 'None' });
    })
    .then((table) => {
      if (req.body.table && !table) throw new Error('Invalid table');
      // if (req.body.table) tableId = String(table.id);
      return Student.find({ _id: { $in: req.body.students }, cohort: req.params.cohortId },
        { password: 0 });
    })
    .then((result) => {
      if (result.length !== req.body.students.length) throw new Error('Cannot match all IDs to valid students');
      if (req.body.table) {
        return Pair.find({
          $or: [{
            students: { $elemMatch: { $in: req.body.students } }
          }, {
            table: req.body.table
          }],
          cohort: req.params.cohortId,
          date: req.body.date
        });
      }
      return Pair.find({
        students: { $elemMatch: { $in: req.body.students } },
        cohort: req.params.cohortId,
        date: req.body.date
      });
    })
    .then((pairs) => {
      if (pairs.length !== 0) {
        if (req.body.table && pairs.findIndex(pair => pair.table === req.body.table) !== -1) {
          throw new Error('Table already assigned');
        }
        throw new Error('One or more of the students already in a pair');
      }
      const newPair = new Pair({
        students: req.body.students,
        cohort: req.params.cohortId,
        date: req.body.date,
        createdBy: req.user.id,
        lastModifiedBy: { time: new Date(), user: req.user.id }
      });
      if (req.body.table) newPair.table = req.body.table;
      return newPair.save();
    })
    .then(pair => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// modify current pair
router.post('/move/:pairId', (req, res) => {
  const today = moment().toISOString(true).slice(0, 10);
  let date;
  Pair.findById(req.params.pairId)
    .then((pair) => {
      if (!pair) throw new Error('Invalid pair ID');
      if (pair.date < today) throw new Error('Cannot modify pairs in the past');
      date = pair.date;
      if (req.body.table) {
        return Table.findOne({ table: req.body.table });
      }
    })
    .then((table) => {
      if (req.body.table && !table) throw new Error('Invalid table code');
      if (req.body.table) {
        return Pair.findOne({ date, table: req.body.table });
      }
    })
    .then((pair) => {
      if (pair) throw new Error('Table already assigned');
      const update = {};
      update.lastModifiedBy = { time: new Date(), user: req.user.id };
      if (!req.body.table) {
        update.$unset = { table: '' };
      } else {
        update.table = req.body.table;
      }
      return Pair.findByIdAndUpdate(req.params.pairId, update, { new: true, runValidators: true });
    })
    .then(pair => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// delete current pair
router.delete('/:pairId', (req, res) => {
  const today = moment().toISOString(true).slice(0, 10);
  if (req.body.date < today) {
    return setResponse(res, 400, false, { error: 'Cannot delete a pair in the past' });
  }
  return Pair.findByIdAndRemove(req.params.pairId)
    .then((pair) => {
      if (pair) return setResponse(res, 200, true);
      throw new Error('Invalid pair ID');
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

export default router;
