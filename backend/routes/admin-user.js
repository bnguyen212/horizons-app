import express from 'express';
import { User } from '../models/models';
import setResponse from '../setResponse';

const router = express.Router();

// get all users in the database
router.get('/', (req, res) => {
  User.find({}, { password: 0 }).sort({ role: 1, status: 1, username: 1 }).populate('createdBy lastModifiedBy.user', 'username')
    .then(users => setResponse(res, 200, true, { users }))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// only admin users has access
router.use('*', (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return setResponse(res, 401, false, { error: 'Only Admin users have access' });
});

// create new instructor and admin
router.post('/new', (req, res) => {
  if (!req.body.username || !req.body.role) {
    return setResponse(res, 400, false, { error: 'Missing parameter(s)' });
  }
  if (req.body.username.length < 5 || !/^[a-z](?!.*[ '-]{2})(?!.*[.'-]{2}).*[ a-z\-'.]+[a-z]$/i.test(req.body.username)) {
    return setResponse(res, 400, false, { error: "Username must be at least 5 characters long and contain only letters, spaces, and the following special chracters: -'." });
  }
  const newUser = new User({
    username: req.body.username.trim(),
    role: req.body.role,
    createdBy: req.user.id,
    status: req.body.status || 'New',
    lastModifiedBy: { time: new Date(), user: req.user.id }
  });
  return newUser.save()
    .then(user => setResponse(res, 200, true))
    .catch(err => setResponse(res, 400, false, { error: err.message }));
});

// admin can reset password, update role, deactivate user accounts
router.post('/:userId', (req, res) => {
  if (req.body.username || req.body.status || req.body.role) {
    // reset a user account
    if (req.body.status === 'New') {
      req.body.$unset = { password: '' };
    }
    if (req.body.username && (req.body.username.length < 5 || !/^[a-z](?!.*[ '-]{2})(?!.*[.'-]{2}).*[ a-z\-'.]+[a-z]$/i.test(req.body.username))) {
      return setResponse(res, 400, false, { error: "Username must be at least 5 characters long and contain only letters, spaces, and the following special chracters: -'." });
    }
    req.body.lastModifiedBy = { user: req.user.id, time: new Date() };
    return User.findByIdAndUpdate(req.params.userId, req.body, { new: true, runValidators: true })
      .then((user) => {
        if (user) {
          return setResponse(res, 200, true);
        }
        throw new Error('Invalid user ID');
      })
      .catch(err => setResponse(res, 400, false, { error: err.message }));
  }
  return setResponse(res, 400, false, { error: 'Missing parameter' });
});

// delete a user
// router.delete('/:userId', (req, res) => {
//   User.findByIdAndRemove(req.params.userId)
//     .then((user) => {
//       if (user) return setResponse(res, 200, true);
//       throw new Error('Invalid user ID');
//     })
//     .catch(err => setResponse(res, 400, false, { error: err.message }));
// });

// get current user info
// router.get('/:userId', (req, res) => {
//   User.findById(req.params.userId, { password: 0 })
//     .populate('createdBy lastModifiedBy.user', 'username')
//     .then((user) => {
//       if (user) return setResponse(res, 200, true, { user });
//       return setResponse(res, 404, false, { error: 'Invalid user ID' });
//     })
//     .catch(err => setResponse(res, 400, false, { error: err.message }));
// });

export default router;
