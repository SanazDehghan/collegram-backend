import express from "express";
import { routes } from "~/controllers";
import { errorHandler, notFoundHandler, successHandler } from "~/controllers/middleware/output";
import { ProcessManager } from "~/utilities/ProcessManager";
import { dataManager } from "./DataManager";
import cors from "cors";

export class App {
  private express = express();
  private port: number;

  constructor(port = 3000) {
    this.port = ProcessManager.get("PORT").num ?? port;
  }

  private listen() {
    this.express.listen(this.port, () => {
      console.log(`listening on port: ${this.port}`);
    });
  }

  private initMiddleware() {
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(express.json());
    this.express.use(cors());
  }

  private initRoutes() {
    for (const route of routes) {
      this.express.use(route.base, route.router);
    }
  }

  private initOutputHandlers() {
    this.express.use(successHandler());
    this.express.use(notFoundHandler());
    this.express.use(errorHandler());
  }

  public async init() {
    await dataManager.init();
    this.initMiddleware();
    this.initRoutes();
    this.initOutputHandlers();
  }

  public getExpress() {
    return this.express;
  }

  public async start() {
    await this.init();
    this.listen();
  }
}
