# Quick Deploy Guide - ResumeIQ 🚀

**5-Minute Deployment** (if you already have accounts)

## Prerequisites Setup (One-time, ~15 minutes)

### 1. MongoDB Atlas (2 minutes)
```
1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up → Create M0 Free cluster
3. Database Access → Add user (save password!)
4. Network Access → Allow 0.0.0.0/0
5. Connect → Get connection string
```

### 2. Supabase (3 minutes)
```
1. Visit: https://supabase.com
2. New Project → Name: resumeiq
3. Storage → New bucket: "resumes" (private)
4. Settings → API → Copy URL + Keys
```

### 3. Groq API (1 minute)
```
1. Visit: https://console.groq.com
2. Sign up with Google
3. API Keys → Create → Copy key
```

### 4. Generate JWT Secret (30 seconds)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/resumeiq.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Visit: https://vercel.com
2. Import GitHub repository
3. Add these environment variables:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resumeiq
MONGODB_DB_NAME=resumeiq
JWT_SECRET=your-64-char-secret-from-step-4
GROQ_API_KEY=gsk_your_groq_key
GROQ_MODEL=llama-3.1-8b-instant
GROQ_ENABLED=true
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
SUPABASE_STORAGE_BUCKET=resumes
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=ResumeIQ
FREE_PLAN_ANALYSIS_LIMIT=3
NEXT_PUBLIC_FREE_PLAN_ANALYSIS_LIMIT=3
```

4. Click **Deploy**
5. Wait 2-3 minutes
6. Done! 🎉

---

## Verify Deployment

Visit your app URL and test:
- ✅ Sign up
- ✅ Upload resume
- ✅ Analyze resume
- ✅ Download resume

---

## Update App URL (Important!)

After first deployment:
1. Copy your Vercel URL
2. Update `NEXT_PUBLIC_APP_URL` in Vercel settings
3. Redeploy

---

## Troubleshooting

### Build fails?
```bash
# Test locally first
npm install
npm run build
npm run pre-deploy
```

### Database connection fails?
- Check MongoDB IP whitelist (0.0.0.0/0)
- Verify username/password in connection string
- Ensure database name is correct

### File upload fails?
- Check Supabase bucket is created
- Verify bucket name is "resumes"
- Check service role key is correct

### AI analysis fails?
- Verify Groq API key is valid
- Check you have quota remaining
- Try OpenRouter as backup

---

## Deploy Updates

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel auto-deploys! ✨

---

## Cost: $0/month

All services have generous free tiers:
- Vercel: 100GB bandwidth
- MongoDB: 512MB storage
- Supabase: 1GB storage
- Groq: Free tier

---

## Need Help?

See full guide: `DEPLOYMENT_GUIDE.md`

**Happy Deploying! 🚀**
