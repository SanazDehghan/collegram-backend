import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PasswordsEntity } from "./password.entities";

@Entity("users")
export class UsersEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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

  @OneToOne(() => PasswordsEntity, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  password!: PasswordsEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
