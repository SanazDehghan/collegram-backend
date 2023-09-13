import { BasePost } from "~/models/post.models";
import { Tag } from "~/models/tag.models";
import { PostRepo } from "~/repository/post.repo";
import { ForbiddenNumberOfTags } from "~/services/errors/service.errors";
import { PostServices } from "~/services/post.services";

describe("Post tests", () => {

    test("should throw an error if tags length is more than 7", () => {
        const postRepo = new PostRepo();
        const postServices = new PostServices(postRepo);
        const tags = ["tig", "git", "github", "tags", "gat", "gallary", "yrallag", "yellows"] as Tag.tagBrand[];
        const userId = "565e379f-85b5-412a-b8a3-19aea38c6824"
        const postId = "c0b123b7-d51b-4ffa-97d8-a343795c6ad6"
        const basePost = {
            description: "Description",
            closeFriendsOnly: true,
        } as BasePost.basePostType
        expect(postServices.editPost(userId, postId, tags, basePost)).rejects.toThrow(ForbiddenNumberOfTags)


    })

});