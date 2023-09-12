import { UserServices } from "~/services/user.services";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes } from "./base.routes";
import { passObject } from "~/controllers/middleware/passObject";
import {
  LoginDTO,
  ResetPasswordDTO,
  SendPasswordResetEmailDTO,
  SignupDTO,
  zodLoginDTO,
  zodSetPasswordDTO,
  zodSignupDTO,
  zodSendPasswordResetEmailDTO,
  zodUserInfoDTO,
  UserInfoDTO,
} from "~/controllers/dtos/user.dtos";
import { RequestHandler } from "express";
import { UUID } from "crypto";
import { upload } from "../middleware/upload";
import { UploadImageDTO } from "~/controllers/dtos/image.dtos";

export class UserRoutes extends BaseRoutes {
  constructor(private service: UserServices) {
    super("/users");

    this.router.post("/signup", passObject.passDTO(zodSignupDTO, this.signup.bind(this)));
    this.router.post("/login", passObject.passDTO(zodLoginDTO, this.login.bind(this)));
    this.router.post(
      "/password",
      passObject.passDTO(zodSendPasswordResetEmailDTO, this.sendPasswordResetEmail.bind(this)),
    );
    this.router.put("/password", passObject.passDTO(zodSetPasswordDTO, this.resetPassword.bind(this)));
    this.router.get("/me", passObject.passUID(this.getUserInfo.bind(this)));
    this.router.put("/me", upload.files("profileUrl"), upload.passData(zodUserInfoDTO, this.userInfo.bind(this)));
  }

  private signup(signUp: SignupDTO): RequestHandler {
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

  private login(login: LoginDTO): RequestHandler {
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
  private sendPasswordResetEmail(sendEmailRecoveryPassword: SendPasswordResetEmailDTO): RequestHandler {
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

  private resetPassword(resetPassword: ResetPasswordDTO): RequestHandler {
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

  private getUserInfo(id: UUID): RequestHandler {
    return async (req, res, next) => {
      try {
        const uid = id;
        const userInfo = await this.service.getUserInfo(uid);

        res.data = userInfo;
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private userInfo(id: UUID, info: UserInfoDTO, files: UploadImageDTO.Type[]): RequestHandler {
    return async (req, res, next) => {
      try {
        const userInfo = await this.service.updateUserInfo(id, info, files);

        res.data = userInfo;

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
}
