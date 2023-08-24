import { BaseRoutes, RouteHandler } from "./base.routes";

export class UserRoutes extends BaseRoutes {
  constructor() {
    super("/users");

    this.router.post("/signup", this.signup());
  }

  private signup(): RouteHandler {
    return async (req, res, next) => {
      res.data = "signup";
      next();
    };
  }
}
