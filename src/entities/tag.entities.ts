import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Tag } from "~/models/tag.models";
import { PostsEntity } from "./post.entities";
import { UUID } from "crypto";

@Entity("tags")
export class TagsEntity {
  @PrimaryGeneratedColumn()
  id!: UUID;

  @ManyToMany(() => PostsEntity, (post) => post.tags)
  posts!: PostsEntity[];

  @Column({ unique: true })
  value!: Tag.tagBrand;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;
}
