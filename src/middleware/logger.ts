import { Request, Response, NextFunction } from "express";
import { Middleware } from "./types";

const loggerMiddleware: Middleware = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`Request: ${req.method} ${req.path}`);
  next();
};

export default loggerMiddleware;
