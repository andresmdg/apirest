````md
# Documentación – Fastify JSON API

👉 **Objetivo:** construir una API REST para gestionar usuarios.

📋 **Requisitos:**
- `GET /users` → listar usuarios  
- `POST /users` → crear usuario (**name**, **email**)  
- `DELETE /users/:id` → eliminar usuario  
- Validar emails con formato correcto  
- Datos guardados en **memoria** (sin BD tradicional). Se persiste en `db/data.json`

---

## Desarrollo

Elegí **Fastify** por su **ligereza**, **alto rendimiento**, validación de **esquemas** integrada (JSON Schema), serialización JSON eficiente, ecosistema maduro de plugins y porque es ampliamente usado en entornos laborales modernos.  
El enfoque es **minimalista**: una base de código pequeña, clara y fácil de extender, evitando duplicar lógica de CRUD por ruta. La lógica de negocio vive en un **Service** único y la persistencia simple en una **Database** que lee/escribe un archivo JSON. Esto reduce fricción al crear nuevas rutas y mantiene el proyecto escalable sin complejidad innecesaria.

> Nota: este **no** es un proyecto real de producción. Si lo fuera, deberíamos considerar seguridad, rendimiento, observabilidad, concurrencia, caching, despliegue, testing, etc. (ver sección “Consideraciones para producción”).

---

## Arquitectura

- **Fastify App (`createApp`)**  
  Registra CORS, define rutas y schemas de validación. Maneja el error handler global.

- **Service (negocio)**  
  - Expone métodos como `find`, `findById`, `create`, `deleteById`.  
  - Aplica reglas de negocio: unicidad de email (verificada en el handler antes de crear), campos requeridos, etc.

- **Database (persistencia simple)**  
  - Carga `db/data.json` al iniciar y mantiene los datos **en memoria**.  
  - En operaciones de escritura (crear/eliminar) vuelca la memoria a disco.
  - Ruta del archivo resuelta desde el **CWD** (`db/data.json`).

- **Modelo `User`**  
  ```json
  { "id": 1, "name": "Ada Lovelace", "email": "ada@computing.org" }
````

* `id`: numérico autoincremental generado en el servidor.
* `name`: string obligatorio.
* `email`: string con patrón simple de email y **único** (case-insensitive).

---

## Flujo de petición

1. **Fastify** recibe la solicitud y valida `params`/`body` con **JSON Schema**.
2. El **handler** consulta/llama a **Service**.
3. **Service** lee/escribe sobre los datos en memoria; **Database** persiste a `db/data.json` cuando corresponde.
4. El **handler** construye la respuesta (códigos adecuados: 200/201/404/409/400).
5. El **error handler** captura excepciones y responde `500` estándar.

---

## Endpoints

> La especificación completa está en **`docs/api.yaml`** (OpenAPI/Swagger).
> A continuación, un resumen práctico.

### Health

**GET /** → 200

```json
{ "success": true, "message": "Server works" }
```

### Users

#### Listar usuarios

**GET /users** → 200

```json
[
  { "id": 1, "name": "Kevin", "email": "kevin@email.com" }
]
```

**404** cuando no existe la colección `users` en el JSON.

#### Obtener usuario por id (opcional si se expone)

**GET /users/\:id** → 200

```json
{ "id": 1, "name": "Kevin", "email": "kevin@email.com" }
```

→ 404 si no existe.

#### Crear usuario

**POST /users**
Body:

```json
{ "name": "Ada Lovelace", "email": "ada@computing.org" }
```

* `required`: `name`, `email`
* `additionalProperties: false` → rechaza extras (p. ej., `id`)
* **unicidad de email**: 409 si ya existe

**201 Created**

```json
{ "id": 2, "name": "Ada Lovelace", "email": "ada@computing.org" }
```

Header: `Location: /users/2`

**400** body inválido • **409** email duplicado • **404** colección inexistente

#### Eliminar usuario

**DELETE /users/\:id** → 200

```json
{
  "success": true,
  "deleted": { "id": 2, "name": "Ada Lovelace", "email": "ada@computing.org" }
}
```

→ 404 si no existe

---

## Ejemplos cURL

```bash
# Health
curl http://localhost:205/

# Listar
curl http://localhost:205/users

# Por id
curl http://localhost:205/users/1

# Crear (válido)
curl -X POST http://localhost:205/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@computing.org"}'

# Crear (rechaza extra "id")
curl -X POST http://localhost:205/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@computing.org","id":1}'

# Eliminar
curl -X DELETE http://localhost:205/users/2
```

---

## Estructura del proyecto (resumen)

```
db/
  data.json
docs/
  api.yaml
  documentation.md
src/
  app.ts           # rutas + schemas + plugins
  services.ts      # Service + Database
  main.ts          # bootstrap (listen)
```

---

## Consideraciones para producción (futuras)

* **Seguridad**: headers, helmet, sanitización, ocultar detalles de errores, límites de tamaño de body.
* **Rate limiting** y **circuit breakers**.
* **Autenticación/autorización** (JWT/API Keys, RBAC).
* **Paginación** en `GET /users`.
* **Observabilidad**: logs estructurados, trazas, métricas (Prometheus), dashboard.
* **Concurrencia y consistencia**: locks/colas si hay múltiples réplicas escribiendo el JSON.
* **Cache**: ETag/Last-Modified, `Cache-Control`, reverse proxy (NGINX/Cloudflare).
* **CI/CD y testing**: unit/E2E, cobertura, linters, hooks pre-commit.
* **Empaquetado**: Docker, multi-stage build; variables de entorno seguras.
* **Base de datos real**: cuando la escala/consistencia lo exija.

---

## Referencias

* **OpenAPI (Swagger):** `docs/api.yaml`
* **Guía ampliada:** `docs/documentation.md` (este archivo)