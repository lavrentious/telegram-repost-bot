# telegram-repost-bot

накиданный за вечер простецкий телеграм бот-предложка для тг каналов

при получении сообщения от пользователя, пересылает его заданному пользователю-админу

ответом на пересланное сообщение админ отвечает пользователю через бота

## скрипты
 - `build` - собирает проект в `./dist` (компилирует typescript через `tsc`)
 - `start` - запускает собранный проект (из `./dist`)
 - `start:dev` - запускает проект в режиме разработки с автопересборкой (через `nodemon`)

## env
При `start:dev` загружает `development.env`, при `start` — `production.env`
```env
TOKEN="" # токен бота тг
ADMIN_ID=123 # id пользователя-админа в тг
DB_PATH="./db" # локальный путь к файлу БД SQLite 
```

## установка и запуск
1. создать соответствующий `.env` файл
2. `pnpm i`
3. `pnpm run build` или `bun run build`
4. `pnpm run start` или `bun run start`

или `pnpm run start:dev` вместо последних 2 пунктов для локальной разработки

## сделано с помощью
- [grammy.js](https://grammy.dev/)
- [pnpm](https://pnpm.io/)
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
- [croner](https://croner.56k.guru/)