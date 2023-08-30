import { UserServices } from "~/services/user.services";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";
import { appendDTO } from "~/controllers/middleware/appendDto";
import {
  LoginDTO,
  ResetPasswordDTO,
  SendPasswordResetEmailDTO,
  SignupDTO,
  zodLoginDTO,
  zodSetPasswordDTO,
  zodSignupDTO,
  zodSendPasswordResetEmailDTO,
} from "~/controllers/dtos/user.dtos";
import { appendUID } from "../middleware/auth";

export class UserRoutes extends BaseRoutes {
  constructor(private service: UserServices) {
    super("/users");

    this.router.post("/signup", appendDTO(zodSignupDTO), this.signup());
    this.router.post("/login", appendDTO(zodLoginDTO), this.login());
    this.router.post("/password", appendDTO(zodSendPasswordResetEmailDTO), this.sendPasswordResetEmail());
    this.router.put("/password", appendDTO(zodSetPasswordDTO), this.resetPassword());
    this.router.get("/me", appendUID(), this.getUserInfo());
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
      try {
        const token = await this.service.login(req.dto!);
        res.data = { token };
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
  private sendPasswordResetEmail(): RouteHandler<SendPasswordResetEmailDTO> {
    return async (req, res, next) => {
      try {
        const { identifier } = req.dto!;
        const email = await this.service.sendEmailRecoveryPassword({identifier});
        res.data = { email: email.substring(0, 5) + "*******" + email.substring(9) };
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private resetPassword(): RouteHandler<ResetPasswordDTO> {
    return async (req, res, next) => {
      try {
        const { password, uuid } = req.dto!;
        await this.service.resetPasswordUser(uuid, password);
        res.data = true;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private getUserInfo(): RouteHandler {
    return async (req, res, next) => {
      try {
        const userId = req.uid!;
        const userInfo = await this.service.getUserInfo(userId);

        res.data = userInfo;
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
}
