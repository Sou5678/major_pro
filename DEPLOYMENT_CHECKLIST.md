# Deployment Checklist for ResumeIQ

## Issues Fixed

### 1. Navbar - Only "Sign in" Link
- ✅ Removed "Home" and "Pricing" links from navbar
- ✅ Only "Sign in" link remains in desktop and mobile views

### 2. Create Resume Button Visibility
- ✅ Changed from Button component to native button with inline styles
- ✅ Added forced rendering with inline styles to prevent CSS purging
- ✅ Added build version tracking for cache busting

### 3. Upload API Error Handling
- ✅ Enhanced error handling with specific error messages
- ✅ Added try-catch blocks for parsers (PDF, DOCX, LaTeX)
- ✅ Added database error handling
- ✅ Created health check endpoint at `/api/health`

## Deployment Steps

### Before Deploying

1. **Clear Build Cache**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Test Locally**
   ```bash
   npm run start
   ```
   - Verify "Create Resume" button is visible
   - Verify navbar only shows "Sign in"
   - Test file upload functionality

### Deploy to Production

1. **Commit all changes**
   ```bash
   git add .
   git commit -m "Fix: Create Resume button visibility and navbar links"
   git push origin main
   ```

2. **Clear Deployment Cache** (Platform-specific)

   **For Vercel:**
   - Go to your project settings
   - Navigate to "Deployments"
   - Click "..." on the latest deployment
   - Select "Redeploy" and check "Clear build cache"
   
   **For Netlify:**
   - Go to "Deploys" tab
   - Click "Trigger deploy"
   - Select "Clear cache and deploy site"

3. **Force Browser Cache Clear**
   - After deployment, clear your browser cache
   - Or open in incognito/private mode
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Verify Deployment

1. **Check Health Endpoint**
   ```
   https://your-domain.com/api/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "environment": {...},
     "config": {
       "mongodbConfigured": true,
       "groqConfigured": true,
       "jwtConfigured": true,
       "supabaseConfigured": true
     }
   }
   ```

2. **Check Navbar**
   - Visit homepage
   - Verify only "Sign in" link is visible
   - No "Home" or "Pricing" links

3. **Check Sidebar (Dashboard)**
   - Sign in to dashboard
   - Verify "Create Resume" button is visible above "New Analysis"
   - Click button to verify dialog opens

4. **Test Upload**
   - Try uploading a PDF resume
   - Check browser console for any errors
   - If error occurs, check deployment logs for detailed error message

## Troubleshooting

### "Create Resume" Button Still Not Visible

1. **Check browser console** for errors
2. **Clear browser cache** completely
3. **Check deployment logs** for build errors
4. **Verify environment variables** are set correctly
5. **Check if CSS is being purged** - look for missing styles in DevTools

### Navbar Still Shows Old Links

1. **Hard refresh** the page (Ctrl+Shift+R)
2. **Clear browser cache**
3. **Check if CDN cache** needs to be purged
4. **Verify latest commit** is deployed

### Upload API Returns 500 Error

1. **Check `/api/health` endpoint** for configuration issues
2. **Check deployment logs** for specific error messages
3. **Verify environment variables**:
   - MONGODB_URI
   - JWT_SECRET
   - GROQ_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
4. **Check file size** - must be under 10MB
5. **Check file type** - only PDF, DOCX, TEX supported

## Environment Variables Required

```env
# Database
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=resumeiq

# Auth
JWT_SECRET=your-jwt-secret

# AI APIs
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
GROQ_ENABLED=true

# File Storage
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App Config
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=ResumeIQ
FREE_PLAN_ANALYSIS_LIMIT=3
NEXT_PUBLIC_FREE_PLAN_ANALYSIS_LIMIT=3
```

## Build Version

Current build version: `2024-01-20-v2`

Update `lib/version.ts` when making significant changes to force cache busting.

## Support

If issues persist after following this checklist:
1. Check deployment platform logs
2. Check browser console for errors
3. Test in incognito mode
4. Verify all environment variables are set
5. Check `/api/health` endpoint for configuration status
