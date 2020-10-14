import { Router, Request, Response } from "express";
import AuthManager from "./manager";
import BaseController from "../common/controller";

class AuthController extends BaseController {
  public path: string = "/token";
  public router: Router;

  protected manager: AuthManager;

  constructor(secret: string) {
    super();
    this.router = this.createRouter();
    this.manager = new AuthManager(secret);
  }

  /**
   * Using a factory method here
   */
  protected createRouter(): Router {
    const router = Router();

    router.post("/", this.post);

    return router;
  }

  /**
   * HTTP Post request handler
   * 1. Verifies username and password
   * 2. If password is correct -> Returns a JWT token
   *    Else -> Return HTTP 401
   *
   * Why HTTP 401?
   * - See: https://tools.ietf.org/html/rfc7235#section-3.1
   *
   */
  protected post = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    try {
      const accessToken = await this.manager.generateJwtToken(username, password);
      res.status(201).json({ accessToken });
    } catch (error) {
      res.status(401).json({ error });
    }
  };
}

export default AuthController;
