# EcoQuest: Interactive Gamified Learning Platform

A full-stack learning platform for **classes 8, 9 and 10** covering **Physics, Chemistry, Biology and Maths**
(E1CSA313 Design Project -1). Students learn through interactive lessons with live simulations, take quizzes,
earn XP, levels and badges, and complete teacher missions. Teachers create classes, assign missions, approve
work and see analytics.

**Stack:** React (Vite) + Tailwind CSS + React Router + Framer Motion + Recharts + Lucide icons on the front;
Node.js + Express + Mongoose + JWT + bcryptjs on the back; MongoDB (local or Atlas). No paid services.

## Content included (loaded by `npm run seed`)

12 interactive lessons and 12 quizzes: one for each subject in each class.

| Class | Physics | Chemistry | Biology | Maths |
|---|---|---|---|---|
| 8 | Force and Pressure | Combustion and Flame | Cell: The Basic Unit of Life | Algebraic Identities |
| 9 | Motion | Structure of the Atom | Diffusion and Osmosis | Linear Equations in Two Variables |
| 10 | Electricity and Ohm's Law | Acids, Bases and Salts | Heredity: Mendel's Experiments | Quadratic Equations |

Every lesson mixes short explanations, an **interactive simulation**, quick checks with instant feedback, and a
"think about it" question. Finishing a lesson gives XP once, then unlocks its quiz.

| Simulation | What you can do |
|---|---|
| Pressure lab | Change force and area and watch pressure change |
| Motion lab | Drive a car and see distance = speed x time |
| Circuit lab | Change voltage and resistance; the bulb glows and the charges speed up |
| Fire triangle | Remove fuel, oxygen or heat and see the fire go out |
| Atom builder | Pick any element from 1 to 18 and see its shells and electrons orbit |
| pH scale | Slide along the pH scale and watch the liquid change colour |
| Cell explorer | Switch between plant and animal cells and tap each part |
| Osmosis lab | Put a cell in different solutions and watch it swell or shrink |
| Punnett square | Choose the parents' genes and see the offspring |
| Identity visualiser | See (a + b)^2 as the area of a square |
| Line grapher | Change slope and intercept and watch the line move |
| Parabola grapher | Move a parabola and see its roots and discriminant |

## What each role can do

| Role | Features |
|---|---|
| Student | Sign up, join a class by code, learn from lessons, take quizzes (graded on the server), earn XP / levels / badges, submit missions, log eco actions, see the dashboard chart and leaderboard |
| Teacher | Sign up with an invite code, create classes, assign missions, approve or reject submissions (approval gives XP), view class analytics, preview lessons, create new quizzes through the API |

## Project structure

```
gamified-learning-platform/
├── README.md
├── postman/                     import this into Postman
├── server/
│   ├── package.json             scripts: dev, start, seed
│   ├── .env.example             copy to .env
│   └── src/
│       ├── server.js, app.js
│       ├── config/              env.js, db.js
│       ├── models/              User, ClassRoom, Challenge, Lesson, LessonProgress, Attempt,
│       │                        Mission, MissionSubmission, EcoAction
│       ├── services/            gamification.js (levels, XP, badges)
│       ├── controllers/         auth, class, lesson, challenge, mission, ecoAction, stats
│       ├── routes/              one file per feature, mounted in routes/index.js
│       ├── middleware/          auth (login + role checks), errorHandler, rateLimiters
│       ├── utils/               AppError, validators, token, ownership
│       └── seed/                content.js (all lessons and quizzes), seed.js
└── client/
    ├── package.json, vite.config.js, tailwind.config.js
    └── src/
        ├── main.jsx, App.jsx
        ├── context/             AuthContext
        ├── lib/                 api.js, useFetch.js, useGrade.js, subjects.js
        ├── components/          Navbar, ProtectedRoute, FormField, ui, AnimatedNumber, Confetti
        ├── simulations/         12 interactive simulations (Physics, Chemistry, Biology, Maths)
        └── pages/               Home, Login, Register, dashboards, Lessons, LessonView, Challenges,
                                 ChallengePlay, EcoActions, Classes, ClassDetail, Missions, Leaderboard
```

## Run it on your computer

You need Node.js 20 or newer, VS Code, and MongoDB (local with Compass, or a free Atlas cluster).
Use **two terminals** in VS Code: one for the server, one for the website.

### 1. Backend (terminal 1)

```bash
cd server
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```

Edit `server/.env`:

1. `MONGODB_URI`: local `mongodb://127.0.0.1:27017/gamified_learning`, or your Atlas string.
2. `JWT_SECRET`: at least 32 random characters. Generate one with
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
3. `TEACHER_INVITE_CODE`: the code teachers type to sign up (for example `teacher2026`).

Then load the lessons and quizzes and start the server:

```bash
npm run seed       # lessons, quizzes and demo accounts (safe to run again)
npm run dev
```

You should see `MongoDB connected` and `API running at http://localhost:5000/api`.
Check `http://localhost:5000/api/health` in your browser.

### 2. Frontend (terminal 2)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

### Demo accounts (created by `npm run seed`, password for all: `DemoPass123`)

