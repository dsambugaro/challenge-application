import { prop, plugin, Ref, DocumentType } from '@typegoose/typegoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import bcrypt from 'bcryptjs';

import Company from './companyModel';

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

/**
 * User representation
 */
@plugin(AutoIncrementID, { startAt: 1 })
class User {
  /**
   * User ID - autoincremented
   * @type number
   */
  @prop({ type: Number })
  _id!: number;

  /**
   * User name
   * @type string
   */
  @prop({ type: String, required: true })
  name!: string;

  /**
   * User e-mail
   * @type string
   */
  @prop({ type: String, required: true, unique: true, index: true })
  public email!: string;

  /**
   * User role
   * @type Role
   */
  @prop({ type: String, enum: Role, required: true })
  role!: Role;

  /**
   * User username
   * @type string
   */
  @prop({ type: String, required: true, unique: true, index: true })
  username!: string;

  /**
   * User password
   * @type string
   */
  @prop({ type: String, required: true })
  password!: string;

  /**
   * Company to which the User belongs
   * @type Company
   */
  @prop({ type: Number, ref: 'Company' })
  company?: Ref<Company>;

  /**
   * Compare a received password with stored password
   * @param this typegoose this, must be ignored on this method calls
   * @param receivedPassword Password to compare
   * @return true if the password matches, false otherwise
   */
  public passordIsValid(
    this: DocumentType<User>,
    receivedPassword: string,
  ): boolean {
    return bcrypt.compareSync(receivedPassword, this.password);
  }
}

export default User;
