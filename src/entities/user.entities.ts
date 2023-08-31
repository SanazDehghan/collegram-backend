import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PasswordsEntity } from "./password.entities";
import { UUID } from "crypto";
import { PostsEntity } from "./post.entities";
import { CommentsEntity } from "./comment.entities";

@Entity("users")
export class UsersEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: UUID;

  @OneToMany(() => PostsEntity, (post) => post.user)
  posts?: PostsEntity[];

  @OneToMany(() => CommentsEntity, (comment) => comment.user)
  comments?: CommentsEntity[];

  @Column({ unique: true, length: 64 })
  username!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true, length: 255 })
  bio?: string;

  @Column({ nullable: true })
  profileUrl?: string;

  @Column({ default: false })
  isPrivate!: boolean;

  @Column({ default: 0 })
  followers!: number;

  @Column({ default: 0 })
  followings!: number;

  @OneToOne(() => PasswordsEntity, (password) => password.user, { cascade: true, onDelete: "CASCADE" })
  password!: PasswordsEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
