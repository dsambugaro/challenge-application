import { buildSchema, addModelToTypegoose } from '@typegoose/typegoose';
import mongoose from 'mongoose';

import Unit from '../models/unitModel';

const UnitSchema = buildSchema(Unit);
UnitSchema.set('toObject', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
UnitSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
export default addModelToTypegoose(mongoose.model('Unit', UnitSchema), Unit);
