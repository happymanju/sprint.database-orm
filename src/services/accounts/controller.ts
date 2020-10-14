import { Router, Request, Response, NextFunction } from "express";
import AccountManager from "./manager";
import BaseController from "../common/controller";
import { guarded } from "../../authentication";

class AccountController extends BaseController {
  public path: string = "/accounts";
  public router: Router;

  protected manager: AccountManager;

  constructor() {
    super();
    this.router = this.createRouter();
    this.manager = new AccountManager();
  }

  protected createRouter(): Router {
    const router = Router();

    router.get("/:accountId", guarded(this.get));
    router.post("/", guarded(this.post));
    router.patch("/:accountId", guarded(this.patch));
    router.delete("/:accountId", guarded(this.delete));

    return router;
  }

  protected get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { accountId } = req.params;
      const account = await this.manager.getAccount(accountId);
      if (!account) {
        res.status(404).send({ error: "account not found" });
        return;
      }
      res.json(account);
    } catch (err) {
      next(err);
    }
  };

  protected post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newAccountDetails = req.body;

      // The current user is injected from `src/authentication.ts -> guarded()`
      // and is being passed around via `res.locals` context object
      newAccountDetails.owner = res.locals.user;
      const account = await this.manager.createAccount(newAccountDetails);
      res.status(201).json(account);
    } catch (err) {
      next(err);
    }
  };

  protected patch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { accountId } = req.params;
      const newAccountDetails = req.body;
      const updatedAccount = await this.manager.updateAccount(accountId, newAccountDetails);
      res.json(updatedAccount);
    } catch (err) {
      next(err);
    }
  };

  protected delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { accountId } = req.params;

    try {
      await this.manager.deleteAccount(accountId);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  };
}

export default AccountController;
