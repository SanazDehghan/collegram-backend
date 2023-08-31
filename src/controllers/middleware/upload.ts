import multer, { FileFilterCallback, MulterError } from "multer";
import { Request } from "express";
import { ProcessManager } from "~/utilities/ProcessManager";
import { BadRequestError, LargePayloadError, UnsupportedMediaError } from "../errors/http.error";
import { RequestHandler } from "express-serve-static-core";

class Upload {
  private uploadDir = ProcessManager.get("UPLOAD_DIR").str ?? "uploads";
  private maxFileSize = 10_000_000;
  private mimeTypes = ["image/jpeg", "image/png"];

  public files(field: string, maxCount = 1) {
    return this.wrapper(this.getMulter().array(field, maxCount));
  }

  private getMulter() {
    return multer({
      dest: this.uploadDir,
      fileFilter: this.fileFilter(),
    });
  }

  private fileFilter() {
    return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (this.maxFileSize < file.size) {
        cb(new LargePayloadError("File is too large"));
      }

      if (!this.mimeTypes.includes(file.mimetype)) {
        cb(new UnsupportedMediaError("file type is not supported"));
      }

      cb(null, true);
    };
  }

  private wrapper(handler: RequestHandler): RequestHandler {
    return (req, res, next) => {
      handler(req, res, (error: unknown) => {
        if (error instanceof MulterError) {
          return next(this.multerErrorMapper(error));
        } else if (error) {
          return next(error);
        }

        return next();
      });
    };
  }

  private multerErrorMapper(error: MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return new LargePayloadError("File is too large");

      case "LIMIT_FILE_COUNT":
        return new BadRequestError("Too many files");

      case "LIMIT_UNEXPECTED_FILE":
        return new BadRequestError(`Unexpected file: ${error.field}`);

      default:
        return error;
    }
  }
}

export const upload = new Upload();
