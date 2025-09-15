// Imports
import { createApp } from './app.js'

// Variables
const { app } = createApp() // Get the app instance
const PORT = Number(process.env['PORT']) || 3001 // Get PORT from environment variables or use default port

// Running server
app.listen({ port: PORT }, () => {
  console.log(
    [
      `API Server started on PORT :${PORT}`,
      'Press CTRL-C to stop',
      '',
      'Index:',
      `http://localhost:${PORT}/`,
      '',
    ].join('\n')
  )
})
