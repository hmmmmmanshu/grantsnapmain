import { createServer } from 'http'
import { URL } from 'url'

// Create HTTP server
const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname
  const method = req.method

  // Set content type
  res.setHeader('Content-Type', 'application/json')

  // Route handling
  if (method === 'GET') {
    switch (path) {
      case '/health':
        res.writeHead(200)
        res.end(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
          message: 'MCP Server is running successfully!',
          endpoints: [
            '/health - Server health check',
            '/test - Test endpoint',
            '/info - Project information',
            '/mock-data - Sample data for testing',
            '/test-connection - Test connection endpoint',
            '/tables - List database tables'
          ]
        }))
        break

      case '/test':
        res.writeHead(200)
        res.end(JSON.stringify({ 
          success: true, 
          message: 'MCP Server is working!',
          timestamp: new Date().toISOString()
        }))
        break

      case '/info':
        res.writeHead(200)
        res.end(JSON.stringify({
          project: 'Grants Snap',
          description: 'AI-powered Funding Command Center for entrepreneurs',
          version: '1.0.0',
          status: 'Development',
          features: [
            'Chrome Extension for opportunity capture',
            'Web Dashboard for management',
            'AI-powered autofill',
            'Team management',
            'Document storage'
          ],
          techStack: [
            'Frontend: Vite + React + TypeScript',
            'Styling: Tailwind CSS + Shadcn/UI',
            'Backend: Supabase',
            'Payment: Stripe',
            'AI: OpenAI'
          ]
        }))
        break

      case '/mock-data':
        res.writeHead(200)
        res.end(JSON.stringify({
          opportunities: [
            {
              id: '1',
              title: 'Tech Startup Grant 2024',
              funder: 'Innovation Foundation',
              amount: 50000,
              deadline: '2024-12-31',
              status: 'Interested',
              type: 'grant'
            },
            {
              id: '2',
              title: 'Seed Funding Round',
              funder: 'Venture Capital Partners',
              amount: 250000,
              deadline: '2024-11-15',
              status: 'Applied',
              type: 'investor'
            }
          ],
          teamMembers: [
            {
              id: '1',
              name: 'John Doe',
              role: 'CEO',
              email: 'john@startup.com',
              skills: ['Leadership', 'Strategy', 'Business Development']
            },
            {
              id: '2',
              name: 'Jane Smith',
              role: 'CTO',
              email: 'jane@startup.com',
              skills: ['Software Development', 'Architecture', 'Team Management']
            }
          ],
          skills: [
            { id: '1', name: 'Leadership', category: 'Management' },
            { id: '2', name: 'Software Development', category: 'Technical' },
            { id: '3', name: 'Business Development', category: 'Business' },
            { id: '4', name: 'Marketing', category: 'Business' }
          ]
        }))
        break

      case '/test-connection':
        res.writeHead(200)
        res.end(JSON.stringify({ 
          success: true, 
          message: 'MCP Server connection successful',
          note: 'This is a mock connection test. Real Supabase integration would require environment variables.',
          environment: {
            supabase_url: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
            supabase_key: process.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'missing'
          }
        }))
        break

      case '/tables':
        res.writeHead(200)
        res.end(JSON.stringify({ 
      success: true, 
          data: [
            { table_name: 'user_profiles', table_schema: 'public' },
            { table_name: 'user_documents', table_schema: 'public' },
            { table_name: 'tracked_grants', table_schema: 'public' },
            { table_name: 'opportunities', table_schema: 'public' },
            { table_name: 'team_members', table_schema: 'public' },
            { table_name: 'team_projects', table_schema: 'public' },
            { table_name: 'skills', table_schema: 'public' },
            { table_name: 'ai_team_recommendations', table_schema: 'public' },
            { table_name: 'notification_preferences', table_schema: 'public' }
          ],
          count: 9,
          note: 'This is mock data. Real table listing would require Supabase connection.'
        }))
        break

      default:
        res.writeHead(404)
        res.end(JSON.stringify({ 
          error: 'Not Found', 
          message: `Endpoint ${path} not found`,
          availableEndpoints: [
            '/health', '/test', '/info', '/mock-data', '/test-connection', '/tables'
          ]
        }))
    }
  } else {
    res.writeHead(405)
    res.end(JSON.stringify({ 
      error: 'Method Not Allowed', 
      message: `${method} method not allowed on ${path}` 
    }))
  }
})

const PORT = process.env.MCP_PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Grants Snap MCP Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`)
  console.log(`📋 Project info: http://localhost:${PORT}/info`)
  console.log(`📊 Mock data: http://localhost:${PORT}/mock-data`)
  console.log(`🔗 Test connection: http://localhost:${PORT}/test-connection`)
  console.log(`📋 List tables: http://localhost:${PORT}/tables`)
  console.log(`\n✅ MCP Server started successfully!`)
  console.log(`⚠️  Note: This is a mock server for testing. Real Supabase integration requires environment variables.`)
})

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down MCP Server...')
  server.close(() => {
    console.log('✅ MCP Server stopped')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down MCP Server...')
  server.close(() => {
    console.log('✅ MCP Server stopped')
    process.exit(0)
  })
}) 