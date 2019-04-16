import express from 'express';
import userRoute from './admin-user';
import studentRoute from './admin-student';
import cohortRoute from './admin-cohort';
import attendanceRoute from './admin-attendance';
import wordRoute from './admin-word';
import pairRoute from './admin-pair';
import ratingRoute from './admin-rating';
import tableRoute from './admin-table';
import { hashPassword, User } from '../../models/models';
import setResponse from '../../util/setResponse';

const router = express.Router();

export default (passport) => {
  // instructor/admin register
  router.post('/register', (req, res) => {
    if (!req.body.username || !req.body.password) {
      return setResponse(res, 400, false, { error: 'Missing parameter(s)' });
    }
    if (req.body.password.length < 8 || !/^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/.test(req.body.password)) {
      return setResponse(res, 400, false, { error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long' });
    }
    return User.findOne({ username: req.body.username, status: 'New' })
      .then((user) => {
        if (!user) throw new Error('No user found. Please contact an Admin to have your account pre-registered.');
        user.password = hashPassword(req.body.password);
        user.status = 'Active';
        user.lastModifiedBy = { time: new Date(), user: user.id };
        return user.save();
      })
      .then(user => setResponse(res, 200, true, { userId: user.id }))
      .catch(err => setResponse(res, 400, false, { error: err.message }));
  });

  // instructor/admin log in
  router.post('/login', (req, res) => {
    passport.authenticate('local-admin', (err, user, info) => {
      if (err) return setResponse(res, 400, false, { error: err.message });
      // wrong username and/or password
      if (!user) return setResponse(res, 401, false, { error: 'Invalid credentials' });
      // establishing session
      return req.logIn(user, (error) => {
        if (error) return setResponse(res, 400, false, { error: error.message });
        return setResponse(res, 200, true, { userId: user.id });
      });
    })(req, res);
  });

  // only users with permissions can access beyond this point
  router.use('*', (req, res, next) => {
    if (req.user && (req.user.role === 'Instructor' || req.user.role === 'Admin') && req.user.status === 'Active') {
      return next();
    }
    return setResponse(res, 401, false, { error: 'No permission' });
  });

  // allow instructors and admin to update password
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
    return User.findByIdAndUpdate(req.user.id,
      {
        password: hashPassword(req.body.newPassword),
        lastModifiedBy: { time: new Date(), user: req.user.id }
      },
      { new: true, runValidators: true })
      .then((user) => {
        if (user.password === hashPassword(req.body.newPassword)) {
          return setResponse(res, 200, true);
        }
        throw new Error('Failed to update password, please try again later');
      })
      .catch(err => setResponse(res, 400, false, { error: err.message }));
  });

  router.use('/user', userRoute);

  router.use('/cohort', cohortRoute);

  router.use('/attendance', attendanceRoute);

  router.use('/word', wordRoute);

  router.use('/student', studentRoute);

  router.use('/pair', pairRoute);

  router.use('/rating', ratingRoute);

  router.use('/table', tableRoute);

  return router;
};
