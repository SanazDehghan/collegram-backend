import { PostServices } from "~/services/post.services";
import { ADDPostDTO, GetMyPostsDTO, GetPostDetailsDTO, zodGetMyPostsDTO, zodGetPostDetailsDTO } from "../dtos/post.dtos";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";
import { RequestHandler } from "express";
import { UUID } from "crypto";
import { passObject } from "../middleware/passObject";
import { MulterImage, zodPath, zodSize, zodMimeType, PostImage } from "~/models/image.models";
import { Tag, BaseTag } from "~/models/tag.models";
import { upload } from "../middleware/upload";

export class PostRoutes extends BaseRoutes {
  constructor(private service: PostServices) {
    super("/posts");

    this.router.post("/add", appendUID, appendDTO(ADDPostDTO.zod), upload.files("photos", 5), this.addPost());
    this.router.get("/", passObject.passUserDTO(zodGetMyPostsDTO, this.getMyPosts.bind(this)));
    this.router.get("/:postId", passObject.passUserDTO(zodGetPostDetailsDTO, this.getPostDetails.bind(this)));
  }

  private getMyPosts(uid: UUID, dto: GetMyPostsDTO): RequestHandler {
    return async (req, res, next) => {
      try {
        const { limit, page } = dto;
        const result = await this.service.getAllUserPosts(uid, limit, page);

        res.data = result;

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private getPostDetails(uid: UUID, dto: GetPostDetailsDTO): RequestHandler {
    return async (req, res, next) => {
      try {
        const result = await this.service.getPostDetails(uid, dto.postId);

        res.data = result;
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
  
  private createBaseImage(images: Express.Multer.File[]) {
    const baseImage: MulterImage.multerImageType[] = [];
    for (const image of images) {
      baseImage.push({
        path: zodPath.parse(image.path),
        size: zodSize.parse(image.size),
        mimeType: zodMimeType.parse(image.mimetype),
      });
    }
    return baseImage;
  }
  
  private createBaseTags(tags: Tag.tagBrand[]) {
    let baseTags: BaseTag.baseTagType[] = [];
    for (let tag of tags) {
      baseTags.push({
        value: Tag.zod.parse(tag),
      });
    }
    return baseTags;
  }

  private addPost(
    userId: UUID,
    dto: ADDPostDTO.AddPostType,
    files: PostImage.UploadImage[],
  ): RouteHandler<ADDPostDTO.AddPostType> {
    return async (req, res, next) => {
      try {
        const tags = dto.tags;
        const basePost = { description: dto.description, closeFriendsOnly: dto.closeFriendsOnly };
        const post = await this.service.addPost(basePost, files, tags, userId);
        res.data = { post };

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
}
