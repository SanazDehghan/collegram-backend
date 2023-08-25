import { UserServices } from "~/services/user.services";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";
import { appendDTO } from "~/controllers/middleware/appendDto";
import { LoginDTO, SignupDTO, zodSignupDTO } from "~/controllers/dtos/user.dtos";

export class UserRoutes extends BaseRoutes {
  constructor(private service: UserServices) {
    super("/users");

    this.router.post("/signup", appendDTO(zodSignupDTO), this.signup());
    this.router.post("/login", this.login());
  }

  private signup(): RouteHandler<SignupDTO> {
    return async (req, res, next) => {
      try {
        const { email, username, password } = req.dto!;
        const token = await this.service.signup(email, username, password);

        res.data = { token };
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private login(): RouteHandler<LoginDTO> {
    return async (req, res, next) => {
      {
        try {
          const token = await this.service.login(req.dto!);
          res.data = { token };
          next();
        } catch (error) {
          next(errorMapper(error));
        }
      }
    };
  }
}
