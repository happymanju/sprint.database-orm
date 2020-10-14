import { Router, Request, Response, NextFunction } from "express";
import TransactionManager from "./manager";
import BaseController from "../common/controller";
import { guarded } from "../../authentication";

class TransactionController extends BaseController {
  public path: string = "/transactions";
  public router: Router;

  protected manager: TransactionManager;

  constructor() {
    super();
    this.router = this.createRouter();
    this.manager = new TransactionManager();
  }

  /**
   * Using a factory method here
   */
  protected createRouter(): Router {
    const router = Router();

    router.get("/:transactionId", guarded(this.get));
    router.post("/", guarded(this.post));
    router.patch("/:transactionId", guarded(this.patch));
    router.delete("/:transactionId", guarded(this.delete));

    return router;
  }

  protected get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transactionId } = req.params;
      const transaction = await this.manager.getTransaction(transactionId);
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).send();
      }
    } catch (err) {
      next(err);
    }
  };

  protected post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newTransactionDetails = req.body;
      const transaction = await this.manager.createTransaction(newTransactionDetails);
      res.status(201).json(transaction);
    } catch (err) {
      next(err);
    }
  };

  protected patch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transactionId } = req.params;
      const newTransactionDetails = req.body;
      const updatedTransaction = await this.manager.updateTransaction(transactionId, newTransactionDetails);
      res.json(updatedTransaction);
    } catch (err) {
      next(err);
    }
  };

  protected delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { transactionId } = req.params;

    try {
      await this.manager.deleteTransaction(transactionId);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  };
}

export default TransactionController;
