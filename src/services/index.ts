import { UserServices } from "./user.services";
import { repositories } from "~/repository";

export const services = {
  user: new UserServices(repositories.user),
}