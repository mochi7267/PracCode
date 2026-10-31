# PracCode — Node.js + MySQL

PracCode is a typing-practice web application. The frontend remains HTML, CSS and JavaScript; the backend is Node.js/Express and the database is MySQL. **PHP and XAMPP are not required.**

## Requirements
- Node.js 18 or newer (LTS recommended)
- MySQL Server running locally (MySQL Workbench is an editor/client; it is not the database server)
- The MySQL database schema in `database/praccode.sql`

## 1. Prepare the database
1. Open MySQL Workbench and connect to your existing MySQL Server.
2. Open `database/praccode.sql` from this project.
3. Execute the script. It creates `praccode_db`, `users`, `typing_results`, and `user_settings`.
4. If you already created `praccode_db`, the `CREATE TABLE IF NOT EXISTS` statements preserve existing tables and data.

## 2. Configure Node.js
1. Install Node.js LTS from https://nodejs.org/ if it is not installed.
2. Open this project folder in VS Code or File Explorer.
3. Copy `.env.example` and name the copy `.env`.
4. Edit `.env` and enter the credentials for the MySQL Server that is already running:
   - `DB_HOST=127.0.0.1`
   - `DB_PORT=3306`
   - `DB_USER=root` (or your MySQL user)
   - `DB_PASSWORD=` (enter your actual MySQL password if one is set)
   - `DB_NAME=praccode_db`
   - Change `SESSION_SECRET` to a long random value.

Do not share or commit `.env`.

## 3. Install and run
Open PowerShell **inside the folder containing `package.json` and `server.js`**, then run:

```powershell
npm install
npm start
```

Keep that terminal open while using PracCode. You should see:
`PracCode is running at http://localhost:3000`

Open:
- Homepage: http://localhost:3000/
- Register: http://localhost:3000/PracCode/pages/register.html
- Login: http://localhost:3000/PracCode/pages/login.html
- API/database check: http://localhost:3000/api/health

## Registration and login
- Registration inserts into `users` and hashes passwords with bcrypt.
- Duplicate email/username values are rejected.
- Successful registration starts a session automatically.
- Login checks the bcrypt password hash and starts a session.
- Sessions use an HTTP-only cookie.

## Troubleshooting
- `ECONNREFUSED`: MySQL Server is not running or host/port is incorrect.
- `ER_ACCESS_DENIED_ERROR`: check `DB_USER` and `DB_PASSWORD` in `.env`.
- `ER_BAD_DB_ERROR`: execute `database/praccode.sql` in MySQL Workbench.
- `ER_NO_SUCH_TABLE`: check that `DB_NAME=praccode_db` and execute the SQL script.
- `Cannot find module`: run `npm install` in the project root.
- Port 3000 in use: set `PORT=3001` in `.env`, then visit `http://localhost:3001`.

Google/GitHub OAuth, email verification and forgot-password delivery are not enabled in this build; those require provider/SMTP credentials and dedicated token flows. The existing verification and forgot-password pages are retained as UI pages, not represented as working services.
