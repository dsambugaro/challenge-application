import { prop, plugin, Ref } from '@typegoose/typegoose';
import { AutoIncrementID } from '@typegoose/auto-increment';

import Company from './companyModel';

/**
 * Unit representation
 */
@plugin(AutoIncrementID, { startAt: 1 })
class Unit {
  /**
   * Unit ID - autoincremented
   * @type number
   */
  @prop({ type: Number })
  _id!: number;

  /**
   * Unit name
   * @type string
   */
  @prop({ type: String, required: true })
  name!: string;

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
}

export default Unit;
