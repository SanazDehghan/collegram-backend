import { UserRoutes } from "~/controllers/routes/user.routes";
import { UserServices } from "~/services/user.services";
import { UserRepo } from "~/repository/user.repo";
import { TokenServices } from "~/services/token.services";
import { MailServices } from "~/services/mail.services";
import { PasswordRepo } from "~/repository/password.repo";
import { PostRoutes } from "./routes/post.routes";
import { PostServices } from "~/services/post.services";
import { PostRepo } from "~/repository/post.repo";
import { UserRelationsServices } from "~/services/userRelations.services";
import { UserRelationsRepo } from "~/repository/userRelations.repo";
import { CommentRoutes } from "./routes/comment.routes";
import { CommentServices } from "~/services/comment.services";
import { CommentNotFound } from "~/services/errors/service.errors";
import { CommentRepo } from "~/repository/comment.repo";

const userRelationsServices = new UserRelationsServices(new UserRelationsRepo());

export const routes = [
  new UserRoutes(
    new UserServices(
      new UserRepo(),
      new PasswordRepo(),
      new TokenServices(),
      userRelationsServices,
      new MailServices(),
    ),
  ),
  new PostRoutes(new PostServices(new PostRepo(), userRelationsServices)),
  new CommentRoutes(new CommentServices(new CommentRepo())),
];
