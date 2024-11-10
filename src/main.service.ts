import { Bot } from "grammy";
import { MyContext } from ".";
import { config } from "./config.service";
import { dbService } from "./db.service";
import { logger } from "./logger";

class MainService {
  private static _instance: MainService;
  private bot: Bot<MyContext> | null;

  private constructor() {
    this.bot = null;
  }

  public setBot(bot: Bot<MyContext>) {
    this.bot = bot;
  }

  public async handleMessage(ctx: MyContext) {
    if (!ctx.from || !ctx.message) return;
    if (ctx.message?.reply_to_message) {
      return this.handleReply(ctx);
    }
    if (
      !ctx.from.is_bot &&
      ctx.hasChatType("private") &&
      ctx.from.id !== config.get("ADMIN_ID")
    ) {
      logger.info(
        `handling message from ${ctx.from.username ?? ctx.from.id} in ${
          ctx.chat.id
        }`,
      );

      ctx.reply("Ваше сообщение передано администратору");
      const newMessage = await ctx.forwardMessage(config.get("ADMIN_ID"));
      await dbService.saveMessageMapping(
        newMessage.message_id,
        ctx.message.message_id,
        ctx.from.id,
      );
    }
  }

  public async handleReply(ctx: MyContext) {
    if (
      !ctx.from ||
      !ctx.message?.reply_to_message ||
      !ctx.message.reply_to_message.forward_origin ||
      ctx.chat?.id !== config.get("ADMIN_ID")
    )
      return;

    const original = dbService.getOriginalMessageByForwardedMessage(
      ctx.message.reply_to_message.message_id,
    );
    logger.info(
      `handling reply to ` +
        JSON.stringify(ctx.message.reply_to_message, null, 2),
    );
    if (!original) {
      await ctx.reply(
        "message could not be delivered (user is anonymous and is not saved in the database)",
      );
      return;
    }
    try {
      await this.bot?.api.sendMessage(
        original.original_user_id,
        ctx.message?.text || "<No text in the reply>",
        { reply_parameters: { message_id: original.original_message_id } },
      );
      logger.debug(
        `admin reply forwarded to user ${original.original_user_id}.`,
      );
    } catch (error) {
      logger.error("Failed to forward admin's reply to user:", error);
      await ctx.reply("Failed to forward admin's reply to user: " + error);
    }
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }
}

export const mainSerivce = MainService.instance;
