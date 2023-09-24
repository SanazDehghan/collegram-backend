import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostsEntity } from "./post.entities";
import { UsersEntity } from "./user.entities";
import { UUID } from "crypto";

@Entity("post_bookmarks")
export class PostBookmarksEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  postId!: UUID;

  @ManyToOne(() => PostsEntity)
  post!: PostsEntity;

  @Column()
  userId!: UUID;

  @ManyToOne(() => UsersEntity)
  user!: UsersEntity;

  @CreateDateColumn()
  bookmarkedAt!: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
