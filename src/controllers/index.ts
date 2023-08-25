import { UserRoutes } from "~/controllers/routes/user.routes";
import { UserServices } from "~/services/user.services";
import { UserRepo } from "~/repository/user.repo";
import { TokenServices } from "~/services/token.services";

export const routes = [
  new UserRoutes(new UserServices(new UserRepo(), new TokenServices())),
];
