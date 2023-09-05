import { UserServices } from "~/services/user.services";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";
import { PassObject } from "~/controllers/middleware/appendDto";
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
import { PasswordsEntity } from "~/entities/password.entities";
import { RequestHandler } from "express";
import { UUID } from "crypto";

export class UserRoutes extends BaseRoutes {
  constructor(private service: UserServices, private passobjects:PassObject) {
    super("/users");

    this.router.post("/signup", this.passobjects.passDTO(zodSignupDTO, this.signup.bind(this)));
    this.router.post("/login", this.passobjects.passDTO(zodLoginDTO, this.login.bind(this)));
    this.router.post("/password", this.passobjects.passDTO(zodSendPasswordResetEmailDTO, this.sendPasswordResetEmail.bind(this)));
    this.router.put("/password", this.passobjects.passDTO(zodSetPasswordDTO, this.resetPassword.bind(this)));
    this.router.get("/me", this.passobjects.passUID(this.getUserInfo.bind(this)));
  }

  private signup(signUp:SignupDTO): RequestHandler {
    return async (req, res, next) => {
      try {
        const { email, username, password } = signUp;
        const token = await this.service.signup(email, username, password);

        res.data = { token };
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private login(login:LoginDTO): RequestHandler {
    return async (req, res, next) => {
      try {
        const token = await this.service.login(login);
        res.data = { token };
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
  private sendPasswordResetEmail(sendEmailRecoveryPassword:SendPasswordResetEmailDTO):RequestHandler{
    return async (req, res, next) => {
      try {
        const { identifier } = sendEmailRecoveryPassword;
        const email = await this.service.sendEmailRecoveryPassword({ identifier });
        res.data = { email: email.substring(0, 5) + "*******" + email.substring(9) };
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private resetPassword(resetPassword:ResetPasswordDTO): RequestHandler {
    return async (req, res, next) => {
      try {
        const { password, token } = resetPassword;
        await this.service.resetPasswordUser(token, password);
        res.data = true;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private getUserInfo(id:UUID): RequestHandler {
    return async (req, res, next) => {
      try {
        const uid = id;
        console.log(uid)
        const userInfo = await this.service.getUserInfo(uid);

        res.data = userInfo;
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
}
