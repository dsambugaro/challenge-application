import { buildSchema, addModelToTypegoose } from '@typegoose/typegoose';
import mongoose from 'mongoose';

import User from '../models/userModel';

const UserSchema = buildSchema(User);
UserSchema.set('toObject', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.password;
    delete ret._id;
  },
});
UserSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.password;
    delete ret._id;
  },
});
export default addModelToTypegoose(mongoose.model('User', UserSchema), User);
