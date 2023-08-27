import { InvalidTokenError, ServiceError } from "~/services/errors/service.errors";
import { HttpError, UnauthorizedError } from "../errors/http.error";

type Mapping = [typeof ServiceError, HttpError];

const mappings: Mapping[] = [
  [InvalidTokenError, new UnauthorizedError("Token is not valid")],
];

export function errorMapper(error: unknown) {
  for (const mapping of mappings) {
    if (error instanceof mapping[0]) {
      return mapping[1];
    }
  }
  return error;
}
