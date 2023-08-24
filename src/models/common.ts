import { UUID } from "crypto";
import { validate } from "uuid";
import { z } from "zod";

export type Brand<T, B extends string> = T & { [k in `__${B}`]: true };

export type nonEmptyString = Brand<string, "non-empty">;

export const isNonEmptyString = (val: string): val is nonEmptyString => val.length > 0;

export const isUUID = (id: string): id is UUID => validate(id);

export const zodNonEmptyString = z.string().nonempty().refine(isNonEmptyString);

export const zodUUID = z.string().refine(isUUID);
