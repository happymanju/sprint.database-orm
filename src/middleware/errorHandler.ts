import { Request, Response, NextFunction } from "express";
import { ErrorHandlingMiddleware } from "./types";

/**
 * This error handler wraps uncaught exception nicely, and
 * returns HTTP 400 Bad Request if the error is JSON serializable
 * else returns HTTP 500 Internal Server Error
 *
 * Ref:
 * - https://expressjs.com/en/guide/error-handling.html
 */
const errorHandler: ErrorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    return next(err);
  }

  try {
    console.debug(`${req.path} an error caught: ${err}`);
    res.status(400).json({ error: err });
  } catch (error) {
    console.error(`${req.path} an uncaught error: ${error}`);
    res.status(500).send(error);
  }
};

export default errorHandler;
