import { Schema } from 'mongoose';

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

export default userSchema;