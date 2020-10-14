/**
 * Why name this service `auth` instead of `authentication`?
 *
 * We want this service to handle both authentication and authorization if such need presents.
 */
import AuthController from "./controller";
import AuthManager from "./manager";

export default {
  AuthController,
  AuthManager,
};
