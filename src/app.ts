// Load environment variables
import 'dotenv/config'

// Core modules
import Fastify from 'fastify'
import cors from '@fastify/cors'

// Response manager
import { User, CreateUserDto, UpdateUserDto } from './type.js'
import {
  ok,
  created,
  notfound,
  conflict,
  servererror,
  badrequest,
} from './response.js'

// Services and schemas
import {
  validateId,
  isEmailTaken,
  hasReachedUserLimit,
} from './user.service.js'
import {
  idParamSchema,
  createUserSchema,
  updateUserSchema,
} from './user.schema.js'

// In-memory data store (resets every time the server restarts)
let users: User[] = []
let nextId = 1 // simple auto-increment ID generator

// Factory function to create the Fastify application
export function createApp() {
  const app = Fastify({ logger: true }) // logger prints requests and errors

  // Enable CORS for external clients
  app.register(cors, { origin: true })

  // Health check route
  app.get('/', async (_req, reply) => ok(reply, null, 'Server works'))

  // -----------------------
  // USERS COLLECTION ROUTES
  // -----------------------

  // GET /users → List all users
  app.get('/users', async (_req, reply) => ok(reply, users, 'List of users'))

  // POST /users → Create a new user
  app.post(
    '/users',
    { schema: { body: createUserSchema } },
    async (req, reply) => {
      const { name, email } = req.body as CreateUserDto

      // 🔹 Check maximum users limit
      if (hasReachedUserLimit(users)) {
        return badrequest(
          reply,
          'Cannot register more users: memory limit reached'
        )
      }

      // 🔹 Check for duplicate email
      if (isEmailTaken(users, email)) {
        return conflict(reply, 'Email already registered')
      }

      // 🔹 Create user and validate ID
      const newUser: User = { id: nextId++, name, email }
      if (!validateId(newUser.id)) {
        return badrequest(reply, 'User ID exceeds maximum allowed value')
      }

      users.push(newUser)

      // 🔹 Return standardized created response
      reply.header('Location', `/users/${newUser.id}`)
      return created(reply, newUser, 'User created successfully')
    }
  )

  // PUT /users/:id → Update a user
  app.put(
    '/users/:id',
    { schema: { params: idParamSchema, body: updateUserSchema } },
    async (req, reply) => {
      const { id } = req.params as { id: number }
      const { name, email } = req.body as UpdateUserDto

      // 🔹 Validate ID
      if (!validateId(id)) return badrequest(reply, 'Invalid user ID')

      const user = users.find(u => u.id === id)
      if (!user) return notfound(reply, 'User not found')

      // 🔹 Check for duplicate email when updating
      if (email && isEmailTaken(users, email, id)) {
        return conflict(reply, 'Email already registered')
      }

      // 🔹 Update fields
      if (name !== undefined) user.name = name
      if (email !== undefined) user.email = email

      return ok(reply, user, 'User updated successfully')
    }
  )

  // DELETE /users/:id → Remove a user
  app.delete(
    '/users/:id',
    { schema: { params: idParamSchema } },
    async (req, reply) => {
      const { id } = req.params as { id: number }

      if (!validateId(id)) return badrequest(reply, 'Invalid user ID')

      const index = users.findIndex(u => u.id === id)
      if (index === -1) return notfound(reply, 'User not found')

      const [deleted] = users.splice(index, 1)
      return ok(reply, deleted, 'User deleted successfully')
    }
  )

  // -----------------------
  // GLOBAL ERROR HANDLER
  // -----------------------
  app.setErrorHandler((err, _req, reply) => {
    // 🔹 Log the error for debugging
    app.log.error(err)

    // 🔹 Return standardized internal server error response
    return servererror(reply, err.message)
  })

  return { app }
}
