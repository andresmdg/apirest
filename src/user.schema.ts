import { MAX_USERS } from './user.service.js'

// 🔹 Schema for validating numeric ID in route parameters
export const idParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1, maximum: MAX_USERS },
  },
  required: ['id'],
}

// 🔹 Schema for creating a user (POST)
export const createUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 50 },
    email: { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  },
  required: ['name', 'email'],
  additionalProperties: false,
}

// 🔹 Schema for updating a user (PUT)
export const updateUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 50 },
    email: { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  },
  additionalProperties: false,
}
