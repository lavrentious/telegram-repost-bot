import Database, { Database as DatabaseType } from "better-sqlite3";
import { Cron } from "croner";
import { config } from "./config.service";
import { logger } from "./logger";

export type ResultType = {
  forwarded_message_id: number;
  original_message_id: number;
  original_user_id: number;
  created_at: Date;
};
export class DBService {
  private static _instance: DBService;
  private db: DatabaseType;
  private cleanupJob: Cron | null = null;

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  constructor() {
    this.db = new Database(config.get("DB_PATH"));
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS message_map (
        forwarded_message_id INTEGER PRIMARY KEY,
        original_message_id INTEGER NOT NULL,
        original_user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.cleanupJob = this.initCleanupJob();
    this.cleanup();
  }

  private initCleanupJob() {
    logger.info("initializing cleanup job");
    return new Cron("0 0 * * *", () => {
      this.cleanup();
    });
  }

  private cleanup() {
    logger.info("running cleanup...");
    const query = this.db.prepare(
      "DELETE FROM message_map WHERE created_at <= datetime('now', '-1 month')",
    );
    const res = query.run();
    logger.info(`deleted ${res.changes} old records`);
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
  ): ResultType | null {
    const query = this.db.prepare(
      "SELECT * FROM message_map WHERE forwarded_message_id = ?",
    );
    const result: any = query.get(forwardedMessageId);
    let ans: ResultType | null = null;
    if (result) {
      ans = {
        ...result,
        created_at: new Date(result.created_at),
      };
    }
    logger.debug("result " + JSON.stringify(ans));
    return ans;
  }
}

export const dbService = DBService.instance;
