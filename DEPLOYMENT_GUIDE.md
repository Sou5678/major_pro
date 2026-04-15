# ResumeIQ Deployment Guide 🚀

Complete step-by-step guide to deploy your ResumeIQ application to production.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- MongoDB Atlas account (free tier works)
- Supabase account (free tier works)
- Groq API key (free)
- OpenRouter API key (optional)

---

## Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Login
3. Click **"Build a Database"**
4. Select **"M0 Free"** tier
5. Choose cloud provider: **AWS** (recommended)
6. Select region closest to your users
7. Cluster name: `resumeiq-cluster`
8. Click **"Create"**

### 1.2 Configure Database Access
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `resumeiq-admin`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 1.3 Configure Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Vercel deployment
4. Click **"Confirm"**

### 1.4 Get Connection String
1. Go to **"Database"** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://resumeiq-admin:<password>@resumeiq-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Save this connection string for later

---

## Step 2: Setup Supabase (File Storage)

### 2.1 Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Sign up / Login
3. Click **"New Project"**
4. Organization: Create new or select existing
5. Project name: `resumeiq`
6. Database password: Generate strong password (save it!)
7. Region: Choose closest to your users
8. Click **"Create new project"** (wait 2-3 minutes)

### 2.2 Create Storage Bucket
1. Go to **"Storage"** (left sidebar)
2. Click **"Create a new bucket"**
3. Name: `resumes`
4. Public bucket: **OFF** (keep private)
5. Click **"Create bucket"**

### 2.3 Set Bucket Policies
1. Click on `resumes` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"** → **"For full customization"**
4. Policy name: `Allow authenticated uploads`
5. Add this policy:
   ```sql
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'resumes');
   ```
6. Add another policy for downloads:
   ```sql
   CREATE POLICY "Allow authenticated downloads"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'resumes');
   ```

### 2.4 Get API Keys
1. Go to **"Settings"** → **"API"**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (different long string)
3. Save all three for later

---

## Step 3: Get AI API Keys

