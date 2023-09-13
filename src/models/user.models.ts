import { z } from "zod";
import { Brand, zodNonEmptyString, zodUUID } from "./common";
import { zodPassword, zodPasswordHash } from "./password.models";
import { UUID } from "crypto";

export type Username = Brand<string, "username">;

export type Email = Brand<string, "email">;

export const userRelations = ["REQUESTED", "FOLLOW", "CLOSE_FRIEND", "BLOCKED"] as const;

export const zodUserRelations = z.union([
  z.literal("REQUESTED"),
  z.literal("FOLLOW"),
  z.literal("CLOSE_FRIEND"),
  z.literal("BLOCKED"),
]);

export type UserRelationTypes = z.infer<typeof zodUserRelations>;

export interface IUserRelations {
  user1Id: UUID;
  user2Id: UUID;
  relationType: UserRelationTypes;
}

export type Bio = Brand<string, "bio">;

export const isUsername = (val: string): val is Username => {
  // username can only contain english alphabet, numbers and underscores;
  const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

  return 4 <= val.length && val.length <= 64 && pattern.test(val);
};

export const isEmail = (val: string): val is Email => {
  // pattern of email address
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return pattern.test(val);
};

export const isBio = (val: string): val is Bio => 0 < val.length && val.length < 256;

export const zodUsername = z.string().refine(isUsername);

export const zodEmail = z.string().nonempty().refine(isEmail);

export const zodBio = z.string().nonempty().refine(isBio);

const baseUser = {
  username: zodUsername,
  firstName: zodNonEmptyString.optional(),
  lastName: zodNonEmptyString.optional(),
  email: zodEmail,
  bio: zodBio.optional(),
  profileUrl: zodNonEmptyString.optional(),
  isPrivate: z.boolean(),
};

export const zodBaseUser = z.object(baseUser).strict();

export type BaseUser = z.infer<typeof zodBaseUser>;

const user = {
  id: zodUUID,
  followers: z.number().int(),
  followings: z.number().int(),
  ...baseUser,
};

export const zodUser = z.object(user).strict();

export type User = z.infer<typeof zodUser>;

const userWithPasswordHash = {
  passwordHash: zodPasswordHash,
  ...user,
};
export const zodUserWithPasswordHash = z.object(userWithPasswordHash).strict();

export type UserWithPasswordHash = z.infer<typeof zodUserWithPasswordHash>;

const userWithPassword = {
  password: zodPassword.optional(),
  firstName: zodNonEmptyString.optional(),
  lastName: zodNonEmptyString.optional(),
  email: zodEmail.optional(),
  bio: zodBio.optional(),
  isPrivate: z.boolean().optional(),
};

export const zodUserWithPassword = z.object(userWithPassword).strict();

export type UserWithPassword = z.infer<typeof zodUserWithPassword>;
