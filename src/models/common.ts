import { UUID } from "crypto";
import { validate } from "uuid";
import { z } from "zod";

export type Brand<T, B extends string> = T & { [k in `__${B}`]: true };

export type nonEmptyString = Brand<string, "non-empty">;

export const isNonEmptyString = (val: string): val is nonEmptyString => val.length > 0;

export const isUUID = (id: string): id is UUID => validate(id);

export const zodNonEmptyString = z.string().nonempty().refine(isNonEmptyString);

export const zodUUID = z.string().refine(isUUID);

export type PaginationNumber = Brand<number, "pagination">;

export const isPaginationNumber = (num: number): num is PaginationNumber => num >= 1 && num % 1 === 0;

export const zodPaginationNumber = z.coerce.number().int().gte(1).refine(isPaginationNumber);
export interface Pagination<T> {
  items: T[];
  page: PaginationNumber;
  maxPage: PaginationNumber;
}

export const createPagination = <T>(
  items: T[],
  page: PaginationNumber,
  perPage: PaginationNumber,
  total: number,
): Pagination<T> => {
  if (total < 1) {
    return { items: [], page: 1 as PaginationNumber, maxPage: 1 as PaginationNumber };
  }

  const maxPage = Math.ceil(total / perPage) as PaginationNumber;

  return { items, page, maxPage };
};
