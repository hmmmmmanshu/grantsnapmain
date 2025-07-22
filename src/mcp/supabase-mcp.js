const { createClient } = require('@supabase/supabase-js')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Simple endpoint to list tables (example for Cursor prompt)
app.get('/tables', async (req, res) => {
  const { data, error } = await supabase.rpc('pg_catalog.pg_tables')
  if (error) return res.status(500).json({ error })
  res.json(data)
})

// Add more routes like create table, insert row, etc., based on prompts

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Supabase MCP tool running on http://localhost:${PORT}`)
}) 