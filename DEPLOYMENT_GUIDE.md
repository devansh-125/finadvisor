# FinAdvisor Deployment Guide

## Render (Backend) + Vercel (Frontend)

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with the repository pushed
- [ ] MongoDB Atlas account with a database cluster
- [ ] Google Cloud Console project with OAuth 2.0 credentials
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] OpenRouter API key (for AI features)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster (or use existing)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/finadvisor?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials
6. **Important**: Add `0.0.0.0/0` to Network Access to allow Render to connect

---

## 🔐 Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Configure the OAuth consent screen first if prompted
6. For **Application type**, select **"Web application"**
7. Add these URIs (update after getting your Render URL):

   **Authorized JavaScript origins:**

   ```
   https://your-app.vercel.app
   http://localhost:5173
   ```

   **Authorized redirect URIs:**

   ```
   https://your-backend.onrender.com/api/auth/google/callback
   http://localhost:5000/api/auth/google/callback
   ```

8. Copy the **Client ID** and **Client Secret**

---

## 🚀 Step 3: Deploy Backend to Render

### 3.1 Push to GitHub

```bash
cd finadvisor
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 3.2 Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   | Setting            | Value                                    |
   | ------------------ | ---------------------------------------- |
   | **Name**           | `finadvisor-backend`                     |
   | **Region**         | Choose nearest (e.g., Oregon, Singapore) |
   | **Branch**         | `main`                                   |
   | **Root Directory** | `backend`                                |
   | **Runtime**        | `Node`                                   |
   | **Build Command**  | `npm install`                            |
   | **Start Command**  | `npm start`                              |
   | **Plan**           | Free (or paid for better performance)    |

5. Click **"Advanced"** and add these **Environment Variables**:

   | Key                    | Value                                                       |
   | ---------------------- | ----------------------------------------------------------- |
   | `NODE_ENV`             | `production`                                                |
   | `PORT`                 | `5000`                                                      |
   | `MONGO_URI`            | `mongodb+srv://...` (your MongoDB URI)                      |
   | `JWT_SECRET`           | `your-random-secret-minimum-32-chars`                       |
   | `GOOGLE_CLIENT_ID`     | `your-client-id.apps.googleusercontent.com`                 |
   | `GOOGLE_CLIENT_SECRET` | `your-client-secret`                                        |
   | `FRONTEND_URL`         | `https://your-app.vercel.app` (update after Vercel deploy)  |
   | `BACKEND_URL`          | `https://finadvisor-backend.onrender.com` (your Render URL) |
   | `OPENROUTER_API_KEY`   | `your-openrouter-key`                                       |

6. Click **"Create Web Service"**
7. Wait for deployment (first deploy takes 5-10 minutes)
8. **Copy your Render URL**: `https://finadvisor-backend.onrender.com`

---

## 🌐 Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure the project:

   | Setting              | Value           |
   | -------------------- | --------------- |
   | **Framework Preset** | `Vite`          |
   | **Root Directory**   | `frontend`      |
   | **Build Command**    | `npm run build` |
   | **Output Directory** | `dist`          |

5. Add **Environment Variables**:

   | Key            | Value                                                       |
   | -------------- | ----------------------------------------------------------- |
   | `VITE_API_URL` | `https://finadvisor-backend.onrender.com` (your Render URL) |

6. Click **"Deploy"**
7. Wait for deployment (usually 1-2 minutes)
8. **Copy your Vercel URL**: `https://your-app.vercel.app`

---

## 🔄 Step 5: Update URLs (Important!)

After both are deployed, you need to update the URLs:

### 5.1 Update Render Environment Variables

1. Go to Render Dashboard → Your Service → Environment
2. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Click **"Save Changes"** (service will auto-redeploy)

### 5.2 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com) → Credentials
2. Edit your OAuth 2.0 Client
3. Add your production URLs:

   **Authorized JavaScript origins:**

   ```
   https://your-app.vercel.app
   ```

   **Authorized redirect URIs:**

   ```
   https://finadvisor-backend.onrender.com/api/auth/google/callback
   ```

4. Save changes

---

## ✅ Step 6: Test Your Deployment

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Click **"Sign in with Google"**
3. Complete the OAuth flow
4. Verify you're redirected to the dashboard
5. Test adding an expense
6. Test the AI chat feature

---

## 🐛 Troubleshooting

### Backend not starting on Render?

- Check the Render logs for errors
- Verify all environment variables are set correctly
- Make sure MongoDB Atlas allows connections from `0.0.0.0/0`

### Google OAuth not working?

- Verify redirect URI matches exactly (including https://)
- Check that BACKEND_URL is correctly set
- Look for CORS errors in browser console

### Frontend not connecting to backend?

- Check VITE_API_URL is set correctly in Vercel
- Verify backend is running (visit your Render URL directly)
- Check browser console for CORS errors

### Session/Cookie issues?

- The app uses `sameSite: 'none'` and `secure: true` in production
- Ensure both frontend and backend use HTTPS

### Free tier limitations?

- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading to a paid plan for production use

---

## 📁 Files Created for Deployment

```
finadvisor/
├── backend/
│   ├── render.yaml          # Render configuration
│   └── .env.production       # Production env template
├── frontend/
│   ├── vercel.json           # Vercel configuration
│   └── .env.production       # Production env template
└── DEPLOYMENT_GUIDE.md       # This file
```

---

## 🔗 Quick Reference

| Service              | URL                              |
| -------------------- | -------------------------------- |
| Render Dashboard     | https://dashboard.render.com     |
| Vercel Dashboard     | https://vercel.com/dashboard     |
| MongoDB Atlas        | https://cloud.mongodb.com        |
| Google Cloud Console | https://console.cloud.google.com |
| OpenRouter           | https://openrouter.ai            |

---

## 🎉 Done!

Your FinAdvisor app should now be live at:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://finadvisor-backend.onrender.com`

Remember to keep your environment variables secure and never commit them to Git!
