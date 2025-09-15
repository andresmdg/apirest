// Modules
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'

// Imports
import { Service, isItem } from './services.js'

// Main function
export function createApp() {
  const app = Fastify({ logger: true })

  // Enable CORS
  app.register(cors, { origin: true })

  // Service contains the core logic for each route
  const service = new Service('db/data.json')

  // Service status check route
  app.get('/', async () => ({ success: true, message: 'Server works' }))

  // GET /:name → list a collection
  app.get(
    '/:name',
    {
      schema: {
        params: {
          type: 'object',
          properties: { name: { type: 'string', minLength: 1 } },
          required: ['name'],
        },
      },
    },
    async (req, reply) => {
      const { name } = req.params as { name: string }
      const data = service.find(name)

      // Check if the collection exists
      if (data === undefined) {
        return reply.code(404).send({ error: 'Data not found' })
      }

      // If the collection exists but is empty, return an empty array
      return reply.code(200).send(data)
    }
  )

  // GET /:name/:id → get an item by id
  app.get(
    '/:name/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            id: { type: 'string', pattern: '^[0-9]+$' },
          },
          required: ['name', 'id'],
        },
      },
    },
    async (req, reply) => {
      const { name, id } = req.params as { name: string; id: string }
      const numId = Number(id)

      // Fetch the item by id using the service
      const data = service.findById(name, numId)

      if (!data) {
        return reply.code(404).send({ error: 'Data not found' })
      }

      return reply.code(200).send(data)
    }
  )

  // POST /:name → create a new item
  app.post(
    '/:name',
    {
      schema: {
        params: {
          type: 'object',
          properties: { name: { type: 'string', minLength: 1 } },
          required: ['name'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            email: {
              type: 'string',
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
            }, // simple email check
          },
          required: ['name', 'email'],
          additionalProperties: false, // disallow extra properties other than name and email
        },
      },
    },
    async (req, reply) => {
      const { name } = req.params as { name: string }

      if (!isItem(req.body)) {
        return reply.code(400).send({ error: 'Invalid body' })
      }

      // Sanitizar: aceptar solo name y email del cliente (ignorando "id" si lo mandan)
      const { name: fullName, email } = req.body as {
        name: string
        email: string
      }

      // Asegura que la colección exista y sea array
      const current = service.find(name)
      if (!Array.isArray(current)) {
        return reply.code(404).send({ error: 'Data not found' })
      }

      // Unicidad de email (case-insensitive)
      const exists = current.some(
        u =>
          typeof u === 'object' &&
          u !== null &&
          String((u as any)['email'] ?? '').toLowerCase() ===
            email.toLowerCase()
      )
      if (exists) {
        return reply.code(409).send({ error: 'Email already registered' })
      }

      const created = await service.create(name, req.body)
      if (!created) {
        return reply.code(404).send({ error: 'Data not found' })
      }

      // Respond with 201 and Location header
      reply.header('Location', `/${name}/${created?.['id'] ?? ''}`)
      return reply.code(201).send(created)
    }
  )

  // DELETE /:name/:id → delete an item by id
  app.delete(
    '/:name/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            id: { type: 'string', pattern: '^[0-9]+$' },
          },
          required: ['name', 'id'],
        },
      },
    },
    async (req, reply) => {
      const { name, id } = req.params as { name: string; id: string }
      const numId = Number(id)

      const deleted = await service.deleteById(name, numId)
      if (!deleted) {
        return reply.code(404).send({ error: 'Data not found' })
      }

      return reply.code(200).send({ success: true, deleted })
    }
  )

  // Global error handler (avoids try/catch repetition)
  app.setErrorHandler((err, _req, reply) => {
    app.log.error(err)
    reply.code(500).send({ error: 'An error has occurred' })
  })

  return { app }
}
