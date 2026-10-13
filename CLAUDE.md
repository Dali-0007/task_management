# ADN TECH Task Manager

Task and project management app. Preserve existing working features; extend, don't rebuild.

## Stack
- **frontend/**: React 19 + Vite, JavaScript/JSX, Material UI, React Router, Axios, Context API (no Redux, no TypeScript).
- **backend/**: Node.js + Express 5 (CommonJS), PostgreSQL via `pg`, JWT in an HttpOnly `accessToken` cookie, bcrypt.

## Structure
- `frontend/src/features/<feature>/{pages,components,hooks,services,utils,constants}`: auth, dashboard, projects, tasks, profile.
- `frontend/src/components/`: shared layout (`dashboard/`) and `common/` pieces.
- `frontend/src/services/apiClient.js`: the only Axios instance (`withCredentials: true`). Never create another.
- `frontend/src/styles/`: `theme.js` tokens, `commonStyles.js` `sx` presets, `index.css` CSS variables. No inline `style=`.
- `backend/src/{routes,controllers,services,middleware,validation,utils,db}`: routes → controllers (validate input, map errors) → services (SQL + business rules).
- `backend/src/db/migrations/*.sql`: applied in order by `npm run migrate`, tracked in `schema_migrations`.

## Roles and authorization
- Exactly two roles: `PROJECT_MANAGER`, `TEAM_MEMBER` (default on sign-up). No admin role, no self-service role changes.
- The backend is the source of truth. UI hiding is cosmetic; every rule is enforced in services.
- A user only sees projects/tasks/comments for projects they are a member of. Inaccessible resources return **404**, not 403.
- Managing a project (edit, archive, members, create/edit/delete tasks) = role `PROJECT_MANAGER` **and** project member.
- Team members may only change `status` of tasks assigned to them; any other field → 403.
- Archived projects are read-only (task writes and comments → 409).
- Task assignees must be project members; removing a member unassigns their tasks in that project.

## API conventions
- JSON `{ success, message?, <resource> }`; errors `{ success: false, message }`. Never leak SQL/server errors.
- Validate IDs with `/^[1-9]\d*$/`; parameterized SQL only; transactions for multi-write operations.
- `BIGINT` IDs arrive as strings in JSON. Compare IDs with `String(a) === String(b)`.
- Task values: status `TODO|IN_PROGRESS|IN_REVIEW|COMPLETED`, priority `LOW|MEDIUM|HIGH|URGENT`, `due_date` as `YYYY-MM-DD`. Labels live in `frontend/src/features/tasks/constants/taskOptions.js`.
- Don't invent endpoints from the frontend; check `backend/src/routes` first.

## Database safety
- Never drop, truncate or reset the development database. Migrations must be additive and idempotent.
- Credentials and JWT secret come from `backend/.env`; never hardcode or log them.
- Tests use a separate `adn_task_manager_test` database (the suite refuses DB names not ending in `_test`).

## Commands
```bash
# backend
cd backend && npm run migrate        # apply pending migrations to DB_NAME in .env
cd backend && npm run dev            # http://localhost:5000
cd backend && DB_NAME=adn_task_manager_test npm run migrate && npm test

# frontend
cd frontend && npm run dev           # http://localhost:5173 (only allowed CORS origin)
cd frontend && npm run lint && npm run build
```
