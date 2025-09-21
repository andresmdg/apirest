// Load environment variables
import 'dotenv/config'

// Core modules
import Fastify from 'fastify'
import cors from '@fastify/cors'

// In-memory data store (resets every time the server restarts)
let users: { id: number; name: string; email: string }[] = []
let nextId = 1 // simple auto-increment ID generator

// Factory function to create the Fastify application
export function createApp() {
  const app = Fastify({ logger: true }) // logger prints requests and errors

  // Enable CORS so the API can be consumed from browsers or external clients
  app.register(cors, { origin: true })

  // Health check route (useful for monitoring or quick status tests)
  app.get('/', async () => ({ success: true, message: 'Server works' }))

  // -----------------------
  // USERS COLLECTION ROUTES
  // -----------------------

  // GET /users → List all users
  app.get('/users', async (_req, reply) => {
    // Always return an array (empty if there are no users)
    return reply.code(200).send(users)
  })

  // POST /users → Create a new user
  app.post(
    '/users',
    {
      // Validation schema using Fastify built-in JSON schema
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            email: {
              type: 'string',
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', // simple email regex
            },
          },
          required: ['name', 'email'],
          additionalProperties: false, // reject unexpected fields
        },
      },
    },
    async (req, reply) => {
      // Extract only allowed properties from request body
      const { name, email } = req.body as { name: string; email: string }

      // Check for duplicate email (case insensitive)
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return reply.code(409).send({ error: 'Email already registered' })
      }

      // Create a new user object and add it to the in-memory collection
      const newUser = { id: nextId++, name, email }
      users.push(newUser)

      // Return "201 Created" with Location header pointing to the new resource
      reply.header('Location', `/users/${newUser.id}`)
      return reply.code(201).send(newUser)
    }
  )

  // Update an user information by ID
  app.put(
    '/users/:id',
    {
      // Validate "id" param to ensure it's numeric and body for allowed fields
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            email: {
              type: 'string',
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', // simple email regex
            },
          },
          additionalProperties: false, // reject unexpected fields
        },
      },
    },
    async (req, reply) => {
      const id = Number((req.params as { id: string }).id)
      const { name, email } = req.body as {
        name?: string
        email?: string
      }

      // Find the user by ID
      const user = users.find(u => u.id === id)
      if (!user) {
        // If user not found, return 404
        return reply.code(404).send({ error: 'User not found' })
      }

      // If email is being updated, check for duplicates (case insensitive)
      if (
        email &&
        users.some(
          u => u.id !== id && u.email.toLowerCase() === email.toLowerCase()
        )
      ) {
        return reply.code(409).send({ error: 'Email already registered' })
      }

      // Update only provided fields
      if (name !== undefined) user.name = name
      if (email !== undefined) user.email = email

      // Return the updated user
      return reply.code(200).send(user)
    }
  )

  // DELETE /users/:id → Remove a user by ID
  app.delete(
    '/users/:id',
    {
      // Validate "id" param to ensure it's numeric
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
          required: ['id'],
        },
      },
    },
    async (req, reply) => {
      const id = Number((req.params as { id: string }).id)

      // Find the index of the user in the array
      const index = users.findIndex(u => u.id === id)

      if (index === -1) {
        // If user not found, return 404
        return reply.code(404).send({ error: 'User not found' })
      }

      // Remove user from array and return it in the response
      const [deleted] = users.splice(index, 1)
      return reply.code(200).send({ success: true, deleted })
    }
  )

  // -----------------------
  // GLOBAL ERROR HANDLER
  // -----------------------
  // Catches unhandled errors and prevents repeating try/catch blocks everywhere
  app.setErrorHandler((err, _req, reply) => {
    app.log.error(err)
    reply.code(500).send({ error: 'An error has occurred' })
  })

  return { app }
}
