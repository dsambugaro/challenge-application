import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

import Config from './config';
import DataBase from './utils/database';
import Auth from './utils/auth';
import CompanyController from './controllers/companyController';
import UnitController from './controllers/unitController';
import UserController from './controllers/userController';
import AssetController from './controllers/assetController';
import ReportsController from './controllers/reportsController';

/**
 * Controller pseudo-enum
 */
class Controller {
  static readonly COMPANY = CompanyController;
  static readonly UNIT = UnitController;
  static readonly USER = UserController;
  static readonly ASSET = AssetController;

  /**
   * Get controller from given match value
   * @param value Value to get a controller of
   * @return Controller or undefined
   */
  static valueof(value: string) {
    switch (value) {
      case 'companies' || 'company':
        return Controller.COMPANY;
      case 'units' || 'unit':
        return Controller.UNIT;
      case 'users' || 'user':
        return Controller.USER;
      case 'assets' || 'asset':
        return Controller.ASSET;
      default:
        return undefined;
    }
  }
}

/**
 * Server
 */
class Server {
  public app: express.Application;
  public routes = ['companies', 'units', 'users', 'assets'];
  private _db = DataBase;
  private _routeBase = '/api/v1';

  /**
   * Create a Server
   */
  constructor() {
    dotenv.config();
    this.app = express();
    this._db.createConnection();
    this.enableCors();
    this.middler();
    this.createRoutes();
  }

  /**
   * Setup server cors
   * @return void
   */
  enableCors(): void {
    const options: cors.CorsOptions = Config.corsOptions;
    this.app.use(cors(options));
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
      next();
    });
  }

  /**
   * Setup server middleware
   * @return void
   */
  middler(): void {
    this.app.use(express.json({ limit: '6mb' }));
    this.app.use(express.urlencoded({ extended: false }));
  }

  /**
   * Setup server routes
   * @return void
   */
  createRoutes(): void {
    // open routes
    this.app.route('/api').get((req, res) => res.send('chalenge server 0.1.0'));
    this.app.route('/login').post(Controller.USER.login);

    // protected routes
    this.app.use(Auth.validate);
    this.app
      .route(`${this._routeBase}/reports`)
      .get(ReportsController.getAvgHealth);
    this.routes.forEach(route => {
      const controller = Controller.valueof(route);
      if (controller) {
        this.app.route(`${this._routeBase}/${route}`).get(controller.get);
        this.app
          .route(`${this._routeBase}/${route}/filter`)
          .post(controller.filter);
        this.app
          .route(`${this._routeBase}/${route}/:id`)
          .get(controller.getById);
        this.app.route(`${this._routeBase}/${route}`).put(controller.create);
        this.app
          .route(`${this._routeBase}/${route}/:id`)
          .post(controller.update);
        this.app
          .route(`${this._routeBase}/${route}/:id`)
          .delete(controller.remove);
      }
    });
  }
}

export default Server;
