# CodePatch STEM: site + server + admin

```
public/       the site (your Norse design, unchanged except the text pass)
admin/        the admin page, served at /admin
server.js     Express API + static hosting
seed.js       starting content, copied from the original site
```

## Run it locally
1. Install Node 18+ and have a MongoDB database (local, or a free MongoDB Atlas cluster).
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `MONGODB_URI`, `JWT_SECRET` (32+ random characters) and `ADMIN_PASSWORD`.
4. `npm start`
5. Site: http://localhost:3000   Admin: http://localhost:3000/admin

On first start the database is filled with the current team, events and FAQ. After that, the admin page is the source of truth.

## What the admin can edit
Events, Team (including order, roles, departments, president), FAQ, and it lists every interest-form submission (with CSV export).
STEM disciplines, departments and the page copy are still in `public/codepatch-stem.bundle.js`.

## How it connects
- The site calls `GET /api/content` on load. If the API is unreachable it quietly shows the built-in content.
- The interest form posts to `POST /api/interest` (limited to 8 per hour per IP) and shows the real ticket ID.
- Admin routes live under `/api/admin/*`. They need the login cookie (httpOnly, SameSite=Strict, 8 hours); login is limited to 10 tries per 15 minutes.

## Deploying (Render + MongoDB Atlas, both free)
See the steps in the chat reply, or in short: push this folder as the root of your GitHub repo, create an Atlas database, create a Render Web Service from the repo (build `npm install`, start `npm start`), and add the four environment variables.

### Notes
GitHub Pages cannot run this server. Use a Node host (Render, Railway, Fly.io) with MongoDB Atlas, set the same environment variables there, and set `NODE_ENV=production` so cookies are secure-only. Serve over HTTPS.
If you want the static site on one host and the API on another, add `<script>window.CP_API='https://your-api-host'</script>` before the bundle in `public/index.html` (you'll also need to add CORS and a cross-site cookie setup for the admin, which is why same-origin is simpler).

## Security notes
- Use a long, unique `ADMIN_PASSWORD`. There is one shared admin login; there are no per-user accounts.
- The admin page has a strict Content-Security-Policy. The public site has none, because it loads React and Three.js from esm.sh and fonts from Google.
- Submissions contain students' names and emails. Limit who has the password and the database credentials.
