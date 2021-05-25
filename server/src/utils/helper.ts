import mongoose from 'mongoose';
import HttpStatus from 'http-status';
import { Response } from 'express';

/**
 * Helper for utility methods
 */
class Helper {
  /**
   * Generic method for send responses to client
   * @param res Response object from express
   * @param statusCode Response status
   * @param data Response data
   * @return void
   */
  static sendResponse = (
    res: Response,
    statusCode: number,
    data:
      | mongoose.Document
      | mongoose.Document[]
      | string
      | null
      | Record<string, unknown>,
  ): void => {
    res.status(statusCode).json(data ? data : {});
  };

  /**
   * Get appropriate http response for given mongoose error
   * @param error mongoose.Error instance
   * @return appropriate error
   */
  static getErrorResponse = (error: Error): number => {
    return error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError ||
      error.message.indexOf('duplicate key error') >= 0 ||
      error.message.indexOf('it must be an positive integer') >= 0
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;
  };

  /**
   * Parse number from query
   * @param field Field name from query
   * @param value Value from field query
   * @param defaultValue Value to be returned in case value are undefined or null
   * @return number parsed page
   */
  static parseNumber = (
    field: string,
    value: string,
    defaultValue = -1,
  ): number => {
    let parsedValue = defaultValue;
    if (value) {
      parsedValue = parseInt(value);
    }
    if (parsedValue === NaN || parsedValue < 0) {
      throw new Error(
        `${field} ${value} is invalid, it must be an positive integer`,
      );
    }
    return parsedValue;
  };
}

export default Helper;
