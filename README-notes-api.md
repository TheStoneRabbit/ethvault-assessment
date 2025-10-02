# Notes API Implementation Guide

This guide walks you through adding a minimal Notes CRUD API to the existing backend without introducing any external storage. Follow the steps in order; each step builds on the earlier ones.

## Prerequisites
- Ensure the monorepo dependencies are installed with `npm install` at the repository root.
- Confirm the backend starts with `npm run server` (or the script defined in `package.json`) before making changes so you understand the current baseline.

## Backend Implementation Steps
1. **Plan the in-memory store**
   - Decide on the shape of a note (for example `{ id, title, body, createdAt, updatedAt }`).
   - Create a dedicated module at `backend/data/notesStore.js` that exports the in-memory structure (e.g., an array plus helper methods for CRUD operations) so the store remains a single source of truth.
   - Initialize the store with an empty collection and a simple ID generator (incrementing counter or `Date.now()`); document that the data resets when the process restarts.

2. **Add a Notes controller**
   - Create `backend/controllers/noteController.js` containing one handler per endpoint: `createNote`, `getNotes`, `getNoteById`, `updateNote`, `deleteNote`.
   - Each handler should interact with the store module only—avoid duplicating store logic inside the controller.
   - Reuse any existing error utilities or HTTP response helpers from `backend/utils` / `backend/middlewares` to keep responses consistent.

3. **Define validation and middleware usage**
   - Check the patterns in `backend/middlewares` (particularly validation helpers) and follow the existing approach for validating request bodies and IDs.
   - Ensure the POST/PUT payloads require at least a title (and optionally body) and respond with 400 on invalid input.

4. **Create a Notes router**
   - Add `backend/routes/noteRoute.js` that binds the five routes to the controller functions using an Express router.
   - Keep the path structure consistent with current routing conventions (e.g., `router.route("/")...` and `router.route("/:id")...`).

5. **Mount the router**
   - Update `backend/app.js` to import the new router and register it under a suitable prefix such as `/api/notes` after the other `app.use` calls.
   - Restart the server and verify the router is picked up (you should see the existing “Server is Running! 🚀” message when hitting the root).

## Frontend / Verification Steps
6. **Add a minimal Notes page (optional but recommended)**
   - Under `app/`, create a simple page (for example `app/notes/page.tsx`) that fetches `GET /api/notes` on mount and renders the list.
   - Provide basic form controls for creating, updating, or deleting notes, or log responses to the browser console if you only need to demonstrate the API.
   - If you skip the UI, prepare a console-based demo script instead.

7. **Manual testing**
   - With the backend running, use curl or an HTTP client (Insomnia/Postman) to call each endpoint:
     ```bash
     curl -X POST http://localhost:4000/api/notes \
       -H 'Content-Type: application/json' \
       -d '{"title":"Test","body":"Demo"}'

     curl http://localhost:4000/api/notes
     curl http://localhost:4000/api/notes/<id>
     curl -X PUT http://localhost:4000/api/notes/<id> -d '{"title":"Updated"}' -H 'Content-Type: application/json'
     curl -X DELETE http://localhost:4000/api/notes/<id>
     ```
   - Confirm each request returns the expected status code and updated payload.

8. **Document the API**
   - Update `README.md` or create a dedicated API section describing each endpoint, request body, and sample response for future reference.

9. **Demo & handoff**
   - Record a short screen capture showing the API in action (CLI tests and/or frontend page) as required by the task.
   - Push your changes to a public repository or share the demo link per the instructions.

Following this plan will keep the Notes API aligned with the existing backend conventions and provide a lightweight interface for manual or UI-based demonstrations.
