import express from 'express';
import setResponse from '../setResponse';
import { Student, hashPassword } from '../models/models';
import attendanceRoute from './student-attendance';
import ratingRoute from './student-rating';
import pairRoute from './student-pair';

const router = express.Router();

export default (passport) => {
  router.post('/register', (req, res) => {
    if (!req.body.name || !req.body.password) {
      return setResponse(res, 400, false, { error: 'Missing parameter(s)' });
    }
    if (req.body.password.length < 8 || !/^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/.test(req.body.password)) {
      return setResponse(res, 400, false, { error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long' });
    }
    return Student.findOne({ name: req.body.name, status: 'New' })
      .then((student) => {
        if (!student) {
          throw new Error('No account found. Please contact an Instructor to have your account pre-registered.');
        }
        student.password = hashPassword(req.body.password);
        student.status = 'Active';
        student.lastModifiedBy = { kind: 'Student', time: new Date(), info: student.id };
        return student.save();
      })
      .then(student => setResponse(res, 200, true, { studenId: student.id }))
      .catch(err => setResponse(res, 400, false, { error: err.message }));
  });

  router.post('/login', (req, res) => {
    passport.authenticate('local-student', (err, student, info) => {
      if (err) return setResponse(res, 400, false, { error: err.message });
      // wrong name and/or password
      if (!student) return setResponse(res, 401, false, { error: 'Invalid credentials' });
      // establishing session
      return req.logIn(student, (error) => {
        if (err) return setResponse(res, 400, false, { error: error.message });
        return setResponse(res, 200, true, { studentId: student.id });
      });
    })(req, res);
  });

  router.use('*', (req, res, next) => {
    if (req.user && req.user.role === 'Student' && req.user.status === 'Active') {
      return next();
    }
    return setResponse(res, 401, false, { error: 'No permission' });
  });

  // allow students to update password
  router.post('/update', (req, res) => {
    if (req.user.password !== hashPassword(req.body.currentPassword)) {
      return setResponse(res, 400, false, { error: 'Wrong password' });
    }
    if (!req.body.newPassword) {
      return setResponse(res, 400, false, { error: 'New password cannot be empty' });
    }
    if (req.body.newPassword.length < 8 || !/^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/.test(req.body.newPassword)) {
      return setResponse(res, 400, false, { error: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long' });
    }
    return Student.findByIdAndUpdate(req.user.id, { password: hashPassword(req.body.newPassword), lastModifiedBy: { kind: 'Student', time: new Date(), info: req.user.id } }, { new: true, runValidators: true })
      .then((student) => {
        if (student.password === hashPassword(req.body.newPassword)) {
          return setResponse(res, 200, true);
        }
        throw new Error('Failed to update password, please try again later');
      })
      .catch(err => setResponse(res, 400, false, { error: err.message }));
  });

  router.use('/attendance', attendanceRoute);

  router.use('/rating', ratingRoute);

  router.use('/pair', pairRoute);

  return router;
};
