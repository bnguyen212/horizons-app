import { Schema } from 'mongoose';

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


export default wordSchema;