import { prop, plugin } from '@typegoose/typegoose';
import { AutoIncrementID } from '@typegoose/auto-increment';

/**
 * Company representation
 */
@plugin(AutoIncrementID, { startAt: 1 })
class Company {
  /**
   * Company ID - autoincremented
   * @type number
   */
  @prop({ type: Number })
  _id!: number;

  /**
   * Company CNPJ
   * @type string
   */
  @prop({ type: String, required: true, unique: true, index: true })
  public cnpj!: string;

  /**
   * Company name
   * @type string
   */
  @prop({ type: String, required: true })
  name!: string;

  /**
   * Company description
   * @type string
   */
  @prop({ type: String })
  description?: string;

  /**
   * Whether this company is active or not
   * @type boolean
   */
  @prop({ type: Boolean, required: true })
  active!: boolean;
}

export default Company;
