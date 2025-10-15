
import React, { useState, useEffect } from 'react'

const API = ''

export default function App() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [question, setQuestion] = useState('What are the main topics in this document?')
  const [answer, setAnswer] = useState(null)
  const [contexts, setContexts] = useState([])
  const [selected, setSelected] = useState([])

  const refresh = async () => {
    const r = await fetch(`${API}/files`)
    const j = await r.json()
    setFiles(j)
  }
  useEffect(() => { refresh() }, [])

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    const r = await fetch(`${API}/upload`, { method: 'POST', body: fd })
    const j = await r.json()
    setUploading(false)
    if (!r.ok) { alert(`Upload failed: ${j.error || r.statusText}`); return; }
    alert(`${j.name} indexed with ${j.chunks} chunks.`)
    refresh()
  }

  const ask = async () => {
    setAnswer('')
    setContexts([])
    const r = await fetch(`${API}/ask`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ question, ids: selected }) })
    const j = await r.json()
    setAnswer(j.answer || j.error)
    setContexts(j.contexts || [])
  }

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  return (
    <>
      <div className="header">
        <div className="h1">Knowledge Base Search Engine – Alt</div>
        <div className="sub">Different UI & codebase. Upload PDFs and ask questions. Local TF‑IDF or optional OpenAI.</div>
      </div>

      <div className="shell">
        <div className="card">
          <div className="badge">
            <span>📄 Upload PDF</span>
          </div>
          <input className="input" type="file" accept="application/pdf" onChange={onUpload} />
          <div className="small" style={{marginTop:8}}>{uploading ? 'Uploading & indexing…' : 'Only PDF supported.'}</div>
          <div className="list">
            {files.map(f => (
              <div className="file" key={f.id}>
                <div>
                  <div style={{fontWeight:700}}>{f.name}</div>
                  <div className="small">{f.chunks} chunks</div>
                </div>
                <label className="small">
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={()=>toggle(f.id)} /> Use
                </label>
              </div>
            ))}
          </div>
          <div className="small">If none selected, all files are used.</div>
          <div style={{marginTop:12}} className="small">
            Server health: <a className="link" href={`${API}/health`} target="_blank">/health</a>
          </div>
        </div>

        <div className="card">
          <div className="badge">🔍 Ask a question</div>
          <textarea className="input qbox" value={question} onChange={e=>setQuestion(e.target.value)} />
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={ask}>Ask</button>
          </div>
          {answer && <div className="answer"><b>Answer:</b>\n\n{answer}</div>}
          {contexts.length>0 && <div style={{marginTop:12}}>
            <div className="small">Top matching chunks (for transparency)</div>
            {contexts.map((c,i)=> (
              <div key={i} className="ctx"><b>Score:</b> {c.score.toFixed(4)}<br/>{c.text.slice(0,800)}{c.text.length>800?'…':''}</div>
            ))}
          </div>}
        </div>
      </div>
    </>
  )
}
