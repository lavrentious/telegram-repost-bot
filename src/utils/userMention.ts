import { User } from "grammy/out/types.node";
import { getFullName } from "./getFullName";
import { mentionById } from "./mentionById";

export function userMention(user: User) {
  if (user.username) return "@" + user.username;
  return mentionById(user.id, getFullName(user));
}
