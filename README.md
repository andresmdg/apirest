# Fastify Users API

A simple **REST API** built with [Fastify](https://fastify.dev/) and TypeScript.
This project demonstrates how to structure routes, validate requests, and manage data using an **in-memory collection**, following **SOLID principles** and **Clean Architecture** practices.

> Check the [documentation](docs/documentation.md) or the [API spec](docs/api.json) for full details.

---

## 🚀 Features

* Fast and lightweight server using **Fastify**
* **CORS enabled** for browser or external client access
* **Input validation** with JSON Schema:

  * Reject negative or zero IDs
  * Limit IDs to **3 digits**
  * Maximum **999 users** allowed
* **CRUD operations** for `users` collection
* **Consistent standardized responses** using `ApiResponse<T>` for all routes
* **Global error handler** ensures consistent JSON errors
* Clear code comments and maintainable structure

---

## 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/andresmdg/apirest.git
   cd apirest
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run in development mode:

   ```bash
   npm run dev
   ```

4. Or build and run in production:

   ```bash
   npm run build
   npm start
   ```

---

## ⚙️ Environment Variables

This project uses [dotenv](https://www.npmjs.com/package/dotenv).
Create a `.env` file in the root directory if you want to configure custom values.

| Variable | Default | Description                |
| -------- | ------- | -------------------------- |
| `PORT`   | `3001`  | Port where the server runs |

---

## 📡 API Endpoints

### 1. Health Check

**GET /**
Checks if the service is up.

```bash
curl -X GET http://localhost:3001/
```

Response:

```json
{
  "success": true,
  "message": "Server works",
  "data": null
}
```

---

### 2. List Users

**GET /users**
Retrieves all users.

```bash
curl -X GET http://localhost:3001/users
```

Response (empty):

```json
{
  "success": true,
  "message": "List of users",
  "data": []
}
```

Response (with users):

```json
{
  "success": true,
  "message": "List of users",
  "data": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" }
  ]
}
```

---

### 3. Create User

**POST /users**
Adds a new user. Maximum **999 users** allowed.

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

Successful response:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": { "id": 1, "name": "Alice", "email": "alice@example.com" }
}
```

Errors:

```json
{
  "success": false,
  "message": "Conflict",
  "error": "Email already registered"
}
```

```json
{
  "success": false,
  "message": "Bad Request",
  "error": "Cannot register more users: memory limit reached"
}
```

```json
{
  "success": false,
  "message": "Bad Request",
  "error": "User ID exceeds maximum allowed value"
}
```

---

### 4. Delete User

**DELETE /users/\:id**
Removes a user by their ID. Rejects invalid or negative IDs.

```bash
curl -X DELETE http://localhost:3001/users/1
```

Successful response:

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": { "id": 1, "name": "Alice", "email": "alice@example.com" }
}
```

Errors:

```json
{
  "success": false,
  "message": "Not Found",
  "error": "Resource not found"
}
```

```json
{
  "success": false,
  "message": "Bad Request",
  "error": "Invalid user ID"
}
```

---

### 5. Update User Information

**PUT /users/\:id**
Updates a user's information by ID.

```bash
curl -X PUT http://localhost:3001/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alicenewmail@example.com"}'
```

Successful response:

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { "id": 1, "name": "Alice", "email": "alicenewmail@example.com" }
}
```

Errors:

```json
{
  "success": false,
  "message": "Not Found",
  "error": "Resource not found"
}
```

```json
{
  "success": false,
  "message": "Conflict",
  "error": "Email already registered"
}
```

```json
{
  "success": false,
  "message": "Bad Request",
  "error": "Invalid user ID"
}
```

---

## 🧑‍💻 Development Notes

* Data is stored in memory → restarting the server resets all users.
* Validation ensures only valid **name**, **email**, and **ID** are accepted.
* Maximum **999 users** to prevent memory overload.
* All responses follow the **`ApiResponse<T>` schema** for consistency.
* Code follows **SOLID principles** and **Clean Architecture**, making it easy to extend.
* This project serves as a **learning starter template** with proper error handling and validation.