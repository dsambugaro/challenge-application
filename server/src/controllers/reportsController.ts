import { Request, Response } from 'express';
import HttpStatus from 'http-status';

import { Role } from '../models/userModel';
import ReportsService from '../services/reportsService';
import Helper from '../utils/helper';

/**
 * Asset controller layer
 */
class ReportsController {
  /**
   * Get reports from all companies
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async getAvgHealth(req: Request, res: Response) {
    try {
      const groupField = {};
      const idProjection = {};
      if (req.query.groupField && Array.isArray(req.query.groupField)) {
        const groupFieldArray = req.query.groupField as string[];
        groupFieldArray.forEach((field: string) => {
          groupField[field] = `$${field}`;
          idProjection[field] = `$_id.${field}`;
        });
      }
      const query = {};
      if (req.currentUser && req.currentUser.company) {
        query['company'] = req.currentUser.company;
      } else if (req.query.company) {
        query['company'] = Helper.parseNumber(
          'company',
          req.query.company as string,
        );
      }
      if (req.currentUser && req.currentUser.role === Role.EMPLOYEE) {
        query['user'] = req.currentUser.id;
      }
      if (req.query.unit) {
        query['unit'] = Helper.parseNumber('unit', req.query.unit as string);
      }
      if (req.query.user) {
        query['user'] = Helper.parseNumber('user', req.query.user as string);
      }
      const reports = await ReportsService.getAvgHealth(
        groupField,
        idProjection,
        query,
      );
      return Helper.sendResponse(res, HttpStatus.OK, reports);
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

export default new ReportsController();
