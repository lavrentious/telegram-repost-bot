import { Conversation } from "@grammyjs/conversations";
import { Bot, Context } from "grammy";
import { config } from "./config.service";
import { logger } from "./logger";
import { mainSerivce } from "./main.service";

export type MyContext = Context;
export type MyConversation = Conversation<MyContext>;

export const bot = new Bot<MyContext>(config.get("TOKEN"));
mainSerivce.setBot(bot);

async function start() {
  bot.catch(async (err) => {
    logger.error(err.error);
    await err.ctx.reply("error occurred");
  });

  bot.command("start", async (ctx) => {
    await ctx.reply("hello kent");
  });

  bot.on("message", async (ctx) => {
    mainSerivce.handleMessage(ctx);
  });

  bot.start({
    onStart: async () => {
      logger.info("bot started");
    },
    allowed_updates: ["message", "chat_member", "callback_query"],
  });
}

start();
