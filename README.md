# Fastify JSON API

API REST mínima hecha con **Fastify** y un **archivo JSON** como datastore.  
La especificación OpenAPI/Swagger y la documentación ampliada viven en `docs/`.

---

## 📚 Documentación

- **OpenAPI (Swagger):** `docs/api.yaml`  
  Ábrelo con cualquier visor OpenAPI/Swagger (por ejemplo, Swagger UI/Editor o extensiones de VS Code).

- **Guía detallada:** `docs/documentation.md`  
  Explica el funcionamiento interno, convenciones y decisiones de diseño.

---

## 🚀 Ejecutar

```bash
pnpm install
pnpm run dev      # desarrollo (watch)
pnpm run build    # compilar a lib/
pnpm start        # producción (usa lib/)
```

> Configura el puerto con `PORT` en `.env` (opcional).

---

## 📁 Estructura (resumen)

```
db/
  data.json
docs/
  api.yaml
  documentation.md
src/
  app.ts
  services.ts
  main.ts
```
