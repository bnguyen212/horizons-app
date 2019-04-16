import express from 'express';
import { Student, Cohort, Attendance, Rating, Pair } from '../../models/models';
import setResponse from '../../util/setResponse';

const router = express.Router();

// get a specific student profile (attendance, pair history, rating and rated history)
// router.get('/:studentId', (req, res) => {
//   const response = {};
//   Student.findById(req.params.studentId, { password: 0 })
//     .populate('createdBy cohort lastModifiedBy.info', 'username name')
//     .then((student) => {
//       if (!student) throw new Error('Invalid student ID');
//       response.info = student;
//       return Attendance.find({ student: req.params.studentId }).sort({ date: -1 }).populate('student word checkedInBy.user', 'word name username');
//     })
//     .then((attendance) => {
//       response.attendance = attendance;
//       return Rating.find({ student: req.params.studentId }).sort({ date: -1 }).populate('partner', 'name');
//     })
//     // rated = this student rated other students
//     .then((rated) => {
//       response.rated = rated.slice();
//       return Rating.find({ partner: req.params.studentId }).sort({ date: -1 }).populate('student', 'name');
//     })
//     // ratings = other students rated this student
//     .then((ratings) => {
//       response.ratings = ratings.slice();
//       return Pair.find({ students: req.params.studentId })
//         .sort({ date: -1 })
//         .populate('students', 'name');
//     })
//     .then((pairs) => {
//       response.pairs = pairs.slice();
//       // take out student's name from partner list
//       response.pairs.forEach((pair) => {
//         pair.students = pair.students.filter(stud => stud.name !== response.info.name);
//       });
//       // check whether student has rated their partners;
//       response.pairs.forEach((pair) => {
//         pair.students.forEach((stud) => {
//           const ratedIndex = response.rated.findIndex(rate => rate.partner.name === stud.name &&
//             rate.date === pair.date);
//           const ratingIndex = response.ratings.findIndex(rate => rate.student.name === stud.name &&
//             rate.date === pair.date);
//           stud.rating = ratingIndex === -1 ? false : response.ratings[ratingIndex];
//           stud.rated = ratedIndex === -1 ? false : response.rated[ratedIndex];
//         });
//       });
//       return setResponse(res, 200, true, { student: response });
//     })
//     .catch(err => setResponse(res, 400, false, { error: err.message }));
// });

router.get('/:studentId', (req, res) => {
  Student.findById(req.params.studentId, { password: 0 })
    .populate('createdBy cohort lastModifiedBy.info', 'username name')
    .then((student) => {
      if (!student) throw new Error('Invalid student ID');
      return setResponse(res, 200, true, { student });
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// get list of all students, or filtered by status or cohort
router.get('/', (req, res) => {
  // const query = {};
  // if (req.query.status) {
  //   query.status = req.query.status;
  // }
  Student.find({}, { password: 0 }).populate('createdBy cohort lastModifiedBy.info', 'username name').sort({ name: 1 })
    .then((students) => {
      // if (req.query.cohortName) {
      //   students = students.filter(stu => stu.cohort.name === req.query.cohortName);
      // }
      return setResponse(res, 200, true, { students });
    })
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// only admin users has access
router.use('*', (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return setResponse(res, 401, false, { error: 'Only Admin users have access' });
});

// create new student inside each cohort
router.post('/new', (req, res) => {
  if (!req.body.name || !req.body.cohortName) {
    return setResponse(res, 400, false, { error: 'Missing parameter(s)' });
  }
  if (req.body.name.length < 5 || !/^[a-z](?!.*[ '-]{2})(?!.*[.'-]{2}).*[ a-z\-'.]+[a-z]$/i.test(req.body.name)) {
    return setResponse(res, 400, false, { error: "Student name must be at least 5 characters long and contain only letters, spaces, and the following special chracters: -'." });
  }
  const newStudent = new Student({
    name: req.body.name.trim(),
    createdBy: req.user.id
  });
  return Cohort.findOne({ name: req.body.cohortName, status: 'Active' })
    .then((cohort) => {
      if (!cohort) throw new Error('Invalid active cohort name');
      newStudent.cohort = cohort.id;
      return Student.findOne({ name: req.body.name, cohort: cohort.id });
    })
    .then((student) => {
      if (student) throw new Error('Student name is not unique in this cohort');
      newStudent.lastModifiedBy = { kind: 'User', time: new Date(), info: req.user.id };
      return newStudent.save();
    })
    .then(student => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// move a student to new cohort, reset password, activate/deactivate account
router.post('/:studentId', (req, res) => {
  req.body.lastModifiedBy = { kind: 'User', time: new Date(), info: req.user.id };
  // reset password or activate/deactivate student account
  if (req.body.name || req.body.status) {
    // reseting a student's account
    if (req.body.status === 'New') {
      req.body.$unset = { password: '' };
    }
    if (req.body.name && (req.body.name.length < 5 || !/^[a-z](?!.*[ '-]{2})(?!.*[.'-]{2}).*[ a-z\-'.]+[a-z]$/i.test(req.body.name))) {
      return setResponse(res, 400, false, { error: "Student name must be at least 5 characters long and contain only letters, spaces, and the following special chracters: -'." });
    }
    return Student.findByIdAndUpdate(req.params.studentId, req.body, { new: true, runValidators: true }).populate('createdBy cohort lastModifiedBy.info', 'username name')
      .then((student) => {
        if (student) return setResponse(res, 200, true);
        throw new Error('Invalid student ID');
      })
      .catch(err => setResponse(res, 400, false, { error: err.message }));
  }
  // moving student to a new cohort
  if (req.body.newCohortName) {
    return Cohort.findOne({ name: req.body.newCohortName, status: 'Active' })
      .then((cohort) => {
        if (!cohort) throw new Error('Invalid active cohort name');
        req.body.cohort = cohort.id;
        return Student.findByIdAndUpdate(req.params.studentId, req.body, { new: true, runValidators: true }).populate('createdBy cohort lastModifiedBy.info', 'username name');
      })
      .then((student) => {
        if (student) return setResponse(res, 200, true);
        throw new Error('Invalid student ID');
      })
      .catch(err => setResponse(res, 400, false, { error: err.message }));
  }
  return setResponse(res, 400, false, { error: 'Missing parameter' });
});

// delete student
// router.delete('/:studentId', (req, res) => {
//   Student.findByIdAndRemove(req.params.studentId)
//     .then((student) => {
//       if (student) return setResponse(res, 200, true);
//       throw new Error('Invalid student ID');
//     })
//     .catch(err => setResponse(res, 400, false, { error: err.message }));
// });

export default router;
