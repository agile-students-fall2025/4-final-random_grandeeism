# Test Alignment Notes (JWT + Mock DB)

## What was done
- Added proper JWT auth to test suites (Auth, Articles, Highlights, Users) using mock users (`user-1`, `user-2`) and the shared `JWT_SECRET` from `.env`.
- Ensured DB isolation via `daoFactory.resetMockData()` in `beforeEach` for each suite; no real Mongo connections (tests run with `USE_MOCK_DB=true`).
- Avoided API code changes; only test adjustments plus minimal middleware secret loading to match `.env`.
- Fixed ID mismatches to use mock IDs (e.g., `article-1`, `highlight-1`, `user-1`, `user-2`).
- Updated expectations to match actual response shapes (e.g., `errors` array from validation, `error`/`message` fields from routes).

## Suites completed
- Auth API: 33/33 passing.
- Articles API: 21/21 passing.
- Highlights: 22/22 passing.
- Users API: 25/25 passing.

## Remaining/potentially failing suites
- Other endpoints likely still lack JWT headers and mock-ID alignment (e.g., feeds, integration aggregates). They may also assume numeric IDs instead of string IDs.

## Index.js / JWT secret note
- `middleware/auth.js` and tests now rely on `process.env.JWT_SECRET` (from `.env`). Ensure `.env` is loaded (index.js already does). When creating isolated Express apps in tests, also `require('dotenv').config()` if you’re not importing `index.js`.

## How to align other tests
1) **Use mock IDs**: Replace numeric IDs with mock IDs (`user-1`, `user-2`, `article-1`, `highlight-1`, etc.). Check `back-end/data/` mocks for truth.
2) **Add JWT auth**: Generate a token with `jwt.sign({ id: 'user-1', username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '7d' })` and send with `.set('Authorization', Bearer ${token})`.
3) **Isolate DB**: Call `daoFactory.resetMockData()` in `beforeEach`. Run tests with `USE_MOCK_DB=true` (already in `npm test`).
4) **Match response shapes**: Validation errors come as `errors` array. Auth/route errors often use `error` or `message`; check the route.
5) **Prefer isolated apps**: For route tests, spin up a minimal `express()` app and mount only the router under test to avoid full server side-effects/Mongo connection.
6) **Password assumptions**: Mock users use password `password123`. Use that in login/password-change tests.
7) **JWT secret consistency**: Use the same secret as `.env`; don’t hardcode a different one.

## Minimal API changes made
- Only loaded `.env` in auth middleware to align with the secret; no behavioral changes to routes.

## Quick checklist for new/remaining suites
- [ ] Set `USE_MOCK_DB=true` (in scripts already).
- [ ] Load `.env` or rely on `index.js` to load it.
- [ ] Generate JWT with mock user id.
- [ ] Add `Authorization: Bearer <token>` to every protected request.
- [ ] Use mock IDs and existing mock data values.
- [ ] Expect `errors` array for validation failures; `error/message` for route errors.
- [ ] Reset mock data in `beforeEach` via `daoFactory.resetMockData()`.
