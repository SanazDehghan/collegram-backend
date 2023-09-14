import { DataSource } from "typeorm";
import { ProcessManager } from "~/utilities/ProcessManager";
import { UsersEntity } from "~/entities/user.entities";
import { PasswordsEntity } from "~/entities/password.entities";
import { PostsEntity } from "./entities/post.entities";
import { TagsEntity } from "./entities/tag.entities";
import { ImagesEntity } from "./entities/image.entities";
import { CommentsEntity } from "./entities/comment.entities";
import { UserRelationsEntity } from "./entities/userRelations.entities";
import { PostLikesEntity } from "./entities/postLikes.entities";

class DataManager {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: "postgres",
      host: ProcessManager.get("DB_HOST").str,
      port: ProcessManager.get("DB_PORT").num,
      username: ProcessManager.get("DB_USERNAME").str,
      password: ProcessManager.get("DB_PASSWORD").str,
      database: ProcessManager.get("DB_NAME").str,
      synchronize: true,
      logging: false,
      entities: this.getEntities(),
      subscribers: [],
      migrations: [],
    });
  }

  private getEntities() {
    return [
      UsersEntity,
      PasswordsEntity,
      PostsEntity,
      TagsEntity,
      ImagesEntity,
      CommentsEntity,
      UserRelationsEntity,
      PostLikesEntity,
    ];
  }

  get source() {
    return this.dataSource;
  }

  public async init() {
    return await this.dataSource.initialize();
  }

  public async cleanDB() {
    const entitiesMetadata = this.dataSource.entityMetadatas;
    for (const meta of entitiesMetadata) {
      await this.dataSource.query(`TRUNCATE TABLE ${meta.tableName} CASCADE`);
    }
  }

  public async close() {
    return await this.dataSource.destroy();
  }
}

export const dataManager = new DataManager();
