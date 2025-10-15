
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { buildIndex, answerQuestion, storePath } from './search.js';
import { extractTextFromPdf } from './pdf.js';

const app = express();
const PORT = process.env.PORT || 8080;

// CORS permissive + preflight
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));

app.use(express.json({ limit: '5mb' }));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

const docs = new Map();
let nextId = 1;

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const buff = fs.readFileSync(req.file.path);
    const data = await extractTextFromPdf(buff); // { text, numpages }
    const text = (data?.text || '').trim();

    if (!text || text.length < 20) {
      return res.status(400).json({
        error: 'No extractable text found. This PDF may be a scanned/image-only file.',
        pages: data?.numpages ?? 0,
      });
    }

    const id = String(nextId++);
    const { chunks, tfidf } = buildIndex(text);
    docs.set(id, { id, name: req.file.originalname, chunks, tfidf });
    storePath(id, req.file.path);

    return res.json({
      id,
      name: req.file.originalname,
      pages: data?.numpages ?? 0,
      chunks: chunks.length
    });
  } catch (e) {
    console.error('UPLOAD ERROR:', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/files', (_req, res) => {
  const list = [...docs.values()].map(d => ({ id: d.id, name: d.name, chunks: d.chunks.length }));
  res.json(list);
});

app.post('/ask', async (req, res) => {
  try {
    const { question, ids } = req.body || {};
    if (!question || !String(question).trim()) return res.status(400).json({ error: 'question is required' });
    const selected = (ids && ids.length ? ids : [...docs.keys()]).map(id => docs.get(String(id))).filter(Boolean);
    if (!selected.length) return res.status(400).json({ error: 'No documents indexed' });

    const results = [];
    for (const d of selected) results.push(...answerQuestion(question, d));
    results.sort((a,b) => b.score - a.score);
    const top = results.slice(0, 6);

    const apiKey = process.env.OPENAI_API_KEY || '';
    const model = process.env.MODEL || 'gpt-4o-mini';
    if (!apiKey) {
      return res.json({ mode: 'LOCAL_EXTRACT', answer: top.map(t=>t.text).join('\n\n---\n\n'), contexts: top });
    }

    const { default: fetch } = await import('node-fetch');
    const context = top.map((t,i)=> `# Chunk ${i+1}\n${t.text}`).join('\n\n');
    const prompt = `Use ONLY the context to answer.\n\n${context}\n\nQuestion: ${question}\nAnswer succinctly. If not found, say so.`;
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body: JSON.stringify({ model, messages:[{role:'user', content:prompt}] })
    });
    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content ?? '(No answer)';
    return res.json({ mode:'OPENAI', answer, contexts: top });
  } catch (e) {
    console.error('ASK ERROR:', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`KBSE Alt server (pdfjs) listening on http://localhost:${PORT}`);
});
