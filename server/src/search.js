
import fs from 'fs';
import path from 'path';

const storeFile = path.join(process.cwd(), 'uploads', '.paths.json');
export function storePath(id, p) {
  let m = {};
  try { m = JSON.parse(fs.readFileSync(storeFile, 'utf8')); } catch {}
  m[id] = p;
  fs.writeFileSync(storeFile, JSON.stringify(m, null, 2));
}

function tokenize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function chunkText(text, size=900, overlap=120) {
  const words = tokenize(text);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const slice = words.slice(i, i + size);
    chunks.push(slice.join(' '));
    i += (size - overlap);
  }
  return chunks;
}

export function buildIndex(text) {
  const chunks = chunkText(text);
  const dfs = new Map();
  const tfs = chunks.map(ch => {
    const counts = new Map();
    const toks = ch.split(/\s+/).filter(Boolean);
    for (const t of toks) counts.set(t, (counts.get(t)||0)+1);
    for (const t of new Set(toks)) dfs.set(t, (dfs.get(t)||0)+1);
    return { counts, len: toks.length };
  });
  const N = chunks.length;
  const idf = (t) => Math.log((1+N)/((dfs.get(t)||0)+1)) + 1;
  const tfidf = tfs.map(tf => {
    const w = new Map();
    for (const [t,c] of tf.counts) {
      w.set(t, (c/tf.len) * idf(t));
    }
    return w;
  });
  return { chunks, tfidf };
}

function cosineScore(qvec, dvec) {
  let dot = 0, qn=0, dn=0;
  for (const [,v] of qvec) qn += v*v;
  for (const [,v] of dvec) dn += v*v;
  const small = qvec.size < dvec.size ? qvec : dvec;
  const large = qvec.size < dvec.size ? dvec : qvec;
  for (const [t, v] of small) {
    const dv = large.get(t);
    if (dv) dot += v*dv;
  }
  return dot / (Math.sqrt(qn)*Math.sqrt(dn) + 1e-9);
}

export function answerQuestion(question, doc) {
  const qTokens = question.toLowerCase().split(/\W+/).filter(Boolean);
  const qCounts = new Map();
  for (const t of qTokens) qCounts.set(t, (qCounts.get(t)||0)+1);

  const dfs = new Map();
  for (const vec of doc.tfidf) for (const [t] of vec) dfs.set(t, (dfs.get(t)||0)+1);
  const N = doc.tfidf.length;
  const idf = (t) => Math.log((1+N)/((dfs.get(t)||0)+1)) + 1;
  const qvec = new Map();
  const qlen = qTokens.length || 1;
  for (const [t,c] of qCounts) qvec.set(t, (c/qlen) * idf(t));

  const results = [];
  for (let i=0;i<doc.tfidf.length;i++) {
    const score = cosineScore(qvec, doc.tfidf[i]);
    results.push({ score, index: i, text: doc.chunks[i] });
  }
  results.sort((a,b)=> b.score - a.score);
  return results.slice(0, 8);
}
