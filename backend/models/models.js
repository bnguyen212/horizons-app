import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema } = mongoose;

export const hashPassword = (password) => {
  const hash = crypto.createHash('sha256');
  hash.update(password + process.env.HASHKEY);
  return hash.digest('hex');
};

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: [5, "Username must be at least 5 characters long and contain only letters, spaces, and the following special chracters: -'."]
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ['Instructor', 'Admin'],
    required: true
  },
  status: {
    type: String,
    default: 'New',
    enum: ['New', 'Active', 'Inactive'],
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    time: Date,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
});

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [5, "Username must be at least 5 characters long and contain only letters, spaces, and the following special chracters: -'."]
  },
  password: {
    type: String
  },
  cohort: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Cohort'
  },
  role: {
    type: String,
    default: 'Student',
    enum: ['Student'],
    required: true
  },
  status: {
    type: String,
    default: 'New',
    enum: ['New', 'Active', 'Inactive'],
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  lastModifiedBy: {
    kind: String,
    time: Date,
    info: {
      type: Schema.Types.ObjectId,
      refPath: 'lastModifiedBy.kind'
    }
  }
});

const pairSchema = new Schema({
  students: {
    type: [{
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Student'
    }],
    required: true
  },
  date: {
    type: String,
    required: true
  },
  cohort: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Cohort'
  },
  table: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  lastModifiedBy: {
    time: Date,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
});

const ratingSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Student'
  },
  partner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Student'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  date: {
    type: String,
    required: true
  },
  createdOn: {
    type: Date,
    required: true
  }
});

const wordSchema = new Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  date: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  lastModifiedBy: {
    time: Date,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
});

const attendanceSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Student'
  },
  word: {
    type: Schema.Types.ObjectId,
    ref: 'Word',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  checkedInBy: {
    time: Date,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
});

const cohortSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    time: {
      type: Date,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  archivedBy: {
    time: Date,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
});

const tableSchema = new Schema({
  table: {
    type: String,
    unique: true,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    time: Date,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
});

export const Table = mongoose.model('Table', tableSchema);
export const Cohort = mongoose.model('Cohort', cohortSchema);
export const User = mongoose.model('User', userSchema);
export const Student = mongoose.model('Student', studentSchema);
export const Pair = mongoose.model('Pair', pairSchema);
export const Rating = mongoose.model('Rating', ratingSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const Word = mongoose.model('Word', wordSchema);
