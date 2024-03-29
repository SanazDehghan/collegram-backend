import {
  ServiceError,
  UsernameTakenError,
  InvalidTokenError,
  DuplicateEmailError,
  InvalidUsernameOrPasswordError,
  UserNotFound,
  PostNotFound,
  ForbiddenNumberOfPhotos,
  ForbiddenNumberOfTags,
  ForbiddenFollowUser,
} from "~/services/errors/service.errors";
import { BadRequestError, ConflictError, ForbiddenError, HttpError, UnauthorizedError } from "../errors/http.error";

type Mapping = [typeof ServiceError, HttpError];

const mappings: Mapping[] = [
  [UsernameTakenError, new ConflictError("Username is already taken")],
  [DuplicateEmailError, new ConflictError("This Email has already been registered")],
  [InvalidTokenError, new UnauthorizedError("Token is not valid")],
  [InvalidUsernameOrPasswordError, new UnauthorizedError("Wrong Username or password!")],
  [UserNotFound, new BadRequestError("User not found")],
  [PostNotFound, new BadRequestError("Post not found")],
  [ForbiddenNumberOfPhotos, new ForbiddenError("You must have at least 1 photo and Maximum 5 photos")],
  [ForbiddenNumberOfTags, new ForbiddenError("You must have at least 1 tag and Maximum 7 tags")],
  [ForbiddenFollowUser, new ForbiddenError("You cannot follow this user")],
];

export function errorMapper(error: unknown) {
  for (const mapping of mappings) {
    if (error instanceof mapping[0]) {
      return mapping[1];
    }
  }
  return error;
}
