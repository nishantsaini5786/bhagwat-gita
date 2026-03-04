# 🕉 Gita Wisdom — Backend API

Production-ready Node.js backend with JWT + Sessions, Google OAuth, Email Verification, Password Reset, and Rate Limiting.

---

## 📁 Project Structure

```
gita-wisdom-backend/
│
├── server.js                  ← Main entry point
├── .env.example               ← Copy to .env and fill values
├── package.json
│
├── config/
│   ├── db.js                  ← MongoDB connection
│   └── passport.js            ← Google OAuth + JWT strategy
│
├── controllers/
│   ├── authController.js      ← Register, Login, Verify, Reset, OAuth
│   └── userController.js      ← Profile, Progress, Mood, Stats
│
├── middleware/
│   ├── auth.js                ← protect + requireVerified
│   ├── rateLimiter.js         ← Anti-brute-force limits
│   └── validate.js            ← Input validation rules
│
├── models/
│   └── User.js                ← Complete User schema
│
├── routes/
│   ├── authRoutes.js          ← /api/auth/*
│   └── userRoutes.js          ← /api/user/*
│
└── utils/
    ├── tokenHelper.js         ← JWT generation + cookie helper
    └── emailService.js        ← Beautiful HTML emails
```

---

## 🚀 Setup (Step by Step)

### Step 1 — Install dependencies
```bash
cd gita-wisdom-backend
npm install
```

### Step 2 — Create .env file
```bash
cp .env.example .env
```
Then open `.env` and fill in all values.

### Step 3 — MongoDB Setup
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Click **Connect** → **Drivers** → copy the URI
4. Paste in `.env` as `MONGO_URI`
5. Replace `<username>` and `<password>` with your DB user credentials

### Step 4 — Gmail App Password (for emails)
1. Go to your Google Account → Security
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Generate a password for "Mail"
5. Paste it in `.env` as `EMAIL_PASS`

### Step 5 — Google OAuth (for "Login with Google")
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Go to **APIs & Services** → **Credentials**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Step 6 — Run the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB Connected: cluster.mongodb.net
🕉  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    GITA WISDOM BACKEND RUNNING
    Port:  5000
    Mode:  development
🕉  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`

---

### 🔐 Auth Routes — `/api/auth`

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login with email+password | ❌ |
| POST | `/logout` | Logout + clear session | ✅ |
| GET  | `/me` | Get current user | ✅ |
| GET  | `/verify-email/:token` | Verify email from link | ❌ |
| POST | `/forgot-password` | Send password reset email | ❌ |
| POST | `/reset-password/:token` | Reset password | ❌ |
| POST | `/refresh-token` | Refresh JWT | ❌ |
| GET  | `/google` | Start Google OAuth | ❌ |
| GET  | `/google/callback` | Google OAuth callback | ❌ |

---

### 👤 User Routes — `/api/user` (all require login)

| Method | Route | Description |
|--------|-------|-------------|
| PUT | `/profile` | Update profile info |
| GET | `/stats` | Get all stats |
| POST | `/next-shlok` | Update shlok progress |
| POST | `/favorite` | Toggle favorite shlok |
| POST | `/bookmark` | Toggle bookmark |
| POST | `/mood` | Log daily mood |
| PUT | `/change-password` | Change password |
| DELETE | `/account` | Delete account |

---

### 📥 Request/Response Examples

#### Register
```js
// POST /api/auth/register
{
  "name": "Arjun Sharma",
  "email": "arjun@email.com",
  "password": "mypass123",
  "confirmPassword": "mypass123",
  "age": 24,
  "phone": "+91 98765 43210"
}

// Response 201
{
  "success": true,
  "message": "Account created! We sent a verification email..."
}
```

#### Login
```js
// POST /api/auth/login
{
  "email": "arjun@email.com",
  "password": "mypass123"
}

// Response 200 — also sets httpOnly cookies
{
  "success": true,
  "message": "Welcome back, Arjun! 🙏",
  "accessToken": "eyJhbGci...",
  "user": { "_id": "...", "name": "...", "email": "...", ... }
}
```

#### Update Progress (after reading shlok)
```js
// POST /api/user/next-shlok
{
  "chapter": 2,
  "verse": 47
}

// Response
{
  "success": true,
  "totalRead": 5,
  "streak": 3
}
```

#### Toggle Favorite
```js
// POST /api/user/favorite
{ "chapter": 2, "verse": 47 }

// Response
{ "success": true, "action": "added", "message": "Added to favorites! ❤️" }
```

#### Log Mood
```js
// POST /api/user/mood
{ "mood": "🧘 Peaceful", "shlokRef": "Ch.2 · V.47" }
```

---

## 🔌 Connecting Frontend to Backend

In your `dashboard.html`, replace the fake `nextShlok()` function:

```js
// OLD (fake):
function nextShlok() {
  alert("Next shlok will generate (backend later)");
}

// NEW (real):
async function nextShlok() {
  const btn = document.getElementById('nextBtn');
  btn.classList.add('loading');
  try {
    const res = await fetch('http://localhost:5000/api/user/next-shlok', {
      method: 'POST',
      credentials: 'include', // Send cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapter: currentChapter, verse: currentVerse })
    });
    const data = await res.json();
    if (data.success) {
      state.readCount = data.totalRead;
      state.streak    = data.streak;
      // ... load next shlok UI
    }
  } catch (err) {
    console.error(err);
  }
  btn.classList.remove('loading');
}
```

---

## 🛡️ Security Features

| Feature | Details |
|---------|---------|
| **Password Hashing** | bcrypt with 12 salt rounds |
| **JWT Auth** | Access token (7d) + Refresh token (30d) |
| **HTTP-only Cookies** | JS cannot steal tokens |
| **Rate Limiting** | 10 login attempts / 15 min per IP |
| **Helmet** | Security HTTP headers |
| **Input Validation** | express-validator on all inputs |
| **CORS** | Only your frontend domain allowed |
| **Session Store** | MongoDB (not memory — production safe) |

---

## 🚀 Deployment (When Ready)

1. Use **Railway.app** or **Render.com** (free, easy)
2. Add all `.env` variables in the platform dashboard
3. Change `NODE_ENV=production` in env
4. Update `FRONTEND_URL` to your live domain
5. Update Google OAuth callback URL in Google Console

---

*Made with 🙏 for Gita Wisdom*
