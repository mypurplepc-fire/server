# API Reference

## Health

### GET /api/health

Returns server status and database connectivity.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.45,
    "environment": "development",
    "database": "connected",
    "dbVersion": "PostgreSQL 16.x"
  }
}
```

## Projects

### GET /api/projects
Returns all projects.

### POST /api/projects
Creates a new project.

### GET /api/projects/:id
Returns a single project.

### PUT /api/projects/:id
Updates a project.

### DELETE /api/projects/:id
Deletes a project.

## Calculations

### POST /api/calculations/concrete
Performs concrete quantity calculation.

### GET /api/projects/:id/calculations
Returns calculations for a project.

## Documents

### GET /api/projects/:id/documents
Returns documents for a project.

### POST /api/projects/:id/documents
Uploads a document.
