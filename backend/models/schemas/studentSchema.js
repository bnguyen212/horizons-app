import { Schema } from 'mongoose';

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

export default studentSchema;