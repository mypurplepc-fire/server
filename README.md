# Engineering Platform

A professional civil engineering and construction management platform.

## Project Structure

```
engineering-platform/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
├── calculations/      # Engineering calculation modules
├── database/          # PostgreSQL schemas and migrations
├── documents/         # Document templates
├── uploads/           # File upload storage
├── reports/           # Report templates
├── scripts/           # Utility scripts
├── tests/             # Test suites
└── docs/              # Documentation
```

## Quick Start

1. Run `scripts/setup.sh` to install dependencies
2. Configure backend `.env` file
3. Run database migrations
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm run dev`

## Technology Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Reverse Proxy:** Nginx (production)
- **Process Manager:** systemd (production)
