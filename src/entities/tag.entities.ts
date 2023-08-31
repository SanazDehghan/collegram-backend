import { UUID } from "crypto";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Tag } from "~/models/tag.models";
import { PostsEntity } from "./post.entities";

@Entity("tags")
export class TagsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(() => PostsEntity, (post) => post.tags)
  posts!: PostsEntity[];

  @Column()
  value!: Tag;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;
}
