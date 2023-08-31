import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";
import { UsersEntity } from "./user.entities";
import { PostsEntity } from "./post.entities";

@Entity("comments")
export class CommentsEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: UUID;

  @ManyToOne(() => UsersEntity, (user) => user.comments)
  user?: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.comments)
  post!: PostsEntity;

  @Column()
  text!: string;

  @OneToMany(() => CommentsEntity, (reply) => reply.parentComment)
  replies?: CommentsEntity[];

  @ManyToOne(() => CommentsEntity, (parentComment) => parentComment.replies)
  parentComment?: CommentsEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
