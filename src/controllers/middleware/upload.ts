import multer, { FileFilterCallback, MulterError } from "multer";
import { Request, RequestHandler } from "express";
import { ProcessManager } from "~/utilities/ProcessManager";
import { BadRequestError, LargePayloadError, UnauthorizedError, UnsupportedMediaError } from "../errors/http.error";
import { AnyZodObject, z } from "zod";
import { UUID } from "crypto";
import { TokenServices } from "~/services/token.services";
import { zodBearerToken } from "~/models/token.models";
import { UploadImage, zodUploadImage } from "~/models/images.model";

class Upload {
  private uploadDir = ProcessManager.get("UPLOAD_DIR").str ?? "uploads";
  private maxFileSize = 10_000_000;
  private mimeTypes = ["image/jpeg", "image/png"];

  constructor(private tokenServices: TokenServices) {}

  public files(field: string, maxCount: number = 1) {
    return this.wrapper(this.getMulter().array(field, maxCount));
  }

  public passData<T extends AnyZodObject>(
    parser: T,
    fn: (uid: UUID, dto: z.TypeOf<T>, files: PostImage.UploadImage[]) => RequestHandler,
  ): RequestHandler {
    return async (req, res, next) => {
      try {
        const id = this.getUserId(req);
        const files = z.array(PostImage.zodUploadImage).parse(req.files);
        const json = this.parseBody(req.body);
        const dto = parser.parse({ ...req.query, ...req.params, ...json });

        await fn(id, dto, files)(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  private parseBody(body: Record<string, string>) {
    try {
      const parsedEntries = Object.entries(body).map((item) => [item[0], JSON.parse(item[1])]);
      const parsedObject = Object.fromEntries(parsedEntries);

      return parsedObject;
    } catch (error) {
      throw new BadRequestError("request body format is not valid");
    }
  }

  private getUserId(req: Request) {
    const auth = req.headers.authorization;

    const token = zodBearerToken.parse(auth);
    const tokenData = this.tokenServices.validate(token);

    if (tokenData === null) {
      throw new UnauthorizedError("Token is not valid");
    }

    return tokenData.userId;
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

export const upload = new Upload(new TokenServices());
