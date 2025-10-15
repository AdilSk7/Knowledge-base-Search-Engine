
# KBSE Alt – Server (pdfjs-dist)

This server avoids `pdf-parse` entirely (which causes a Windows test-file error) and
uses `pdfjs-dist` to extract text from PDFs.

## Run
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
