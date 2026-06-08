#!/usr/bin/env node
// server.js — LINE Webhook 受信サーバ
// 起動: node src/server.js   (要 .env: LINE_CHANNEL_SECRET / LINE_CHANNEL_ACCESS_TOKEN)
//   GET  /          ヘルスチェック
//   POST /webhook   LINE Webhook 受け口
import http from 'node:http';
import { verifySignature, replyMessage } from './line.js';
import { handleText } from './handler.js';

const PORT = process.env.PORT || 3000;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const CHANNEL_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const AUTO_CREATE = process.env.BRIDGE_AUTO_CREATE === 'true';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('ikeda-os secretary bridge: ok');
    return;
  }
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404); res.end('not found');
    return;
  }

  const raw = await readBody(req);
  const sig = req.headers['x-line-signature'];
  if (!verifySignature(raw, sig, CHANNEL_SECRET)) {
    res.writeHead(401); res.end('invalid signature');
    return;
  }

  let body;
  try { body = JSON.parse(raw.toString('utf8')); }
  catch { res.writeHead(400); res.end('bad json'); return; }

  // LINEには即200を返す。処理は非同期で続行
  res.writeHead(200); res.end('ok');

  for (const ev of body.events || []) {
    if (ev.type === 'message' && ev.message?.type === 'text') {
      try {
        const reply = await handleText(ev.message.text, { autoCreate: AUTO_CREATE });
        if (CHANNEL_TOKEN) await replyMessage(ev.replyToken, reply, CHANNEL_TOKEN);
        else console.log('[reply(dry)]\n' + reply.text + '\n');
      } catch (e) {
        console.error('handle error:', e.message);
      }
    }
  }
});

server.listen(PORT, () => console.log(`ikeda-os bridge listening on :${PORT} (autoCreate=${AUTO_CREATE})`));
