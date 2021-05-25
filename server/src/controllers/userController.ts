import { Request, Response } from 'express';
import HttpStatus from 'http-status';
import bcrypt from 'bcryptjs';

import UserService from '../services/userService';
import auth from '../utils/auth';
import Helper from '../utils/helper';

/**
 * User controller layer
 */
class UserController {
  /**
   * Get all users
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async get(req: Request, res: Response) {
    try {
      const page = Helper.parseNumber('page', req.query.page as string, 0);
      const size = Helper.parseNumber('size', req.query.size as string, 10);
      const users = await UserService.get(page, size);
      return Helper.sendResponse(res, HttpStatus.OK, users);
    } catch (error) {
      const errorMessage = `[ERROR] ${error}`;
      console.error(errorMessage);
      Helper.sendResponse(res, Helper.getErrorResponse(error), errorMessage);
    }
  }

  /**
   * Get a User by id
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async getById(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    try {
      const user = await UserService.getById(_id);
      return Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      const errorMessage = `[ERROR] ${error}`;
      console.error(errorMessage);
      Helper.sendResponse(res, Helper.getErrorResponse(error), errorMessage);
    }
  }

  /**
   * Create a User
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async create(req: Request, res: Response) {
    const newUser = req.body;
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;
      await UserService.create(newUser);
      return Helper.sendResponse(res, HttpStatus.CREATED, 'user created');
    } catch (error) {
      const errorMessage = `[ERROR] ${error}`;
      console.error(errorMessage);
      Helper.sendResponse(res, Helper.getErrorResponse(error), errorMessage);
    }
  }

  /**
   * Update a User
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async update(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    const userToUpdate = req.body;
    if (!userToUpdate.password) {
      try {
        const user = await UserService.update({ _id }, userToUpdate);
        return Helper.sendResponse(res, HttpStatus.OK, user);
      } catch (error) {
        const errorMessage = `[ERROR] ${error}`;
        console.error(errorMessage);
        Helper.sendResponse(res, Helper.getErrorResponse(error), errorMessage);
      }
    } else {
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(userToUpdate.password as string, salt);
        userToUpdate.password = hash;
        const user = await UserService.update({ _id }, userToUpdate);
        return Helper.sendResponse(res, HttpStatus.OK, user);
      } catch (error) {
        const errorMessage = `[ERROR] ${error}`;
        console.error(errorMessage);
        return Helper.sendResponse(
          res,
          Helper.getErrorResponse(error),
          errorMessage,
        );
      }
    }
  }

  /**
   * Remove a User
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async remove(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    try {
      const user = await UserService.remove(_id);
      return Helper.sendResponse(res, HttpStatus.OK, user);
    } catch (error) {
      const errorMessage = `[ERROR] ${error}`;
      console.error(errorMessage);
      Helper.sendResponse(res, Helper.getErrorResponse(error), errorMessage);
    }
  }

  /**
   * Filter users with a mondodb filter passed on body
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async filter(req: Request, res: Response) {
    try {
      const page = Helper.parseNumber('page', req.query.page as string, 0);
      const size = Helper.parseNumber('size', req.query.size as string, 10);
      const users = await UserService.get(page, size, { ...req.body });
      return Helper.sendResponse(res, HttpStatus.OK, users);
    } catch (error) {
      const errorMessage = `[ERROR] ${error}`;
      console.error(errorMessage);
      Helper.sendResponse(res, Helper.getErrorResponse(error), errorMessage);
    }
  }

  /**
   * User login
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async login(req: Request, res: Response) {
    const username = req.body.username as string;
    const password = req.body.password as string;
    try {
      const user = await UserService.login(username, password);
      if (user) {
        const token = auth.createToken(
          user._id,
          user.name,
          user.role,
          user.company as number,
        );
        const userObject = user.toObject();
        delete userObject.id;
        Helper.sendResponse(res, HttpStatus.OK, { ...userObject, token });
      } else {
        Helper.sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          'username or password incorrect',
        );
      }
    } catch (error) {
      const errorMessage = `[Error] ${error}`;
      console.error(errorMessage);
      Helper.sendResponse(res, Helper.getErrorResponse(error), errorMessage);
    }
  }
}

export default new UserController();
