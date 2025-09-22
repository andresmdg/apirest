import { User } from './type.js'

// Maximum allowed users and ID
export const MAX_USERS = 999

// 🔹 Validate that ID is a positive integer and does not exceed max allowed
export function validateId(id: number): boolean {
  return id > 0 && id <= MAX_USERS
}

// 🔹 Check if email is already registered (case-insensitive)
// Optionally exclude a user by ID (useful for update)
export function isEmailTaken(
  users: User[],
  email: string,
  excludeId?: number
): boolean {
  return users.some(
    u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      (excludeId ? u.id !== excludeId : true)
  )
}

// 🔹 Check if maximum users limit has been reached
export function hasReachedUserLimit(users: User[]): boolean {
  return users.length >= MAX_USERS
}
