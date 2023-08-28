import { UserRoutes } from "~/controllers/routes/user.routes";
import { services } from "~/services";

export const routes = [
  new UserRoutes(services.user),
];