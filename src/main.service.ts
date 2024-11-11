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
    if (
      ctx.from.id === config.get("ADMIN_ID") &&
      ctx.message?.reply_to_message
    ) {
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
      logger.info(
        `couldn't send admin reply to message ${ctx.message.reply_to_message.message_id}`,
      );
      await ctx.reply("Сообщение не доставлено (пользователь скрыт)");
      return;
    }
    try {
      await this.bot?.api.sendMessage(
        original.original_user_id,
        ctx.message?.text || "<пустое сообщение>",
        {
          reply_parameters: { message_id: original.original_message_id },
          entities: ctx.message?.entities,
        },
      );
      logger.info(
        `admin reply forwarded to user ${original.original_user_id}.`,
      );
    } catch (error) {
      logger.info("Failed to forward admin's reply to user");
      logger.error(error);
      await ctx.reply("Сообщение не доставлено");
    }
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }
}

export const mainSerivce = MainService.instance;
