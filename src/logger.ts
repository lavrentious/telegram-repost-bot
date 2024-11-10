import path from "path";
import { createLogger, format, transports } from "winston";

const logFileName = new Date().toDateString() + ".log";
const logDir = path.join(__dirname, "../logs");
const timeFormat = "DD.MM.YYYY HH:mm:ss";

const myFormat = format.printf(({ timestamp, level, message, ...info }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(info).length !== 0) {
    msg += "\n" + JSON.stringify(info, null, 2) + "\n";
  }
  return msg;
});

export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "verbose" : "debug",
  format: format.combine(
    format.errors({ stack: true }),
    format.colorize(),
    format.timestamp({ format: timeFormat }),
    myFormat,
  ),
  transports: [
    new transports.File({
      format: format.combine(format.uncolorize()),
      filename: path.join(logDir, logFileName),
      tailable: true,
    }),
    new transports.Console(),
  ],
});
