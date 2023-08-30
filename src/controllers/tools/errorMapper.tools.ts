import {
  ServiceError,
  UsernameTakenError,
  InvalidTokenError,
  DuplicateEmailError,
  InvalidUsernameOrPasswordError,
  UserNotFound,
} from "~/services/errors/service.errors";
import { BadRequestError, ConflictError, HttpError, UnauthorizedError } from "../errors/http.error";

type Mapping = [typeof ServiceError, HttpError];

const mappings: Mapping[] = [
  [UsernameTakenError, new ConflictError("Username is already taken")],
  [DuplicateEmailError, new ConflictError("This Email has already been registered")],
  [InvalidTokenError, new UnauthorizedError("Token is not valid")],
  [InvalidUsernameOrPasswordError, new UnauthorizedError("Wrong Username or password!")],
  [UserNotFound, new BadRequestError("User not found")]
];

export function errorMapper(error: unknown) {
  for (const mapping of mappings) {
    if (error instanceof mapping[0]) {
      return mapping[1];
    }
  }
  return error;
}