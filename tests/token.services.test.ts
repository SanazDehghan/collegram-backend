import { UUID } from "crypto";
import { v4 } from "uuid";
import { Token, isToken } from "~/models/token.models";
import { TokenServices } from "~/services/token.services";

describe("testing token services", () => {
  const tokenServices = new TokenServices()

  test("should generate token", () => {
    const token = tokenServices.generateToken({ userId: "user id" as UUID });

    expect(isToken(token)).toBe(true);
  });

  test("should be able to validate token", () => {
    const id = v4() as UUID

    const token = tokenServices.generateToken({ userId: id});

    expect(tokenServices.validate(token)).toEqual({ userId: id });
  });

  test("should be unable to validate", () => {
    const id = v4() as UUID

    const token = tokenServices.generateToken({ userId: id});

    const changedToken = token + "a" as Token;

    expect(tokenServices.validate(changedToken)).toBeNull();
  });
});
