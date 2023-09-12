import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { UsersEntity } from "./user.entities";
import { UUID } from "crypto";

@Entity("passwords")
export class PasswordsEntity {
  @PrimaryColumn("uuid")
  userId!: UUID;

  @OneToOne(() => UsersEntity, (user) => user.password)
  @JoinColumn()
  user!: UsersEntity;

  @Column({ length: 60 })
  passwordHash!: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
