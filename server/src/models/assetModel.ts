import { plugin, prop, Ref, modelOptions } from '@typegoose/typegoose';
import { AutoIncrementID } from '@typegoose/auto-increment';

import Company from './companyModel';
import Unit from './unitModel';
import User from './userModel';

export enum Status {
  IN_DOWNTIME = 'inDowntime',
  IN_OPERATION = 'inOperation',
  IN_ALERT = 'inAlert',
}

/**
 * Asset representation
 */
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@plugin(AutoIncrementID, { startAt: 1 })
class Asset {
  /**
   * Asset ID - autoincremented
   * @type number
   */
  @prop({ type: Number })
  _id!: number;

  /**
   * Asset name
   * @type string
   */
  @prop({ type: String, required: true })
  name!: string;

  /**
   * Asset health score, between 0 and 100
   * @type number
   */
  @prop({
    type: Number,
    min: 0,
    max: 100,
    required: true,
  })
  healthscore!: number;

  /**
   * Asset status
   * @type Status
   */
  @prop({ type: String, enum: Status, required: true })
  status!: Status;

  /**
   * Asset serial number
   * @type string
   */
  @prop({ type: String, unique: true })
  serialnumber?: string;

  /**
   * Asset image
   * @type Buffer
   */
  @prop({
    type: Buffer,
    get: data => (data ? data.toString('base64') : undefined),
    set: (data: string) => Buffer.from(data, 'base64'),
  })
  imageBuffer?: Buffer;

  /**
   * Asset image type
   * @type string
   */
  @prop({ type: String })
  imageType?: string;

  /**
   * Asset description
   * @type string
   */
  @prop({ type: String })
  description?: string;

  /**
   * Asset responsible
   * @type User
   */
  @prop({ type: Number, ref: 'User', required: true })
  user!: Ref<User>;

  /**
   * Unit to which the Asset belongs
   * @type Unit
   */
  @prop({ type: Number, ref: 'Unit', required: true })
  unit!: Ref<Unit>;

  /**
   * Company to which the Unit belongs
   * @type Company
   */
  @prop({
    type: Number,
    ref: 'Company',
    required: true,
  })
  company!: Ref<Company>;

  /**
   * Get a base64 image
   * @return Base64 image
   */
  public get image(): string {
    return this.imageType
      ? `${this.imageType},${this.imageBuffer?.toString('base64')}`
      : '';
  }

  /**
   * Set a base64 image
   * @param image base64 representation of image
   */
  public set image(image: string) {
    const splited = image.split(',');
    this.imageType = splited.length ? splited[0] : undefined;
    this.imageBuffer = splited.length
      ? Buffer.from(splited[1], 'base64')
      : undefined;
  }
}

export default Asset;
