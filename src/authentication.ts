import { Request, Response, NextFunction } from "express";

export function guarded(func) {
  return async function (req: Request, res: Response, next?: NextFunction) {
    const accessToken = req.get("Authorization");
    if (!accessToken) {
      res.status(401).send({ error: "Missing authorization header" });
      return;
    }

    // Using Express app settings
    const authManager = req.app.get("authManager");

    try {
      const user = await authManager.verifyTokenAndGetUser(accessToken);
      res.locals.user = user;
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }

    return func(req, res, next);
  };
}