| Role | Email |
|---|---|
| Teacher | teacher@demo.edu |
| Student | asha@demo.edu |
| Student | ravi@demo.edu |

The demo class is "Class 9 Science and Maths" with join code `SCI101`.

### A good first test

1. Log in as `asha@demo.edu`. Open **Lessons**, pick Class 10, Chemistry, and open *Acids, Bases and Salts*.
2. Slide the pH scale, answer the quick checks, and press **Finish lesson**. XP and a badge appear.
3. Press **Take the quiz**, finish it, and watch the score and XP count up.
4. Open **Missions**, submit "Draw and label a plant cell". Log in as the teacher, approve it under Missions, then check Classes, Analytics.

## Game rules

* **Levels:** every 100 XP is one level.
* **Lessons:** 30 XP each, given once, after all quick checks are answered correctly.
* **Quizzes:** a perfect score gives the quiz's full XP. Retrying only adds XP for beating your best, so XP cannot be farmed.
* **Missions:** XP set by the teacher, given when the teacher approves.
* **Eco actions:** 10 to 20 XP each, up to 5 per day.
* **Badges:** First Steps, Perfect Score, Quiz Master (10 attempts), Curious Mind (first lesson), Knowledge Seeker (5 lessons), Eco Starter, Eco Hero, Mission Complete, Rising Star (500 XP).

## Adding your own content

* **More lessons and quizzes:** copy an entry in `server/src/seed/content.js`, change the text, and run `npm run seed`. A lesson uses the quiz with the same subject, class and title.
* **A new simulation:** add a React component in `client/src/simulations/` and register it in `simulations/index.js`, then use its name as a `sim` block in a lesson.
* **Teacher quizzes:** `POST /challenges` (see the Postman example). There is no web form for this yet.

## API overview

All responses look like `{ "success": true, "data": {...} }` or `{ "success": false, "message": "..." }`.
Import `postman/gamified-learning.postman_collection.json` into Postman to try every request. Logging in saves the token automatically.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET/PATCH /auth/me`, `POST /auth/change-password` |
| Lessons | `GET /lessons?subject=&grade=`, `GET /lessons/:id`, `POST /lessons/:id/complete` (student) |
| Challenges | `GET /challenges?subject=&grade=`, `GET /challenges/:id`, `POST /challenges/:id/attempt` (student), `POST /challenges` (teacher) |
| Classes | `POST /classes` (teacher), `GET /classes`, `POST /classes/join` (student), `GET /classes/:id/analytics` (teacher), `GET /classes/:id/leaderboard` |
| Missions | `POST /missions` (teacher), `GET /missions`, `POST /missions/:id/submit` (student), `GET /missions/:id/submissions` (teacher), `PATCH /missions/submissions/:id/review` (teacher) |
| Eco actions | `POST /eco-actions`, `GET /eco-actions` (students) |
| Stats | `GET /stats/me` (student), `GET /stats/leaderboard` |

## Security notes

* Passwords are hashed with bcrypt. The login token is stored in an httpOnly cookie, so page scripts cannot read it.
* Roles are checked on the server for every request, never only in the browser.
* Quiz answers are never sent to the browser before submission. Grading happens on the server. (Lesson quick checks show their answers in the browser because they are practice only and give no quiz XP.)
* Input is validated, NoSQL operators are stripped from queries, and login attempts are rate limited.
* `.env` is ignored by Git. Never push it to GitHub.

## Putting it online (optional, free tiers)

1. **Database:** MongoDB Atlas free cluster. Put its connection string in `MONGODB_URI`.
2. **Backend:** a Node host such as Render. Root folder `server`, build command `npm install`, start command `npm start`. Set the environment variables from `.env.example`, with `NODE_ENV=production`. The seed script refuses to run in production, so run it once from your own computer against the Atlas database (with `NODE_ENV=development` in your local `.env`).
3. **Frontend:** a static host such as Netlify or Vercel. Root folder `client`, build command `npm run build`, publish folder `dist`. Set `VITE_API_URL` to your backend address ending in `/api`. The file `client/public/_redirects` makes page refreshes work on Netlify. On Vercel add a rewrite of all paths to `/index.html`.
4. **Connect them:** set `CORS_ORIGIN` on the backend to your frontend address. If the two are on different domains, also set `COOKIE_SAME_SITE=none`. Some browsers block cookies between different domains, so using one custom domain for both is more reliable.

## Common errors

| Symptom | Likely cause and fix |
|---|---|
| `Missing settings in server/.env` | The file must be at `server/.env`. |
| `JWT_SECRET must be at least 32 characters` | Generate a longer secret with the command above. |
| `MongoServerSelectionError` | MongoDB is not running (local) or your IP is not allowed (Atlas Network Access). |
| Website says "Cannot reach the server" | The backend is not running, or you opened `127.0.0.1` instead of `localhost`. |
| Lessons or Challenges page is empty | Run `npm run seed` in the server folder, then refresh. |
| Old environment-themed challenges still show | Run `npm run seed` again. It replaces all sample content. |
| `Too many attempts` | Failed logins are limited. Wait 15 minutes. |
| `Teacher sign-up is turned off` | Set `TEACHER_INVITE_CODE` in `server/.env` and restart. |
