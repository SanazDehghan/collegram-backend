import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UUID } from "crypto";
import { UsersEntity } from "./user.entities";
import { PostsEntity } from "./post.entities";

@Entity("comments")
export class CommentsEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: UUID;

  @Column("uuid")
  userId!: UUID;

  @ManyToOne(() => UsersEntity, (user) => user.comments)
  user?: UsersEntity;

  @Column("uuid")
  postId!: UUID;

  @ManyToOne(() => PostsEntity, (post) => post.comments)
  post!: PostsEntity;

  @Column()
  text!: string;

  @Column("uuid")
  parentId?: UUID;

  @ManyToOne(() => CommentsEntity)
  parentComment?: CommentsEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
