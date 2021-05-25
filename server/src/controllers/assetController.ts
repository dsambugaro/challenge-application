import { Request, Response } from 'express';
import HttpStatus from 'http-status';

import { Role } from '../models/userModel';
import AssetService from '../services/assetService';
import Helper from '../utils/helper';

/**
 * Asset controller layer
 */
class AssetController {
  /**
   * Get all assets
   * @param req Request object from express
   * @param res Response object from express
   * @return void
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
      if (req.currentUser && req.currentUser.role === Role.EMPLOYEE) {
        query['user'] = req.currentUser.id;
      }
      if (req.query.unit) {
        query['unit'] = Helper.parseNumber('unit', req.query.unit as string);
      }
      const assets = await AssetService.get(page, size, query);
      return Helper.sendResponse(res, HttpStatus.OK, assets);
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
   * Get a Asset by id
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async getById(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    try {
      const asset = await AssetService.getById(_id);
      return Helper.sendResponse(res, HttpStatus.OK, asset?.toObject());
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
   * Create a Asset
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async create(req: Request, res: Response) {
    const newAsset = req.body;
    try {
      await AssetService.create(newAsset);
      return Helper.sendResponse(res, HttpStatus.CREATED, 'asset created');
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
   * Update a Asset
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async update(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    const newAsset = req.body;
    try {
      const asset = await AssetService.update({ _id }, newAsset);
      return Helper.sendResponse(res, HttpStatus.OK, asset);
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
   * Remove a Asset
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async remove(req: Request, res: Response) {
    const _id = parseInt(req.params.id);
    try {
      const asset = await AssetService.remove(_id);
      return Helper.sendResponse(res, HttpStatus.OK, asset);
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
   * Filter assets with a mondodb filter passed on body
   * @param req Request object from express
   * @param res Response object from express
   * @return void
   */
  async filter(req: Request, res: Response) {
    try {
      const page = Helper.parseNumber('page', req.query.page as string, 0);
      const size = Helper.parseNumber('size', req.query.size as string, 10);
      const assets = await AssetService.get(page, size, { ...req.body });
      return Helper.sendResponse(res, HttpStatus.OK, assets);
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

export default new AssetController();
