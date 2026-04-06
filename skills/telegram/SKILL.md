---
name: telegram
description: >
  Send and receive Telegram messages via the Bot API. Use this when an agent
  needs to notify MoHan, request approval, or read replies from Telegram.
  Each agent that uses this skill must have its own bot token and chat_id
  configured via environment variables.
---

# Telegram Skill

This skill lets a Paperclip agent talk to MoHan over Telegram using the Bot API directly (curl). No third-party SDK, no daemon — just stateless HTTP calls.

## Required environment

- `TELEGRAM_BOT_TOKEN` — full Bot API token, e.g. `8345599321:AAEj6...`
- `TELEGRAM_CHAT_ID` — numeric chat id of the human you talk to (e.g. `7051404299`)

These should be set per-agent in Paperclip's adapter env, NEVER hardcoded in instructions or committed to git.

## When to use

- A long-running task finishes and MoHan should know
- You hit a blocker that needs a human decision
- You want to confirm a destructive action before running it
- Daily / heartbeat status digest

Do NOT spam. One message per meaningful event. Batch related updates.

## How to send a message

```bash
curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H 'content-type: application/json' \
  -d "$(jq -nc \
    --arg chat_id "$TELEGRAM_CHAT_ID" \
    --arg text "$YOUR_TEXT" \
    '{chat_id: $chat_id, text: $text, parse_mode: "Markdown"}')"
```

If `jq` is unavailable, build the JSON inline but escape quotes/newlines carefully.

Use `parse_mode: "Markdown"` for `*bold*`, `_italic_`, `` `code` ``, and links. Keep messages under ~3500 chars; split if longer.

## How to read replies

Polling-based (simple, fine for low volume):

```bash
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${LAST_UPDATE_ID:-0}&timeout=0"
```

Each call returns `result: [{ update_id, message: { text, chat: { id }, from } }]`. After processing, call again with `offset = max(update_id) + 1` so Telegram drops the consumed updates.

**WARNING:** if multiple processes call `getUpdates` on the same token, only one will get each update. If your bot is also wired into another tool (e.g. OpenClaw), prefer **webhooks** over polling, or accept that some replies will go to the other consumer.

## Etiquette

- Always start a notification with the agent name in brackets: `[COO]`, `[CTO]`, etc.
- Lead with the verdict (`✅ done`, `⚠ blocked`, `❓ approval needed`), then context
- Korean if the thread is Korean, English if it is English. Match MoHan's last message.
- Never expose secrets, tokens, or PII in messages
- For approval requests, include the exact action you want to take and a clear yes/no question

## Example

```bash
TEXT='[COO] ✅ 일일 크롤 완료 — 6/6 사이트 성공, 결과 `crawl_20260406.xlsx` 저장됨.'
curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H 'content-type: application/json' \
  -d "{\"chat_id\":\"${TELEGRAM_CHAT_ID}\",\"text\":\"${TEXT}\",\"parse_mode\":\"Markdown\"}"
```
