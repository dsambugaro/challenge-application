import {
  FilterQuery,
  UpdateQuery,
  QueryFindOneAndUpdateOptions,
} from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';

import UserRepository from '../repositories/userRepository';
import User from '../models/userModel';

/**
 * User service layer
 */
class UserService {
  /**
   * Get all users
   * @param page Page starting in 0
   * @param size Size of the page
   * @param query User query
   * @return users list
   */
  async get(page: number, size: number, query: FilterQuery<User> = {}) {
    const total = await UserRepository.countDocuments(query);
    const data = await UserRepository.find(query, { __v: 0 })
      .limit(size)
      .skip(page * size);
    return {
      content: JSON.parse(JSON.stringify(data)),
      total: total,
      page: page,
      size: size,
    };
  }

  /**
   * Get an user by id
   * @param _id User id
   * @return User
   */
  async getById(_id: number) {
    const user = await UserRepository.findById(_id, { __v: 0 });
    return user?.toObject();
  }

  /**
   * Create an user
   * @param user User to be created
   * @return Created user
   */
  create(user: User) {
    return UserRepository.create(user);
  }

  /**
   * Update an user
   * @param query User query
   * @param update User fields to be updated
   * @param options Options for update
   * @returns Updates on user
   */
  update(
    query: FilterQuery<User>,
    update: UpdateQuery<User>,
    options: QueryFindOneAndUpdateOptions = { new: true },
  ) {
    return UserRepository.findOneAndUpdate(query, update, options);
  }

  /**
   * Remove an user
   * @param _id User id
   * @returns Removed user
   */
  remove(_id: number) {
    return UserRepository.findOneAndDelete({ _id });
  }

  /**
   * Get an User if password matches
   * @param username User username
   * @param password User received password
   * @return User ou undefined
   */
  async login(
    username: string,
    password: string,
  ): Promise<DocumentType<User> | null> {
    const result = await UserRepository.find(
      { $or: [{ username: username }, { email: username }] },
      { __v: 0 },
    );
    if (result.length > 0) {
      const user = new UserRepository(result[0]);
      const isValid = user.passordIsValid(password);
      return isValid ? user : null;
    }
    return null;
  }
}

export default new UserService();
