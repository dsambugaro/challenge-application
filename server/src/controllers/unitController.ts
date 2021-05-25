import { Request, Response } from 'express';
import HttpStatus from 'http-status';

import UnitService from '../services/unitService';
import Helper from '../utils/helper';

/**
 * Unit controller layer
 */
class UnitController {
  /**
   * Get all units
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
        query['company'] = req.currentUser.company;
      } else if (req.query.company) {
        query['company'] = Helper.parseNumber(
          'company',
          req.query.company as string,
        );
      }
      const units = await UnitService.get(page, size, query);
      return Helper.sendResponse(res, HttpStatus.OK, units);
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
   * Get a Unit by id
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async getById(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    try {
      const Unit = await UnitService.getById(_id);
      if (
        req.currentUser.company &&
        req.currentUser.company !== Unit?.company
      ) {
        return Helper.sendResponse(res, HttpStatus.OK, {});
      } else {
        return Helper.sendResponse(res, HttpStatus.OK, Unit);
      }
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
   * Create a Unit
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async create(req: Request, res: Response) {
    const newUnit = req.body;
    try {
      await UnitService.create(newUnit);
      return Helper.sendResponse(res, HttpStatus.CREATED, 'unit created');
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
   * Update a Unit
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async update(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    const newUnit = req.body;
    try {
      const Unit = await UnitService.update({ _id }, newUnit);
      return Helper.sendResponse(res, HttpStatus.OK, Unit);
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
   * Remove a Unit
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async remove(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    try {
      const Unit = await UnitService.remove(_id);
      return Helper.sendResponse(res, HttpStatus.OK, Unit);
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
   * Filter units with a mondodb filter passed on body
   * @param req Request object from express
   * @param res Response object from express
   * @return Promise
   */
  async filter(req: Request, res: Response) {
    try {
      const page = Helper.parseNumber('page', req.query.page as string, 0);
      const size = Helper.parseNumber('size', req.query.size as string, 10);
      const units = await UnitService.get(page, size, { ...req.body });
      return Helper.sendResponse(res, HttpStatus.OK, units);
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

export default new UnitController();
