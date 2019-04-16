import express from 'express';
import { Student, Attendance, Word } from '../../models/models';
import setResponse from '../../util/setResponse';

const router = express.Router();

// get students who checked in today
// router.get('/', (req, res) => {
//   const today = new Date().toISOString().slice(0, 10)
//   Attendance.find({date: today}).populate('student checkedInBy', 'name cohort username').sort({'student.cohort': 1, 'student.name': 1})
//   .then(attendance => {
//     return attendance.length ? setResponse(res, 200, true, {attendance}) : setResponse(res, 400, false, {error: 'No attendance record found'})
//   })
//   .catch(err => setResponse(res, 500, false, {error: err.message}))
// })

// get a specific student's attendance record
router.get('/:studentId', (req, res) => {
  Student.findById(req.params.studentId)
    .then((student) => {
      if (!student) throw new Error('Invalid student ID');
      return Attendance.find({ student: student.id }).sort({ date: -1 }).populate('student checkedInBy.user', 'name username');
    })
    .then(attendance => setResponse(res, 200, true, { attendance }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// manually check in a student
router.post('/new/:studentId', (req, res) => {
  if (!req.body.date) {
    return setResponse(res, 400, false, { error: 'Missing parameter' });
  }
  const today = new Date().toISOString().slice(0, 10);
  if (req.body.date > today) {
    return setResponse(res, 400, false, { error: 'Cannot check in for a day in the future' })
  }
  return Student.findById(req.params.studentId)
    .then((student) => {
      if (!student) throw new Error('Invalid student ID');
      return Attendance.findOne({ student: student.id, date: req.body.date });
    })
    .then((attendance) => {
      if (attendance) throw new Error('Student already checked in');
      return Word.findOne({ date: req.body.date });
    })
    .then((word) => {
      if (!word) throw new Error('No word of the day created yet!');
      const newAttendance = new Attendance({
        student: req.params.studentId,
        word: word.id,
        date: req.body.date,
        checkedInBy: { time: new Date(), user: req.user.id }
      });
      return newAttendance.save();
    })
    .then(attendance => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

export default router;
