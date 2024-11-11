# telegram-repost-bot

накиданный за вечер простецкий телеграм бот-предложкер

при получении сообщения от пользователя, пересылает его заданному пользователю-админу

ответом на пересланное сообщение админ отвечает пользователю через бота

## сделано с помощью

- [grammy.js](https://grammy.dev/)
- [pnpm](https://pnpm.io/)
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
- [croner](https://croner.56k.guru/)

## env
При `start:dev` загружает `development.env`, при `start` — `production.env`
```env
TOKEN="" # токен бота тг
ADMIN_ID=123 # id пользователя-админа в тг
DB_PATH="./db" # локальный путь к файлу БД SQLite 
```
