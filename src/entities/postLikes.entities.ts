import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostsEntity } from "./post.entities";
import { UsersEntity } from "./user.entities";
import { UUID } from "crypto";

@Entity("post_likes")
export class PostLikesEntity {
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
  likedAt!: Date;

  @Column({ nullable: true })
  unLikedAt?: Date;
}
