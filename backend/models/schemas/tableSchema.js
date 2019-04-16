import { Schema } from 'mongoose';

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

export default tableSchema;