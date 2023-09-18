import { PostServices } from "~/services/post.services";
import {
  ADDPostDTO,
  BookmarkPostDTO,
  EditPostDTO,
  GetMyBookmarksDTO,
  GetMyPostsDTO,
  GetPostDetailsDTO,
  LikePostDTO,
  zodGetMyPostsDTO,
  zodGetPostDetailsDTO,
} from "../dtos/post.dtos";
import { BaseRoutes, Handler } from "./base.routes";
import { passObject } from "../middleware/passObject";
import { upload } from "../middleware/upload";

export class PostRoutes extends BaseRoutes {
  constructor(private service: PostServices) {
    super("/posts");

    this.router.post("/", upload.files("photos", 5), upload.passData(ADDPostDTO.zod, this.addPost.bind(this)));
    this.router.get("/", passObject.passUserDTO(zodGetMyPostsDTO, this.getMyPosts.bind(this)));
    this.router.post("/like", passObject.passUserDTO(LikePostDTO.zod, this.likePost.bind(this)));
    this.router.get("/bookmark", passObject.passUserDTO(GetMyBookmarksDTO.zod, this.getMyBookmarks.bind(this)));
    this.router.put("/bookmark", passObject.passUserDTO(BookmarkPostDTO.zod, this.bookmarkPost.bind(this)));
    this.router.get("/:postId", passObject.passUserDTO(zodGetPostDetailsDTO, this.getPostDetails.bind(this)));
    this.router.put("/:postId", passObject.passUserDTO(EditPostDTO.zod, this.editPost.bind(this)));
  }

  private editPost: Handler.UserDTO<EditPostDTO.Type> = (uid, dto) => {
    return async (req, res) => {
      try {
        console.log(dto);
        
        const postId = dto.postId;
        const tags = dto.tags;
        const basePost = { description: dto.description, closeFriendsOnly: dto.closeFriendsOnly };
        const result = await this.service.editPost(uid, postId, tags, basePost);

        this.sendData(res, result);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private getMyPosts: Handler.UserDTO<GetMyPostsDTO> = (uid, dto) => {
    return async (req, res) => {
      try {
        const { limit, page } = dto;
        const result = await this.service.getAllUserPosts(uid, limit, page);

        this.sendData(res, result);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private getPostDetails: Handler.UserDTO<GetPostDetailsDTO> = (uid, dto) => {
    return async (req, res) => {
      try {
        const result = await this.service.getPostDetails(uid, dto.postId);

        this.sendData(res, result);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private addPost: Handler.UploadData<ADDPostDTO.AddPostType> = (userId, dto, files) => {
    return async (req, res) => {
      try {
        const tags = dto.tags;
        const basePost = { description: dto.description, closeFriendsOnly: dto.closeFriendsOnly };
        const post = await this.service.addPost(basePost, files, tags, userId);

        this.sendData(res, post);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private likePost: Handler.UserDTO<LikePostDTO.Type> = (uid, dto) => {
    return async (req, res) => {
      try {
        const result = await this.service.likePost(uid, dto.postId);

        this.sendData(res, result);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  private bookmarkPost: Handler.UserDTO<BookmarkPostDTO.Type> = (uid, dto) => {
    return async (req, res) => {
      try {
        const { postId, bookmark } = dto;
        const result = await this.service.bookmarkPost(uid, postId, bookmark);

        this.sendData(res, result);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  }

  private getMyBookmarks: Handler.UserDTO<GetMyBookmarksDTO.Type> = (uid, dto) => {
    return async (req, res, next) => {
      try {
        const { limit, page } = dto;
        const result = await this.service.getMyBookmarks(uid, limit, page);

        this.sendData(res, result)
      } catch (error) {
        this.sendError(res, error)
      }
    };
  }
}
