# Resume Analyzer Backend

## Setup

1. Copy env

Create `server/.env` based on `.env.example`.

2. Install

```bash
npm install
```

3. Run

```bash
npm run dev
```

## API

- `GET /health`
- `POST /api/resumes/upload` (multipart form-data, field name: `resume`)
