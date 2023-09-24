import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserRelationTypes } from "~/models/user.models";
import { UsersEntity } from "./user.entities";
import { UUID } from "crypto";

@Entity("user_relations")
export class UserRelationsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user1Id!: UUID;

  @ManyToOne(() => UsersEntity)
  @JoinTable()
  user1!: UsersEntity;

  @Column()
  user2Id!: UUID;

  @ManyToOne(() => UsersEntity)
  @JoinTable()
  user2!: UsersEntity;

  @Column({ nullable: false })
  relationType!: UserRelationTypes;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
