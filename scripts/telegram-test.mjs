#!/usr/bin/env node
// Quick Telegram bot smoke test for @AhyeonClaw_bot (COO).
// Usage: node scripts/telegram-test.mjs
//
// Step 1: This script calls getUpdates and prints any chat_id it finds.
// Step 2: If you pass --send <chat_id>, it sends a "hello from COO" test message.

const TOKEN = '8345599321:AAEj6MEMhdQd3L_e8br8T6_ixr5NDw2gRPI';
const API = `https://api.telegram.org/bot${TOKEN}`;

async function main() {
  const args = process.argv.slice(2);
  const sendIdx = args.indexOf('--send');
  if (sendIdx >= 0) {
    const chatId = args[sendIdx + 1];
    if (!chatId) {
      console.error('Usage: --send <chat_id>');
      process.exit(1);
    }
    const r = await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🤖 COO (@AhyeonClaw_bot) connected to Paperclip ✅\nMoska Studio test message.',
      }),
    });
    console.log('sendMessage:', r.status, await r.text());
    return;
  }

  console.log('1) getMe:');
  const me = await fetch(`${API}/getMe`).then((r) => r.json());
  console.log(JSON.stringify(me, null, 2));

  console.log('\n2) getUpdates (chat_id 찾기):');
  const upd = await fetch(`${API}/getUpdates`).then((r) => r.json());
  console.log(JSON.stringify(upd, null, 2));

  if (upd?.result?.length) {
    const chatIds = [
      ...new Set(
        upd.result
          .map((u) => u.message?.chat?.id ?? u.edited_message?.chat?.id ?? u.channel_post?.chat?.id)
          .filter(Boolean),
      ),
    ];
    console.log('\n발견된 chat_id:', chatIds);
    console.log(`\n다음 명령으로 테스트 메시지 전송:\n  node scripts/telegram-test.mjs --send ${chatIds[0]}`);
  } else {
    console.log('\n⚠ getUpdates 가 비어있음. Telegram 앱에서 @AhyeonClaw_bot 한테 아무 메시지나 한 번 보내고 다시 실행해.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
