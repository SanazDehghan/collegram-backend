import { errorMapper } from "../tools/errorMapper.tools";
import { UserServices } from "~/services/user.services";
import { BaseRoutes, RouteHandler } from "./base.routes";
import { appendDTO } from "~/controllers/middleware/appendDto";
import { SignupDTO, zodSignupDTO } from "~/controllers/dtos/user.dtos";

export class UserRoutes extends BaseRoutes {
  constructor(private service: UserServices) {
    super("/users");

    this.router.post("/signup", appendDTO(zodSignupDTO), this.signup());
  }

  private signup(): RouteHandler<SignupDTO> {
    return async (req, res, next) => {
      try {
        const { email, username, password } = req.dto!;
        const token = this.service.signup(email, username, password);

        res.data = {token}
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
}
