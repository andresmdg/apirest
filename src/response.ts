import { ApiResponse } from './type.js'

// Standardized success response
export function ok<T>(reply: any, data: T, message = 'OK') {
  return reply.code(200).send({
    success: true,
    message,
    data,
  } as ApiResponse<T>)
}

// Standardized created response
export function created<T>(reply: any, data: T, message = 'Created') {
  return reply.code(201).send({
    success: true,
    message,
    data,
  } as ApiResponse<T>)
}

// Standardized not found response
export function notfound(reply: any, message = 'Not Found') {
  return reply.code(404).send({
    success: false,
    message,
    error: 'Resource not found',
  } as ApiResponse<null>)
}

// Standardized bad request response
export function badrequest(reply: any, error: string, message = 'Bad Request') {
  return reply.code(400).send({
    success: false,
    message,
    error,
  } as ApiResponse<null>)
}

// Standardized conflict response
export function conflict(reply: any, error: string, message = 'Conflict') {
  return reply.code(409).send({
    success: false,
    message,
    error,
  } as ApiResponse<null>)
}

// Standardized internal server error response
export function servererror(
  reply: any,
  error = 'Internal Server Error',
  message = 'Error'
) {
  return reply.code(500).send({
    success: false,
    message,
    error,
  } as ApiResponse<null>)
}
