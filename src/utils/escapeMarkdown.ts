export function escapeMarkdown(str: string): string {
  const specialCharsRegex = /[\\`*_{}[\]()#+\-.!]/g;
  return str.replace(specialCharsRegex, "\\$&");
}
