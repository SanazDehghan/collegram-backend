import { ZodTypeAny, z } from "zod";
import { logger } from "../../utilities/logger";

function cleanObj(obj: unknown): unknown {
  if (obj instanceof Date) {
    return obj;
  }

  if (obj instanceof Array) {
    return obj.map((item) => cleanObj(item)).filter((item) => item !== null && item !== undefined);
  }

  if (obj instanceof Object) {
    const cleanedEntries = Object.entries(obj)
      .map((item) => [item[0], cleanObj(item[1])])
      .filter((item) => item[1] !== null && item[1] !== undefined);

    return Object.fromEntries(cleanedEntries);
  }

  return obj;
}

export function parseDAO<T extends ZodTypeAny>(schema: T, obj: unknown): z.infer<T> {
  try {
    return schema.parse(cleanObj(obj));
  } catch (error) {
    logger.error(error);

    throw new Error();
  }
}
