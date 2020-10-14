import { Request, Response, NextFunction } from "express";

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;
export type ErrorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => void;
