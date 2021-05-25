import { buildSchema, addModelToTypegoose } from '@typegoose/typegoose';
import mongoose from 'mongoose';

import Company from '../models/companyModel';

const CompanySchema = buildSchema(Company);
CompanySchema.set('toObject', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
CompanySchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
export default addModelToTypegoose(
  mongoose.model('Company', CompanySchema),
  Company,
);
