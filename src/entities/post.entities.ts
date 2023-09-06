import { UUID } from "crypto";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UsersEntity } from "./user.entities";
import { ImagesEntity } from "./image.entities";
import { TagsEntity } from "./tag.entities";
import { Description } from "~/models/post.models";
import { CommentsEntity } from "./comment.entities";

@Entity("posts")
export class PostsEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: UUID;

  @Column()
  userId!: UUID;

  @ManyToOne(() => UsersEntity, (user) => user.posts, { nullable: false })
  user!: UsersEntity;

  @OneToMany(() => ImagesEntity, (image) => image.post, { cascade: true, onDelete: "CASCADE" })
  images!: ImagesEntity[];

  @Column({ nullable: false, length: 255 })
  description!: Description;

  @ManyToMany(() => TagsEntity, (tag) => tag.posts, { cascade: true, onDelete: "CASCADE" })
  @JoinTable()
  tags!: TagsEntity[];

  @Column({ default: false })
  closeFriendsOnly!: boolean;

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments!: CommentsEntity[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
