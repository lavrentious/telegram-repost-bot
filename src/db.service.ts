import Database, { Database as DatabaseType } from "better-sqlite3";
import { config } from "./config.service";
import { logger } from "./logger";

export type ResultType = {
  forwarded_message_id: number;
  original_message_id: number;
  original_user_id: number;
};
export class DBService {
  private static _instance: DBService;
  private db: DatabaseType;

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  constructor() {
    this.db = new Database(config.get("DB_PATH"));
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS message_map (
        forwarded_message_id INTEGER PRIMARY KEY,
        original_message_id INTEGER NOT NULL,
        original_user_id INTEGER NOT NULL
      )
    `);
  }
  public saveMessageMapping(
    forwardedMessageId: number,
    originalMessageId: number,
    originalUserId: number,
  ) {
    if (this.getOriginalMessageByForwardedMessage(forwardedMessageId)) {
      logger.debug(
        `message id=${forwardedMessageId} mapping already exists, skipping`,
      );
      return;
    }

    logger.debug(
      `Saving message mapping for forwarded message ${forwardedMessageId} and original user ${originalUserId}`,
    );
    const insert = this.db.prepare(
      "INSERT INTO message_map (forwarded_message_id, original_message_id, original_user_id) VALUES (?, ?, ?)",
    );
    insert.run(forwardedMessageId, originalMessageId, originalUserId);
  }

  public getOriginalMessageByForwardedMessage(
    forwardedMessageId: number,
  ): ResultType | undefined {
    const query = this.db.prepare(
      "SELECT * FROM message_map WHERE forwarded_message_id = ?",
    );
    const result: ResultType = query.get(forwardedMessageId) as ResultType;
    logger.debug("result " + JSON.stringify(result));
    return result;
  }
}

export const dbService = DBService.instance;
