import { UUID } from "crypto";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { PostsEntity } from "./post.entities";
import { UsersEntity } from "./user.entities";

@Entity("images")
export class ImagesEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: UUID;

  @Column()
  userId!: UUID;

  @ManyToOne(() => PostsEntity, (image) => image.images)
  user!: UsersEntity;

  @ManyToOne(() => PostsEntity, (image) => image.images)
  post!: PostsEntity;

  @Column({ unique: true })
  path!: string;

  @Column()
  size!: number;

  @Column()
  mimetype!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;
}
