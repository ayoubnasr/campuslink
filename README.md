# CampusLink

[![CI](https://github.com/ayoubnasr/campuslink/actions/workflows/ci.yml/badge.svg)](https://github.com/ayoubnasr/campuslink/actions/workflows/ci.yml)

CampusLink is a social platform for university clubs, built for the American University of Beirut (AUB). Students follow campus clubs and get their announcements and events in a personalised feed. Club cabinet members post on behalf of their club and manage their events.

## Features

**For students**
- **Accounts:** sign up with an AUB email (`@mail.aub.edu`), verify by email, and log in. There is also a "forgot password" flow.
- **For You feed:** new announcements and events from the clubs you follow come first, followed by posts you've already seen, so the feed never runs dry.
- **Discovery:** search clubs by name or CRN and follow or unfollow them.
- **Events:** register for or unregister from events, and see the date, location (with a map link), capacity and ticket price.
- **Comments** on posts.
- **Club profiles:** a club's bio and its posts.

**For club cabinet members** (logging in with their student account, plus the club's CRN and password)
- **Posting:** create announcements and events, with images. Images are compressed server-side with `sharp`.
- **Club profile:** edit the club's name, bio, email and profile picture.
- **Participants:** see who registered for each event. A club can only see participants of its own events.
- **Moderation:** post text is checked for profanity using the Neutrino API, with the `bad-words` library as a local fallback.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Bootstrap / React-Bootstrap |
| Backend | Node.js 22, Express 4, JWT auth in an httpOnly cookie, bcrypt, Multer, Sharp, Nodemailer |
| Database | MySQL 8 with stored procedures and functions (`backend/src/db/*.sql`) |
| Testing / CI | Node test runner end-to-end tests against a real MySQL, GitHub Actions |
| Deployment | Docker (single container), Railway |

## Architecture

```
Browser ──► Express server (one origin)
              ├── /api/auth        sign-up, login, email verification, password reset
              ├── /api/fyp         feed, likes, comments
              ├── /api/user        profile, event registration
              ├── /api/cabinet     club profile, posts, event participants (cabinet only)
              ├── /api/discovery   club search, follow
              ├── /compressed      uploaded images
              └── /*               the built React app
                     │
                     ▼
                  MySQL (tables + stored procedures)
```

In production the Express server also serves the React build, so the site and the API share one origin. That keeps the auth cookie first-party, with no cross-site cookie or CORS issues. Most database logic, such as the feed algorithm, follows, likes and registrations, lives in stored procedures.

## Getting started (local)

**Requirements:** Node.js 22 and a MySQL 8 server.

```bash
# 1. Install dependencies
npm install            # root: dev tooling
npm run install:all    # backend + frontend

# 2. Configure
cp .env.example .env                    # backend settings (DB, JWT secret, ...)
cp frontend/.env.example frontend/.env  # frontend API URLs for development

# 3. Create the database schema and stored procedures (safe to re-run)
npm --prefix backend run db:init

# 4. Run backend (port 5000) and frontend dev server (port 3000) together
npm run dev
```

Without a Gmail app password (`GMAIL_APP_PASS`), verification and password-reset links are printed to the server log instead of being emailed. Clubs have no sign-up page: create them directly in the `clubs` table, with a bcrypt-hashed password.

To run everything in Docker instead:

```bash
docker build -t campuslink .
docker run -p 5000:5000 --env-file .env campuslink   # DB_HOST must be reachable from the container
```

## Tests

`backend/test/smoke.test.js` is an end-to-end test that drives a running server backed by a real MySQL database. It covers:

- **Accounts:** sign-up, email verification, login, and the full password reset.
- **Clubs and posts:** following a club, club login, creating announcements and events, the feed, comments, likes and event registration.
- **Error handling:** invalid input gets proper 4xx errors instead of crashing the server.

```bash
npm --prefix backend start   # in one terminal
npm --prefix backend test    # in another (uses a throwaway database: it creates test users and clubs)
```

## CI/CD

- **CI** (`.github/workflows/ci.yml`) runs on every push and pull request. It starts a MySQL 8 service, installs dependencies, builds the frontend, creates the schema, starts the server, checks that the frontend is served, runs the end-to-end tests, and checks that the Docker image builds.
- **CD:** Railway deploys `main` automatically from GitHub using the `Dockerfile`, and with "Wait for CI" enabled it only deploys commits that pass CI. On start, the container runs `db:init`, so schema and stored procedure changes are applied with each deploy.

## Deployment (Railway)

1. Create a Railway project with a **MySQL** database and a service from this GitHub repo. Railway builds it with the `Dockerfile`.
2. Set the service's variables:

   | Variable | Value |
   |---|---|
   | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | references to the MySQL service (`${{MySQL.MYSQLHOST}}`, etc.) |
   | `JWT_SECRET` | a long random string |
   | `NODE_ENV` | `production` |
   | `AUTHENTICATION_URL` | `https://<your-domain>/api/auth` |
   | `FRONTEND_URL` | `https://<your-domain>` |
   | `UPLOADS_DIR` | the volume's mount path, e.g. `/data` |
   | `GMAIL_APP_PASS`, `NEUTRINO_USER_ID`, `NEUTRINO_API_KEY` | optional |

3. Attach a **volume** to the service, mounted at `/data`, so uploaded images survive redeploys.
4. In the service settings, set the health check path to `/api/health` and turn on **Wait for CI**.

## Project structure

```
backend/
  src/
    Server/server.js         Express app: routes, static files, error handling
    auth/                    sign-up, login, verification, password reset, emails
    foryou/                  feed, likes, comments
    user/                    user profile, event registration
    cabinet/                 club profile, posts, image upload/compression
    discovery/               club search, follow
    db/                      schema.sql + stored procedures
    db.js                    MySQL connection pool
  API Clients/               Neutrino profanity API client
  scripts/init-db.js         creates/updates the database from src/db/*.sql
  test/smoke.test.js         end-to-end tests
frontend/
  src/Pages/                 React pages and components
Dockerfile                   production image (API + built frontend)
.github/workflows/ci.yml     CI pipeline
```
