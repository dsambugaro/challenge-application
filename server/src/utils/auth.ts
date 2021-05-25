import jwt from 'jsonwebtoken';
import HttpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';

import Helper from '../utils/helper';

/**
 * Class for authentication control
 */
class Auth {
  /**
   * Auth token validator
   * @param req Request object from express
   * @param res Response object from express
   * @param next Next function
   * @return void
   */
  validate(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-access-token'] as string;

    if (token) {
      jwt.verify(token, process.env.SECRET_KEY as string, (error, decoded) => {
        if (error) {
          return Helper.sendResponse(
            res,
            HttpStatus.FORBIDDEN,
            'Invalid token',
          );
        } else if (decoded) {
          req.currentUser = {
            id: decoded['sub'],
            role: decoded['role'],
            company: decoded['company'],
          };
          next();
        }
      });
    } else {
      return Helper.sendResponse(
        res,
        HttpStatus.UNAUTHORIZED,
        'Token must be provided',
      );
    }
  }

  /**
   * Create an auth token
   * @param id User id
   * @param name User name
   * @param role User role
   * @param company User company
   * @return created token
   */
  createToken(
    id: number,
    name: string,
    role: string,
    company: number | undefined,
  ): string {
    const payload = {
      iss: 'challenge server',
      name: name,
      sub: id,
      role: role,
      company: company,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY as string, {
      expiresIn: '12h',
    });
    return token;
  }
}

export default new Auth();
