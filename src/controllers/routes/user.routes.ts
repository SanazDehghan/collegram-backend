import { UserServices } from "~/services/user.services";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";
<<<<<<< HEAD
import { appendDTO } from "~/controllers/middleware/appendDto";
import {
  LoginDTO,
  ResetPasswordDTO,
  SendPasswordResetEmailDTO,
  SignupDTO,
  zodSetPasswordDTO,
  zodSignupDTO,
  zodUserInfo,
  zodsendPasswordResetEmailDTO,
} from "~/controllers/dtos/user.dtos";
=======
import { UserServices } from "../../services/user.services";
import { LoginDTO, zodLogin } from "../dtos/user.dtos";
import { appendDTO } from "../middleware/appendDto";
>>>>>>> 3c7ce65... refactoring

export class UserRoutes extends BaseRoutes {
  constructor(private service: UserServices) {
    super("/users");

<<<<<<< HEAD
    this.router.post("/signup", appendDTO(zodSignupDTO), this.signup());
    this.router.post("/login", this.login());
    this.router.post("/password", appendDTO(zodsendPasswordResetEmailDTO), this.sendPasswordResetEmail());
    this.router.put("/password", appendDTO(zodSetPasswordDTO), this.resetPassword());
    this.router.get("/me", appendDTO<typeof zodUserInfo>, this.getUserInfo())
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
=======

    this.router.post("/login", appendDTO(zodLogin), this.login());
>>>>>>> 3c7ce65... refactoring
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
  private sendPasswordResetEmail(): RouteHandler<SendPasswordResetEmailDTO> {
    return async (req, res, next) => {
      try {
        const { email } = req.dto!;
        await this.service.sendEmailRecoveryPassword(email);
        res.data = true;
        next();
      } catch (error) {
        next(error);
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

  private getUserInfo(): RouteHandler{
      return async(req, res, next) => {
        try{
        const user = req.dto
        const userInfo = await this.service.getUserInfo(user)
        res.data = userInfo
        next()
      }
      catch(error){
        next(errorMapper(error))
    }
    };
    
  }
}
