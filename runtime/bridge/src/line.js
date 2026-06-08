// line.js — LINE Messaging API ヘルパー（署名検証 / 返信）
import crypto from 'node:crypto';

/**
 * LINE Webhook 署名検証（X-Line-Signature）
 * @param {Buffer|string} rawBody リクエストの生ボディ
 * @param {string} signature ヘッダ値
 * @param {string} secret チャンネルシークレット
 */
export function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const mac = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  const a = Buffer.from(mac);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * 返信メッセージ送信（reply API）
 * @param {string} replyToken
 * @param {object|object[]} messages
 * @param {string} token チャンネルアクセストークン
 */
export async function replyMessage(replyToken, messages, token) {
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages: Array.isArray(messages) ? messages : [messages] }),
  });
  if (!res.ok) throw new Error(`LINE reply failed: ${res.status} ${await res.text()}`);
  return res.status;
}
