import { Router, Request, Response, NextFunction } from "express";
import { IManager } from "./manager";

abstract class BaseController {
  public path: string;
  public router: Router;

  protected manager: IManager;

  /* Required methods */
  protected abstract createRouter(): Router;

  /* Optional abstract methods */
  protected get(req: Request, res: Response, next?: NextFunction): Promise<void> | void {}
  protected post(req: Request, res: Response, next?: NextFunction): Promise<void> | void {}
  protected patch(req: Request, res: Response, next?: NextFunction): Promise<void> | void {}
  protected delete(req: Request, res: Response, next?: NextFunction): Promise<void> | void {}
}

export default BaseController;
