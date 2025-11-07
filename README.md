# Reaction Roles Bot — v2 (Koyeb Ready)

Lightweight, modular Discord Reaction Roles bot with improved emoji handling (unicode, custom, animated), global slash commands, JSON persistence, and rotating presence. Prepared for deployment to **Koyeb**.

---

## Features
- Global slash commands (available across all servers where the bot is invited)
- Full reaction-role lifecycle: create message, add mapping, remove mapping, list, delete
- Role groups (pick-one behavior), timed roles, autorole for new members
- JSON-based persistent storage (`data.json`) — persists across restarts
- Robust emoji parsing: supports unicode emojis and custom (including animated) emojis
- Rotating status/presence customizable via `config.json` (live reload supported)
- Logs emoji parsing and important actions to console for debugging

---

## Files
```
reaction-roles-bot-v2/
├── commands/ (all slash command files)
├── utils/
│   ├── database.js
│   └── roleManager.js
├── config.json
├── data.json
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

---

## Deployment — Koyeb (Step-by-step)

1. Push this repository to GitHub (repo root must contain `package.json`).

2. Create a new app on Koyeb:
   - Go to https://app.koyeb.com → Create → App → Connect to GitHub repository.

3. In the **Build & Run** settings:
   - **Build command:** `npm install`
   - **Start command:** `node index.js`
   - **Environment:** Node.js 20.x is recommended (declared in `package.json`)

4. Add Environment Variables in Koyeb app settings:
   - `BOT_TOKEN` = your Discord bot token (from Discord Developer Portal)
   - `CLIENT_ID` = your Application (Client) ID

5. Deploy. Global slash commands may take up to an hour to appear. For faster testing, invite the bot to a test server and use per-guild registration (not enabled by default).

### Troubleshooting
- **Missing lockfile error:** `package-lock.json` is included to satisfy buildpack detection. Koyeb will still run `npm install`.
- **Bot cannot assign roles:** Ensure the bot's role is above the roles it needs to assign and has `MANAGE_ROLES` permission.
- **Emojis not mapping:** Use the `/radd` or `/rmessage` command with either a raw unicode emoji (like ✅) or a custom emoji mention like `<:name:123456789012345678>` or `<a:name:123456789012345678>` for animated. The bot normalizes these formats.

---

## Configuration (`config.json`)
Edit `config.json` to change the bot's status type, activity type, messages (max 5) and rotation interval (ms). The bot supports live reload of this file; edits will be applied without restart.

Example:
```json
{
  "statusType": "online",
  "activityType": "PLAYING",
  "activityInterval": 30000,
  "activities": [
    "Managing roles ⚙️",
    "Helping servers 🌐"
  ]
}
```

---

## Command usage examples

- Create reaction-role message:
  `/rmessage channel:#roles mappings:✅:@Member,👍:<@&ROLE_ID>`
  - Mappings accept either role mentions or role IDs. Emojis may be unicode or custom (`<:name:id>`).

- Add mapping to existing message:
  `/radd messageid:123456789012345678 mapping:❤️:<@&ROLE_ID>`

- Remove mapping:
  `/rremove messageid:123 mapping:❤️`

- List configured messages:
  `/rlist`

- Delete configuration:
  `/rdelete messageid:123`

- Create group:
  `/groupcreate name:colors`

- Add role to group:
  `/groupadd name:colors role:@Red`

- Timed role (minutes):
  `/timedrole user:@User role:@Temp minutes:60`

- Autorole add/clear:
  `/autorole action:add role:@Member`
  `/autorole action:clear`

- Help:
  `/help`

---

## Notes on Emoji Input & Storage
- Unicode emoji are stored as their character(s), e.g. "✅".
- Custom emojis (static or animated) are stored by their numeric ID, e.g. "123456789012345678".
- Commands accept either raw unicode emoji, or custom emoji in the format `<:name:id>` or `<a:name:id>`.
- The bot logs emoji parsing actions like `Parsed custom emoji: party (ID: 123456789)` to the console for debugging.

---

If you want any change (e.g., per-guild registration for instant testing, SQLite instead of JSON, or more logging), tell me and I’ll produce another ZIP.
