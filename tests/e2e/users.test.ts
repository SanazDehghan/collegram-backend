import request from "supertest";
import { Express } from "express";
import { dataManager } from "~/DataManager";
import { App } from "~/app";

describe("testing /users", () => {
  let express: Express;

  beforeAll(async () => {
    const app = new App();
    await app.init();

    express = app.getExpress();
  });

  afterEach(async () => {
    await dataManager.cleanDB();
  });

  afterAll(async () => {
    await dataManager.close();
  });

  test("POST /signup: should signup successfully", async () => {
    const result = await request(express).post("/users/signup").send({
      email: "test@email.com",
      username: "username",
      password: "Password1",
    });

    expect(result.statusCode).toBe(200);
  });

  test("POST /signup: should fail due to registered username", async () => {
    await request(express).post("/users/signup").send({
      email: "test@email.com",
      username: "username",
      password: "Password1",
    });

    const result = await request(express).post("/users/signup").send({
      email: "test2@email.com",
      username: "username",
      password: "Password1",
    });

    expect(result.statusCode).toBe(409);
  });

  test("POST /signup: should fail due to registered email", async () => {
    await request(express).post("/users/signup").send({
      email: "test@email.com",
      username: "username",
      password: "Password1",
    });

    const result = await request(express).post("/users/signup").send({
      email: "test@email.com",
      username: "username2",
      password: "Password1",
    });

    expect(result.statusCode).toBe(409);
  });
});
