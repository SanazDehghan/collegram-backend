import { UserRoutes } from "~/controllers/routes/user.routes";
import { UserServices } from "~/services/user.services";
import { UserRepo } from "~/repository/user.repo";
import { TokenServices } from "~/services/token.services";
import { MailServices } from "~/services/mail.services";
import { PasswordRepo } from "~/repository/password.repo";
import { PostRoutes } from "./routes/post.routes";
import { PostServices } from "~/services/post.services";
import { PostRepo } from "~/repository/post.repo";

export const routes = [
  new UserRoutes(new UserServices(new UserRepo(), new PasswordRepo(), new TokenServices(), new MailServices())),
  new PostRoutes(new PostServices(new PostRepo())),
];
