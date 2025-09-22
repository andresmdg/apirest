# 📖 Project Documentation

This document provides a deeper explanation of the **Fastify Users API**, including architecture, code structure, validation, error handling, and extension guidelines.

---

## 🏗️ Architecture Overview

The API is designed as a **simple CRUD service** with an in-memory data store.

* **Framework**: [Fastify](https://fastify.dev/)
* **Language**: TypeScript
* **Data store**: In-memory array (`users`)
* **Schema validation**: JSON Schema (built-in with Fastify)
* **Error handling**: Global error handler
* **Response format**: Standardized `ApiResponse<T>` for all endpoints

**Flow of a Request**:

1. Client sends HTTP request (e.g., `GET /users`)
2. Fastify matches the route handler
3. Request is validated against JSON schema (if provided)
4. Business logic runs (create, read, delete, etc.)
5. Response is returned with standardized JSON body

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

* **Endpoint**: `GET /`
* **Purpose**: Verify the service is running
* **Response**:

  ```json
  { "success": true, "message": "Server works", "data": null }
  ```

---

### List Users

* **Endpoint**: `GET /users`
* **Purpose**: Retrieve all users
* **Validation**: None
* **Response**:

  * **200 OK**

    ```json
    { "success": true, "message": "List of users", "data": [] }
    ```

    or

    ```json
    {
      "success": true,
      "message": "List of users",
      "data": [{ "id": 1, "name": "Alice", "email": "alice@example.com" }]
    }
    ```

---

### Create User

* **Endpoint**: `POST /users`

* **Purpose**: Add a new user (max 999 users)

* **Validation**:

  ```json
  {
    "type": "object",
    "properties": {
      "name": { "type": "string", "minLength": 1, "maxLength": 50 },
      "email": { "type": "string", "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" }
    },
    "required": ["name", "email"],
    "additionalProperties": false
  }
  ```

* **Responses**:

  * **201 Created**

    ```json
    {
      "success": true,
      "message": "User created successfully",
      "data": { "id": 1, "name": "Alice", "email": "alice@example.com" }
    }
    ```

  * **400 Bad Request**

    * Invalid input:

      ```json
      { "success": false, "message": "Bad Request", "error": "Invalid input data" }
      ```

    * Maximum users reached:

      ```json
      {
        "success": false,
        "message": "Bad Request",
        "error": "Cannot register more users: memory limit reached"
      }
      ```

    * ID exceeds max value:

      ```json
      {
        "success": false,
        "message": "Bad Request",
        "error": "User ID exceeds maximum allowed value"
      }
      ```

  * **409 Conflict**

    ```json
    { "success": false, "message": "Conflict", "error": "Email already registered" }
    ```

---

### Delete User

* **Endpoint**: `DELETE /users/:id`

* **Purpose**: Remove a user by ID

* **Validation**:

  ```json
  {
    "type": "object",
    "properties": { "id": { "type": "integer", "minimum": 1, "maximum": 999 } },
    "required": ["id"]
  }
  ```

* **Responses**:

  * **200 OK**

    ```json
    {
      "success": true,
      "message": "User deleted successfully",
      "data": { "id": 1, "name": "Alice", "email": "alice@example.com" }
    }
    ```

  * **400 Bad Request**

    ```json
    { "success": false, "message": "Bad Request", "error": "Invalid user ID" }
    ```

  * **404 Not Found**

    ```json
    { "success": false, "message": "Not Found", "error": "Resource not found" }
    ```

---

### Update User Information

* **Endpoint**: `PUT /users/:id`

* **Purpose**: Update a user's information by ID

* **Validation**:

  * **Params**:

    ```json
    {
      "type": "object",
      "properties": { "id": { "type": "integer", "minimum": 1, "maximum": 999 } },
      "required": ["id"]
    }
    ```

  * **Body**:

    ```json
    {
      "type": "object",
      "properties": {
        "name": { "type": "string", "minLength": 1, "maxLength": 50 },
        "email": { "type": "string", "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" }
      },
      "additionalProperties": false
    }
    ```

* **Responses**:

  * **200 OK**

    ```json
    {
      "success": true,
      "message": "User updated successfully",
      "data": { "id": 1, "name": "Alice", "email": "alicenewmail@example.com" }
    }
    ```

  * **400 Bad Request**

    ```json
    { "success": false, "message": "Bad Request", "error": "Invalid user ID" }
    ```

  * **404 Not Found**

    ```json
    { "success": false, "message": "Not Found", "error": "Resource not found" }
    ```

  * **409 Conflict**

    ```json
    { "success": false, "message": "Conflict", "error": "Email already registered" }
    ```

---

## ⚠️ Error Handling

All unexpected errors are handled globally:

```ts
app.setErrorHandler((err, _req, reply) => {
  app.log.error(err)
  reply.code(500).send({
    success: false,
    message: "Error",
    error: err.message || "Internal Server Error"
  })
})
```

* Ensures the API **never leaks stack traces** to the client
* Provides **consistent JSON error format** for all endpoints

---

## 🧑‍💻 Development Guidelines

1. **Adding new routes**

   * Define route in `createApp()` function
   * Add **validation schema** to ensure safe input
   * Always return **clear and consistent `ApiResponse<T>` JSON**

2. **Extending data storage**

   * Current version uses an **in-memory array** (`users`)
   * Maximum users: 999
   * For persistence, replace with a real database (e.g., PostgreSQL, MongoDB)
   * Keep route logic the same; abstract data operations into a service layer

3. **Best practices**

   * Use **async/await** for all async operations
   * Always validate client input
   * Provide meaningful HTTP status codes (`200`, `201`, `400`, `404`, `409`, `500`)
   * Keep routes **RESTful** and resource-oriented

---

## 🔮 Future Improvements

* Replace in-memory array with a **database**
* Add **pagination** in `GET /users`
* Add **unit tests** with [Jest](https://jestjs.io/)
* Implement **rate limiting** to prevent memory overload
