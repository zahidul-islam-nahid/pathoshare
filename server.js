import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001
const DATA_DIR = path.resolve('./data')
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json')

// Disable etag/caching for API responses
app.disable('etag')
app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); })

app.use(cors())
app.use(express.json({ limit: '5mb' }))

function ensureDataDir(){
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(REPORTS_FILE)) fs.writeFileSync(REPORTS_FILE, '[]', 'utf8')
}

function readReports(){
  ensureDataDir()
  try { return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8') || '[]') } catch { return [] }
}

function writeReports(reports){
  ensureDataDir()
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf8')
}

// List all
app.get('/api/reports', (req, res) => {
  return res.json(readReports())
})

// Get one
app.get('/api/reports/:id', (req, res) => {
  const list = readReports()
  const found = list.find(r => r.id === req.params.id)
  if(!found) return res.status(404).json({ error: 'Not found' })
  return res.json(found)
})

// Create
app.post('/api/reports', (req, res) => {
  const incoming = req.body
  if(!incoming || typeof incoming !== 'object' || !incoming.id) {
    return res.status(400).json({ error: 'Invalid report' })
  }
  const list = readReports()
  if (list.find(r => r.id === incoming.id)) {
    return res.status(409).json({ error: 'Already exists' })
  }
  list.unshift(incoming)
  writeReports(list)
  return res.json({ ok: true })
})

// Update
app.put('/api/reports/:id', (req, res) => {
  const id = req.params.id
  const incoming = req.body
  const list = readReports()
  const idx = list.findIndex(r => r.id === id)
  if(idx === -1) return res.status(404).json({ error: 'Not found' })
  list[idx] = incoming
  writeReports(list)
  return res.json({ ok: true })
})

// Delete
app.delete('/api/reports/:id', (req, res) => {
  const id = req.params.id
  const list = readReports().filter(r => r.id !== id)
  writeReports(list)
  return res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Data server running at http://localhost:${PORT}`)
})



