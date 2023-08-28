import { z } from "zod";
import { ProcessManager } from "./ProcessManager";
import { HttpError } from "~/controllers/errors/http.error";
import { ServiceError } from "~/services/errors/service.errors";

const zodENV = z.union([z.literal("DEVELOPMENT"), z.literal("TEST"), z.literal("PRODUCTION")]).default("PRODUCTION");

type ENV = z.infer<typeof zodENV>;

class Logger {
  private env: ENV;

  constructor() {
    try {
      this.env = zodENV.parse(ProcessManager.get("ENV").str);
    } catch (error) {
      throw new Error("ENV is not valid.")
    }
  }

  private getTime(){
    return new Date().toLocaleString()
  }

  public log(value: unknown, production = false) {
    if (this.env !== "PRODUCTION" || production) {
      console.log('\x1b[32m%s\x1b[0m', `[${this.getTime()}]:`, value);
    }
  }

  public error(err: unknown) {
    if (!(err instanceof HttpError || err instanceof ServiceError)) {
      console.error('\x1b[31m%s\x1b[0m', `[${this.getTime()}]:`, err);
    }
  }
}

export const logger = new Logger();
