import { Schema } from 'mongoose';

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

export default attendanceSchema;