import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import logger from 'morgan';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User, Student, hashPassword } from './backend/models/models';
import studentRoute from './backend/routes/student';
import adminRoute from './backend/routes/admin';

const app = express();
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('connected', () => {
  console.log('Success: connected to MongoDb!');
});

app.use(express.static(path.join(__dirname, 'build')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const MongoStore = connectMongo(session);
app.use(session({
  secret: process.env.SESSION,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  // proxy: true,
  resave: true,
  saveUninitialized: false,
  name: 'Horizons-Match',
  // cookie: { maxAge: 2 * 60 * 60 * 1000 },
  // rolling: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use('local-admin', new LocalStrategy((username, password, done) => {
  User.findOne({ username, status: 'Active' }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { error: 'Username does not exist' });
    if (user.password !== hashPassword(password)) return done(null, false, { error: 'Password is incorrect' });
    return done(null, user);
  });
}));

passport.use('local-student', new LocalStrategy({ usernameField: 'name', passwordField: 'password' }, (name, password, done) => {
  Student.findOne({ name, status: 'Active' }, (err, student) => {
    if (err) return done(err);
    if (!student) return done(null, false, { error: 'Student does not exist' });
    if (student.password !== hashPassword(password)) return done(null, false, { error: 'Password is incorrect' });
    return done(null, student);
  });
}));

passport.serializeUser((user, done) => {
  const key = { role: user.role, id: user.id };
  done(null, key);
});

passport.deserializeUser((key, done) => {
  if (key.role === 'Student') {
    Student.findOne({ _id: key.id, status: 'Active' }, (err, user) => done(err, user));
  } else {
    User.findOne({ _id: key.id, status: 'Active' }, (err, user) => done(err, user));
  }
});

app.use('/admin', adminRoute(passport));
app.use('/student', studentRoute(passport));

app.get('/session', (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user.role });
  } else {
    res.status(401).json({ success: false });
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.status(200).json({ success: true, message: 'Goodbye!' });
});

// DO NOT REMOVE THIS LINE :)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, error: err.message });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, error: err.message });
});

console.log('Express started. Listening on port', process.env.PORT || 1337);
app.listen(process.env.PORT || 1337);
