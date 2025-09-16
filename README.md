# Fastify Users API

A simple **REST API** built with [Fastify](https://fastify.dev/) and TypeScript.  
This project demonstrates how to structure routes, validate requests, and manage data using an **in-memory collection** (no database required).  

---

## 🚀 Features
- Fast and lightweight server using **Fastify**
- **CORS enabled** (for browser or external client access)
- **Input validation** with JSON schema
- Basic **CRUD operations** on a `users` collection
- **Global error handler** for consistent error responses
- Clear code comments for beginners

---

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/fastify-users-api.git
   cd fastify-users-api
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
Create a `.env` file in the root if you want to configure custom values.

| Variable | Default | Description           |
| -------- | ------- | --------------------- |
| `PORT`   | `3000`  | Server listening port |

---

## 📡 API Endpoints

### 1. Health Check

**GET /**
Check if the service is up and running.

```bash
curl -X GET http://localhost:3000/
```

Response:

```json
{ "success": true, "message": "Server works" }
```

---

### 2. List Users

**GET /users**
Retrieve all users (returns an empty array if none exist).

```bash
curl -X GET http://localhost:3000/users
```

Response:

```json
[]
```

---

### 3. Create User

**POST /users**
Add a new user to the collection.

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

Successful response:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com"
}
```

If the email is already registered:

```json
{ "error": "Email already registered" }
```

---

### 4. Delete User

**DELETE /users/\:id**
Remove a user by their ID.

```bash
curl -X DELETE http://localhost:3000/users/1
```

Successful response:

```json
{
  "success": true,
  "deleted": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com"
  }
}
```

If the user does not exist:

```json
{ "error": "User not found" }
```

---

## 🧑‍💻 Development Notes

* Data is stored in memory → restarting the server will reset the user list.
* The `Location` header in `POST /users` points to the new resource URL.
* Validation ensures only valid **name** and **email** fields are accepted.
* This project is meant as a **learning starter template** for beginners.
