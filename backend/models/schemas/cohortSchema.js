import { Schema } from 'mongoose';

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

export default cohortSchema;