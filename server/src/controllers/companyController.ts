import { Request, Response } from 'express';
import HttpStatus from 'http-status';

import CompanyService from '../services/companyService';
import Helper from '../utils/helper';

/**
 * Company controller layer
 */
class CompanyController {
  /**
   * Get all companies
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async get(req: Request, res: Response) {
    try {
      const page = Helper.parseNumber('page', req.query.page as string, 0);
      const size = Helper.parseNumber('size', req.query.size as string, 10);
      const query = {};
      if (req.currentUser && req.currentUser.company) {
        query['_id'] = req.currentUser.company;
      } else if (req.query.company) {
        query['_id'] = Helper.parseNumber(
          'company',
          req.query.company as string,
        );
      }
      const companies = await CompanyService.get(page, size, query);
      return Helper.sendResponse(res, HttpStatus.OK, companies);
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

  /**
   * Get a Company by id
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async getById(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    try {
      const company = await CompanyService.getById(_id);
      return Helper.sendResponse(res, HttpStatus.OK, company);
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

  /**
   * Create a Company
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async create(req: Request, res: Response) {
    const newCompany = req.body;
    try {
      await CompanyService.create(newCompany);
      return Helper.sendResponse(res, HttpStatus.CREATED, 'company created');
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

  /**
   * Update a Company
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async update(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    const newCompany = req.body;

    try {
      const company = await CompanyService.update({ _id }, newCompany);
      return Helper.sendResponse(res, HttpStatus.OK, company);
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

  /**
   * Remove a Company
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async remove(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    try {
      const company = await CompanyService.remove(_id);
      return Helper.sendResponse(res, HttpStatus.OK, company);
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

  /**
   * Filter companies with a mondodb filter passed on body
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async filter(req: Request, res: Response) {
    try {
      const page = Helper.parseNumber('page', req.query.page as string, 0);
      const size = Helper.parseNumber('size', req.query.size as string, 10);
      const companies = await CompanyService.get(page, size, { ...req.body });
      return Helper.sendResponse(res, HttpStatus.OK, companies);
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

export default new CompanyController();
