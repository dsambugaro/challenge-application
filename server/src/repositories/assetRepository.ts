import { buildSchema, addModelToTypegoose } from '@typegoose/typegoose';
import mongoose from 'mongoose';

import Asset from '../models/assetModel';

const AssetSchema = buildSchema(Asset);
AssetSchema.set('toObject', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.imageBuffer;
    delete ret.imageType;
    delete ret._id;
  },
});
AssetSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.imageBuffer;
    delete ret.imageType;
    delete ret._id;
  },
});
export default addModelToTypegoose(mongoose.model('Asset', AssetSchema), Asset);
