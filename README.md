# Construction Cost Control ERP

A production-ready ERP system for construction cost management.

## Tech Stack

- **Backend:** Python 3, Flask, SQLAlchemy, Flask-Migrate, Flask-Login
- **Frontend:** HTML5, CSS3, Vanilla JS, Bootstrap 5, Chart.js
- **Database:** PostgreSQL 16
- **DevOps:** Docker, Docker Compose

## Quick Start

```bash
cp .env.example .env
docker-compose up --build
```

## Project Structure

- `app/models/` — SQLAlchemy models
- `app/routes/` — Flask blueprints (controllers)
- `app/services/` — Business logic layer
- `app/repositories/` — Data access layer
- `app/forms/` — WTForms form classes
- `app/templates/` — Jinja2 HTML templates
- `app/static/` — CSS, JS, images
- `migrations/` — Alembic migration files
- `tests/` — Test suite
