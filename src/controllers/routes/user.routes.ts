import { UserServices } from "~/services/user.services";
import { BaseRoutes, Handler } from "./base.routes";
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
import { upload } from "../middleware/upload";

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
    this.router.put("/me", upload.files("profileUrl"), upload.passData(zodUserInfoDTO, this.editUserInfo.bind(this)));
  }

  private signup: Handler.DTO<SignupDTO> = (dto) => {
    return async (req, res) => {
      try {
        const { email, username, password } = dto;
        const token = await this.service.signup(email, username, password);

        this.sendData(res, { token });
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private login: Handler.DTO<LoginDTO> = (dto) => {
    return async (req, res) => {
      try {
        const token = await this.service.login(dto);

        this.sendData(res, { token });
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };
  private sendPasswordResetEmail: Handler.DTO<SendPasswordResetEmailDTO> = (dto) => {
    return async (req, res) => {
      try {
        const { identifier } = dto;
        const email = await this.service.sendEmailRecoveryPassword({ identifier });

        const data = { email: email.substring(0, 5) + "*******" + email.substring(9) };

        this.sendData(res, data);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private resetPassword: Handler.DTO<ResetPasswordDTO> = (dto) => {
    return async (req, res) => {
      try {
        const { password, token } = dto;
        await this.service.resetPasswordUser(token, password);

        this.sendData(res, true);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private getUserInfo: Handler.UID = (id) => {
    return async (req, res) => {
      try {
        const uid = id;
        const userInfo = await this.service.getUserInfo(uid);

        this.sendData(res, userInfo);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private editUserInfo: Handler.UploadData<UserInfoDTO> = (id, info, files) => {
    return async (req, res) => {
      try {
        const userInfo = await this.service.updateUserInfo(id, info, files);

        this.sendData(res, userInfo);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };
}
