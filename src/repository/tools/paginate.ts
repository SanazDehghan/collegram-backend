import { PaginationNumber } from "../../models/common";

export function paginate(limit: PaginationNumber, page: PaginationNumber) {
  const skip = (page - 1) * limit;

  return {
    take: limit,
    skip,
  };
}
