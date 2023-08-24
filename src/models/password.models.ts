import { z } from "zod";
import { Brand } from "./common";
import { hash } from "bcrypt";

export type Password = Brand<string, "password">;

export type PasswordHash = Brand<string, "hash">;

export const isPassword = (val: string): val is Password => {
  // passwords should contain lowercase and uppercase characters and numbers;
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

  return 8 <= val.length && val.length <= 32 && pattern.test(val);
};

export const isPasswordHash = (val: string): val is PasswordHash => val.length === 60;

export const generatePasswordHash = async (password: Password, rounds: number = 10): Promise<PasswordHash> => {
  const res = (await hash(password, rounds)) as PasswordHash;

  return res;
};

export const zodPassword = z.string().nonempty().refine(isPassword);

export const zodPasswordHash = z.string().nonempty().refine(isPasswordHash);
