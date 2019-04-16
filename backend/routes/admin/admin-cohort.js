import express from 'express';
import moment from 'moment';
import { Cohort, Student, Attendance, Pair } from '../../models/models';
import setResponse from '../../util/setResponse';

const router = express.Router();

// get list of all active cohorts
// router.get('/active', (req, res) => {
//   Cohort.find({ status: 'Active' }).sort({ name: 1 }).populate('createdBy.user', 'username')
//     .then(cohorts => setResponse(res, 200, true, { cohorts }))
//     .catch(err => setResponse(res, 400, false, { error: err.message }));
// });

// get all students in a cohort
router.get('/:cohortId', (req, res) => {
  let cohort;
  Cohort.findById(req.params.cohortId).populate('createdBy.user', 'username')
    .then((cohort1) => {
      if (!cohort1) throw new Error('Invalid cohort ID');
      cohort = cohort1;
      const query = {};
      query.cohort = cohort1.id;
      // if (req.query.active) query.status = { $ne: 'Inactive' };
      return Student.find(query, { password: 0 }).sort({ name: 1 }).populate('createdBy cohort lastModifiedBy.info', 'username name');
    })
    .then(students => setResponse(res, 200, true, { cohort, students }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// get cohort's attendance for a specified date
router.get('/:cohortId/attendance', (req, res) => {
  let cohort;
  // if req.query.date is missing, return today's attendance
  const date = req.query.date || moment().toISOString(true).slice(0, 10);
  Cohort.findById(req.params.cohortId)
    .then((result) => {
      if (!result) throw new Error('Invalid cohort ID');
      return Student.find({ cohort: req.params.cohortId },
        { password: 0, createdBy: 0, lastModifiedBy: 0 })
        .sort({ name: 1 });
    })
    .then((students) => {
      // if (students.length === 0) throw new Error('Invalid cohort ID');
      cohort = students.map(stud => stud.toObject());
      const studArr = students.map(stud => String(stud.id));
      return Attendance.find({ date, student: { $in: studArr } }).populate('checkedInBy.user', 'username');
    })
    .then((attendance) => {
      // if (attendance.length === 0) throw new Error('No attendance record found');
      cohort.forEach((student, i) => {
        const index = attendance.findIndex(element => String(element.student) === String(student._id));
        if (index !== -1) {
          student.attendance = attendance[index];
          // cohort[i] = Object.assign(cohort[i], { attendance: attendance[index] });
        } else {
          student.attendance = false;
          // cohort[i] = Object.assign(cohort[i], { attendance: false });
        }
      });
      return setResponse(res, 200, true, { date, attendance: cohort });
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

router.get('/:cohortId/pairs', (req, res) => {
  // if req.query.date is missing, return today's attendance
  const date = req.query.date || moment().toISOString(true).slice(0, 10);
  Cohort.findById(req.params.cohortId)
    .then((result) => {
      if (!result) throw new Error('Invalid cohort ID');
      return Pair.find({ cohort: req.params.cohortId, date }).sort({ table: 1 })
        .populate('students createdBy lastModifiedBy.user', 'name username');
    })
    .then((pairs) => {
      if (pairs.length === 0) {
        throw new Error(`Pairs are not (yet) made for ${date}`);
      }
      return setResponse(res, 200, true, { date, pairs });
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// get list of all cohorts
router.get('/', (req, res) => {
  Cohort.find().sort({ status: 1, 'createdBy.time': -1 }).populate('createdBy.user archivedBy.user', 'username')
    .then(cohorts => setResponse(res, 200, true, { cohorts }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// only admin users has access to fthe following routes
router.use('*', (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return setResponse(res, 401, false, { error: 'Only Admin users have access' });
});

// create new cohort
router.post('/new', (req, res) => {
  if (!req.body.cohortName) return setResponse(res, 400, false, { error: 'Missing parameter' });
  return Cohort.findOne({ name: req.body.cohortName })
    .then((cohort) => {
      if (cohort) throw new Error('Cohort name already exist');
      const newCohort = new Cohort({
        name: req.body.cohortName,
        createdBy: { time: new Date(), user: req.user.id }
      });
      return newCohort.save();
    })
    .then(cohort => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// update cohort name
router.post('/:cohortId', (req, res) => {
  if (!req.body.cohortName) return setResponse(res, 400, false, { error: 'Missing parameter' });
  return Cohort.findByIdAndUpdate(req.params.cohortId,
    { name: req.body.cohortName }, { new: true, runValidators: true })
    .then((cohort) => {
      if (cohort) return setResponse(res, 200, true);
      throw new Error('Invalid cohort ID');
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// moving entire cohort to inactive status
router.lock('/:cohortId', (req, res) => {
  Cohort.findByIdAndUpdate(req.params.cohortId, { status: 'Inactive', archivedBy: { time: new Date(), user: req.user.id } }, { new: true, runValidators: true })
    .then((cohort) => {
      if (cohort) {
        return Student.updateMany({ cohort: cohort.id }, { status: 'Inactive', lastModifiedBy: { kind: 'User', info: req.user.id } }, { new: true, runValidators: true });
      }
      throw new Error('Invalid cohort ID');
    })
    .then(() => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

router.delete('/:cohortId', (req, res) => {
  Student.find({ cohort: req.params.cohortId })
    .then((students) => {
      if (students.length) throw new Error('Please remove all students in this cohort before delete');
      return Cohort.findByIdAndRemove(req.params.cohortId);
    })
    .then((cohort) => {
      if (cohort) return setResponse(res, 200, true);
      throw new Error('Invalid cohort ID');
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

export default router;
