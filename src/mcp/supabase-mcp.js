import { createClient } from '@supabase/supabase-js'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Get Supabase credentials from environment or use defaults for testing
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Missing Supabase credentials. Some endpoints may not work properly.')
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabase: {
      url: supabaseUrl ? 'configured' : 'missing',
      key: supabaseKey ? 'configured' : 'missing'
    }
  })
})

// Simple endpoint to list tables (example for Cursor prompt)
app.get('/tables', async (req, res) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase not configured',
        message: 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
      })
    }

    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
    
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    res.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    })
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Test Supabase connection
app.get('/test-connection', async (req, res) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase not configured',
        message: 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
      })
    }

    // Try to get the current user session to test connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase auth error:', error)
      return res.status(500).json({ 
        error: 'Supabase connection failed',
        details: error.message 
      })
    }
    
    res.json({ 
      success: true, 
      message: 'Supabase connection successful',
      session: data.session ? 'active' : 'none'
    })
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Add more routes like create table, insert row, etc., based on prompts

const PORT = process.env.MCP_PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Supabase MCP tool running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Test connection: http://localhost:${PORT}/test-connection`)
  console.log(`📋 List tables: http://localhost:${PORT}/tables`)
  
  if (!supabaseUrl || !supabaseKey) {
    console.log(`⚠️  Warning: Supabase credentials not configured`)
    console.log(`   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment`)
  } else {
    console.log(`✅ Supabase configured successfully`)
  }
}) 