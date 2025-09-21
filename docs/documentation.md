# 📖 Project Documentation

This document provides a deeper explanation of the **Fastify Users API**, including architecture, code structure, validation, error handling, and extension guidelines.

---

## 🏗️ Architecture Overview

The API is designed as a **simple CRUD service** with an in-memory data store.

- **Framework**: [Fastify](https://fastify.dev/)
- **Language**: TypeScript
- **Data store**: In-memory array (`users`)
- **Schema validation**: JSON Schema (built-in with Fastify)
- **Error handling**: Global error handler

**Flow of a Request**:

1. Client sends HTTP request (e.g., `GET /users`)
2. Fastify matches the route handler
3. Request is validated against JSON schema (if provided)
4. Business logic runs (create, read, delete, etc.)
5. Response is returned with appropriate status code and JSON body

---

## 📂 File Structure

```

src/
|–– main.ts       # Entry point to run the application
└── app.ts        # Fastify application (routes + logic)
README.md          # Project introduction & usage guide
documentation.md   # Technical documentation

```

---

## 🧩 Route Details

### Health Check

- **Endpoint**: `GET /`
- **Purpose**: Verify the service is running
- **Response**:
  ```json
  { "success": true, "message": "Server works" }
  ```

---

### List Users

- **Endpoint**: `GET /users`
- **Purpose**: Retrieve all users
- **Validation**: None (simple request)
- **Response**:
  - **200 OK**

    ```json
    []
    ```

    or

    ```json
    [{ "id": 1, "name": "Alice", "email": "alice@example.com" }]
    ```

---

### Create User

- **Endpoint**: `POST /users`
- **Purpose**: Add a new user
- **Validation**:

  ```json
  {
    "type": "object",
    "properties": {
      "name": { "type": "string", "minLength": 1 },
      "email": {
        "type": "string",
        "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      }
    },
    "required": ["name", "email"],
    "additionalProperties": false
  }
  ```

- **Responses**:
  - **201 Created**

    ```json
    { "id": 1, "name": "Alice", "email": "alice@example.com" }
    ```

  - **409 Conflict**

    ```json
    { "error": "Email already registered" }
    ```

---

### Delete User

- **Endpoint**: `DELETE /users/:id`
- **Purpose**: Remove a user by ID
- **Validation**:

  ```json
  {
    "type": "object",
    "properties": { "id": { "type": "string", "pattern": "^[0-9]+$" } },
    "required": ["id"]
  }
  ```

- **Responses**:
  - **200 OK**

    ```json
    {
      "success": true,
      "deleted": { "id": 1, "name": "Alice", "email": "alice@example.com" }
    }
    ```

  - **404 Not Found**

    ```json
    { "error": "User not found" }
    ```

---

### Update User Information

- **Endpoint**: `PUT /users/:id`
- **Purpose**: Update an existing user's information by ID
- **Validation**:
  - **Params**:

    ```json
    {
      "type": "object",
      "properties": { "id": { "type": "string", "pattern": "^[0-9]+$" } },
      "required": ["id"]
    }
    ```

  - **Body**:
    ```json
    {
      "type": "object",
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "email": {
          "type": "string",
          "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
        }
      },
      "additionalProperties": false
    }
    ```

- **Responses**:
  - **200 OK**

    ```json
    { "id": 1, "name": "Alice", "email": "alicenewmail@example.com" }
    ```

  - **404 Not Found**

    ```json
    { "error": "User not found" }
    ```

  - **409 Conflict**

    ```json
    { "error": "Email already registered" }
    ```

---

## ⚠️ Error Handling

All unexpected errors are handled globally:

```ts
app.setErrorHandler((err, _req, reply) => {
  app.log.error(err)
  reply.code(500).send({ error: 'An error has occurred' })
})
```

- Ensures the API **never leaks stack traces** to the client
- Provides consistent JSON error format

---

## 🧑‍💻 Development Guidelines

1. **Adding new routes**
   - Define route in `createApp()` function
   - Add **validation schema** to ensure safe input
   - Always return **clear and consistent JSON responses**

2. **Extending data storage**
   - Current version uses an **in-memory array** (`users`)
   - For persistence, replace with a real database (e.g., PostgreSQL, MongoDB)
   - Keep route logic the same; just abstract data operations into a service layer

3. **Best practices**
   - Use **async/await** for all async operations
   - Always validate client input
   - Provide meaningful HTTP status codes (`200`, `201`, `404`, `409`, `500`)
   - Keep routes **RESTful** and resource-oriented

---

## 🔮 Future Improvements

- Replace in-memory array with a **database**
- Add **update endpoint** (`PUT /users/:id`)
- Implement **pagination** in `GET /users`
- Add **unit tests** with [Jest](https://jestjs.io/)
