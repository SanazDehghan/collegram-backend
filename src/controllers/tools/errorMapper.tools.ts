<<<<<<< HEAD
import {
  ServiceError,
  UsernameTakenError,
  InvalidTokenError,
  DuplicateEmailError,
} from "~/services/errors/service.errors";
import { ConflictError, HttpError, UnauthorizedError } from "../errors/http.error";
=======
import { InvalidTokenError, InvalidUsernameOrPassworError, ServiceError } from "~/services/errors/service.errors";
import { HttpError, UnauthorizedError } from "../errors/http.error";
>>>>>>> 44ab897 (managing errors)

type Mapping = [typeof ServiceError, HttpError];

const mappings: Mapping[] = [
  [UsernameTakenError, new ConflictError("Username is already taken")],
  [DuplicateEmailError, new ConflictError("This Email has already been registered")],
  [InvalidTokenError, new UnauthorizedError("Token is not valid")],
  [InvalidUsernameOrPassworError, new UnauthorizedError("Wrong Username or password!")],
];

export function errorMapper(error: unknown) {
  for (const mapping of mappings) {
    if (error instanceof mapping[0]) {
      return mapping[1];
    }
  }
  return error;
}
