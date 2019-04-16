import mongoose from 'mongoose';
import crypto from 'crypto';
import userSchema from './schemas/userSchema';
import studentSchema from './schemas/studentSchema';
import cohortSchema from './schemas/cohortSchema';
import attendanceSchema from './schemas/attendanceSchema';
import wordSchema from './schemas/wordSchema';
import pairSchema from './schemas/pairSchema';
import ratingSchema from './schemas/ratingSchema';
import tableSchema from './schemas/tableSchema';

export const hashPassword = (password) => {
  const hash = crypto.createHash('sha256');
  hash.update(password + process.env.HASHKEY);
  return hash.digest('hex');
};

export const User = mongoose.model('User', userSchema);
export const Student = mongoose.model('Student', studentSchema);
export const Cohort = mongoose.model('Cohort', cohortSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const Word = mongoose.model('Word', wordSchema);
export const Pair = mongoose.model('Pair', pairSchema);
export const Rating = mongoose.model('Rating', ratingSchema);
export const Table = mongoose.model('Table', tableSchema);
