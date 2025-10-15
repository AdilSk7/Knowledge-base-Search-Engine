import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

export async function extractTextFromPdf(filePathOrBuffer) {
  const raw = Buffer.isBuffer(filePathOrBuffer)
    ? filePathOrBuffer
    : fs.readFileSync(filePathOrBuffer);

  // ✅ pdfjs wants a Uint8Array (not Buffer in some envs)
  const data = new Uint8Array(raw);

  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return { text, numpages: pdf.numPages };
}
