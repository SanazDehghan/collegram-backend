import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("passwords")
export class PasswordsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 60 })
  passwordHash!: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