### 3.1 Groq API (Free & Fast)
1. Go to [Groq Console](https://console.groq.com)
2. Sign up / Login with Google
3. Go to **"API Keys"**
4. Click **"Create API Key"**
5. Name: `ResumeIQ Production`
6. Copy the key: `gsk_...`
7. Save it (you won't see it again!)

### 3.2 OpenRouter API (Optional Backup)
1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up / Login
3. Go to **"Keys"**
4. Click **"Create Key"**
5. Name: `ResumeIQ`
6. Copy the key: `sk-or-...`
7. Add credits if needed ($5 minimum)

---

## Step 4: Prepare Your Code for Deployment

### 4.1 Create Production Environment File
Create `.env.production` in your project root:

```bash
# Database
MONGODB_URI="your-mongodb-connection-string-from-step-1"
MONGODB_DB_NAME="resumeiq"

# Auth
JWT_SECRET="generate-a-random-64-character-string-here"

# AI APIs
GROQ_API_KEY="your-groq-api-key-from-step-3"
GROQ_MODEL="llama-3.1-8b-instant"
GROQ_ENABLED="true"
OPENROUTER_API_KEY="your-openrouter-key-optional"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"

# File Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url-from-step-2"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_STORAGE_BUCKET="resumes"

# App Config
NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"
NEXT_PUBLIC_APP_NAME="ResumeIQ"
FREE_PLAN_ANALYSIS_LIMIT=3
NEXT_PUBLIC_FREE_PLAN_ANALYSIS_LIMIT=3

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

### 4.2 Generate JWT Secret
Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET`

### 4.3 Update .gitignore
Make sure `.env.production` is in `.gitignore`:

```
.env
.env.*
.env.local
.env.production
```

---

## Step 5: Push Code to GitHub

### 5.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 5.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click **"New repository"**
3. Repository name: `resumeiq`
4. Visibility: **Private** (recommended)
5. Don't initialize with README (you already have code)
6. Click **"Create repository"**

### 5.3 Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/resumeiq.git
git branch -M main
git push -u origin main
```

---

## Step 6: Deploy to Vercel

### 6.1 Import Project
1. Go to [Vercel](https://vercel.com)
2. Sign up / Login with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `resumeiq` repository
5. Click **"Import"**

### 6.2 Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave as is)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### 6.3 Add Environment Variables
Click **"Environment Variables"** and add ALL variables from your `.env.production`:

**Required Variables:**
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `GROQ_ENABLED`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_APP_URL` (use `https://your-project.vercel.app`)
- `NEXT_PUBLIC_APP_NAME`
- `FREE_PLAN_ANALYSIS_LIMIT`
- `NEXT_PUBLIC_FREE_PLAN_ANALYSIS_LIMIT`

**Optional Variables:**
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

### 6.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://resumeiq-xxxxx.vercel.app`

---

## Step 7: Post-Deployment Configuration

### 7.1 Update App URL
1. Copy your Vercel deployment URL
2. Go back to Vercel project settings
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Redeploy: **"Deployments"** → **"..."** → **"Redeploy"**

### 7.2 Setup Custom Domain (Optional)
1. In Vercel project, go to **"Settings"** → **"Domains"**
2. Add your custom domain (e.g., `resumeiq.com`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Redeploy

### 7.3 Test Your Deployment
1. Visit your deployed URL
2. Test signup/login
3. Upload a resume
4. Run analysis
5. Download resume
6. Check all features work

---

## Step 8: Setup Monitoring (Optional but Recommended)

### 8.1 Vercel Analytics
1. Go to **"Analytics"** tab in Vercel
2. Enable **Web Analytics** (free)
3. Enable **Speed Insights** (free)

### 8.2 Error Tracking
Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay

---

## Troubleshooting Common Issues

### Build Fails
**Error**: `Module not found`
- **Solution**: Run `npm install` locally and commit `package-lock.json`

**Error**: `Type errors`
- **Solution**: Run `npm run typecheck` locally and fix errors

### Database Connection Fails
**Error**: `MongoServerError: Authentication failed`
- **Solution**: Check MongoDB username/password in connection string
- **Solution**: Verify IP whitelist includes 0.0.0.0/0

### File Upload Fails
**Error**: `Supabase storage error`
- **Solution**: Check bucket policies are set correctly
- **Solution**: Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

### AI Analysis Fails
**Error**: `Groq API error`
- **Solution**: Check API key is valid
- **Solution**: Verify you have credits/quota remaining
- **Solution**: Enable OpenRouter as backup

---

## Maintenance & Updates

### Deploy New Changes
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Vercel will automatically deploy!

### View Logs
1. Go to Vercel project
2. Click **"Deployments"**
3. Click on latest deployment
4. View **"Build Logs"** or **"Function Logs"**

### Rollback Deployment
1. Go to **"Deployments"**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

---

## Security Checklist ✅

- [ ] All environment variables are set in Vercel (not in code)
- [ ] `.env.production` is in `.gitignore`
- [ ] MongoDB has strong password
- [ ] Supabase bucket is private
- [ ] JWT_SECRET is random and secure (64+ characters)
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced (Vercel does this automatically)

---

## Cost Breakdown (Free Tier)

- **Vercel**: Free (100GB bandwidth, unlimited deployments)
- **MongoDB Atlas**: Free (512MB storage, shared cluster)
- **Supabase**: Free (1GB storage, 2GB bandwidth)
- **Groq**: Free (limited requests per day)
- **Total**: $0/month for small-medium traffic

### When to Upgrade
- Vercel: > 100GB bandwidth/month
- MongoDB: > 512MB data or need dedicated cluster
- Supabase: > 1GB files or > 2GB bandwidth
- Groq: Need higher rate limits

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Supabase Docs**: https://supabase.com/docs
- **Groq Docs**: https://console.groq.com/docs

---

## Quick Deploy Checklist

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string copied
- [ ] Supabase project created
- [ ] Supabase storage bucket created
- [ ] Supabase API keys copied
- [ ] Groq API key obtained
- [ ] JWT secret generated
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] All environment variables added to Vercel
- [ ] First deployment successful
- [ ] App URL updated in environment variables
- [ ] All features tested in production

---

**Congratulations! 🎉 Your ResumeIQ app is now live!**
