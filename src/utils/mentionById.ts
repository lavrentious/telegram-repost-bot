import { escapeMarkdown } from "./escapeMarkdown";

export const EMPTY_CHAR = `\u200b`;

export function mentionById(userId: number | string, str: string = EMPTY_CHAR) {
  return `[${escapeMarkdown(str)}](tg://user?id=${userId})`;
}
