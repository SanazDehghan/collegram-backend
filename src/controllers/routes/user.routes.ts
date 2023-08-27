import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";

export class UserRoutes extends BaseRoutes {
  constructor() {
    super("/users");

    this.router.post("/signup", this.signup());
  }

  private signup(): RouteHandler {
    return async (req, res, next) => {
      try {
        res.data = "signup";
        next();
      } catch (error) {
        next(errorMapper(error))
      }
    };
  }
}
