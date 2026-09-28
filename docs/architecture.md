# Engineering Platform - Architecture

## Overview

A professional civil engineering and construction management platform built with React, Node.js/Express, and PostgreSQL.

## Architecture

```
Browser → Nginx → React Frontend → Express API → PostgreSQL
```

## Project Structure

- `frontend/` - React + Vite single-page application
- `backend/` - Node.js + Express REST API
- `calculations/` - Modular engineering calculation engine
- `database/` - PostgreSQL schemas and migrations
- `documents/` - Document templates
- `uploads/` - File upload storage
- `reports/` - Report templates
- `scripts/` - Utility and setup scripts
- `tests/` - Test suites
- `docs/` - Documentation

## Calculation Engine

The calculation engine is modular. Each category (concrete, rebar, formwork, earthwork) is a separate module that can be extended independently.

All calculations are deterministic and reproducible. AI does not replace engineering formulas.

## Security

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation
- SQL parameterization
- Rate limiting
- Secure headers (Helmet)
- CORS configuration
- File upload validation
- Audit logging
