import { UUID } from "crypto";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { PostsEntity } from "./post.entities";

@Entity("images")
export class ImagesEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: UUID;

  @ManyToOne(() => PostsEntity, (image) => image.images)
  post!: PostsEntity;

  @Column({ unique: true })
  path!: string;

  @Column()
  size!: number;

  @Column()
  mimeType!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;
}
