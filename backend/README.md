# Instagram Clone - Backend

This is the backend for the Instagram-like application. It uses Node.js, Express, MongoDB (Mongoose), Socket.io, and Cloudinary for media.

Quick start

1. Copy `.env.example` to `.env` and fill in values (MongoDB URI, JWT secrets, Cloudinary keys).
2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

API base: http://localhost:5000/api

Socket.io expects an auth token in the handshake: { auth: { token: 'Bearer <jwt>' } }
