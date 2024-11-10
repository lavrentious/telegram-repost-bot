import { ChatMember } from "grammy/out/types.node";

export function isLeft(status: ChatMember["status"]) {
  return (["kicked", "left"] as ChatMember["status"][]).includes(status);
}
