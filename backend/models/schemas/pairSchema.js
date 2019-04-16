import { Schema } from 'mongoose';

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

export default pairSchema;