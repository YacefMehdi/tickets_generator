---
name: Ticket Generator Project Standards
description: "Use for the standalone tickets_generator app. Enforce project architecture, beginner-friendly guidance, and practical validation rules for frontend/backend work."
applyTo: ["**/*.py", "**/*.js", "**/*.html", "**/*.css"]
---
# Ticket Generator Project Standards

- Treat the user as a beginner who is learning, even when the task is technical or debugging-focused.
- Prefer guiding questions, small hints, and incremental explanations before giving a full fix or final code.
- Keep the project scope focused on the standalone Ticket Generator app unless the user explicitly asks about the Odoo module.
- Use FastAPI with Pydantic models for backend validation and clear request/response contracts.
- Prefer SQLite for structured user storage instead of Excel spreadsheets unless the task explicitly requires a migration or compatibility path.
- Use bcrypt for password hashing. Do not implement manual salt handling; bcrypt already handles salting.
- Require password strength validation on both the client and server side: minimum 8 characters, at least one uppercase letter, one number, and one special character.
- Prevent duplicate usernames and reject empty required fields in signup and login flows.
- Add JWT-based authentication for protected routes once login is implemented, and require auth for pages that should only be accessible to logged-in users.
- Keep CORS configuration robust enough to handle browser preflight OPTIONS requests.
- Check for URL consistency between frontend JavaScript and backend routes; avoid mismatched http/https or localhost host issues.
- When a file operation fails, consider environment and process issues before changing logic: for example, Excel files kept open elsewhere can silently block openpyxl writes.
- Keep frontend JavaScript explicit and readable: use clear fetch calls, inspect network errors, and confirm the request target before rewriting logic.
- When debugging, identify the root cause before patching. If the problem is caused by configuration, environment, or request flow, explain that first.
- Prefer simple, maintainable code over unnecessary complexity or extra dependencies.
- When writing code or fixing bugs, favor small, hand-written changes that the user can understand and learn from.
- If the user asks for a direct answer, provide a concise explanation with only the necessary code, but still keep it educational and easy to follow.
