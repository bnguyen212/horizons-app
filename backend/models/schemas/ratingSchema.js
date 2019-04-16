import { Schema } from 'mongoose';

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

export default ratingSchema;