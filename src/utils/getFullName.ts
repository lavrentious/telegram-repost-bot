import { User } from "grammy/out/types.node";

export function getFullName(user: User) {
  return [user.first_name, user.last_name]
    .filter((e): e is string => e != null)
    .join(" ");
}
