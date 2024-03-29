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

  @Column("uuid")
  userId!: UUID;

  @Column({ default: false })
  closeFriendsOnly!: boolean;

  @Column({ nullable: false, length: 255 })
  description!: Description;

  @ManyToOne(() => UsersEntity, (user) => user.posts, { nullable: false })
  user!: UsersEntity;

  @OneToMany(() => ImagesEntity, (image) => image.post, { cascade: true, onDelete: "CASCADE" })
  images!: ImagesEntity[];

  @ManyToMany(() => TagsEntity, (tag) => tag.posts, { cascade: true, onDelete: "CASCADE" })
  @JoinTable()
  tags!: TagsEntity[];

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  bookmarks!: number;

  @Column({ default: 0 })
  commentsNum!: number;

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments!: CommentsEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
