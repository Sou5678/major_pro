# 🧪 Sign-In Test Instructions

## ⚠️ IMPORTANT: Server is running on PORT 3001 (not 3000)

Your dev server is running at: **http://localhost:3001**

---

## 🔧 Step-by-Step Testing

### Step 1: Clear Browser Data
```
1. Open browser (Chrome/Edge)
2. Press F12 (DevTools)
3. Go to "Application" tab
4. Click "Clear site data"
5. OR use Incognito/Private window
```

### Step 2: Open Sign-In Page
```
Go to: http://localhost:3001/signin
```

### Step 3: Open Console (Important!)
```
Press F12 → Console tab
You'll see logs like:
[AuthProvider] Fetching session...
[AuthProvider] Session data: no user
```

### Step 4: Sign In
```
Enter your credentials:
- Email: your-email@example.com
- Password: your-password

Click "Sign in"
```

### Step 5: Watch Console Logs
```
You should see:
✅ Signing in...
✅ Response status: 200
✅ Setting user: { id: "...", email: "..." }
✅ [AuthProvider] Applying user: authenticated
✅ Navigating to: /dashboard
✅ [AuthGuard] Status: authenticated
✅ [AuthGuard] Authenticated, showing children
```

### Step 6: Verify Dashboard Opens
```
✅ URL should change to: http://localhost:3001/dashboard
✅ You should see your dashboard with resumes
✅ No redirect back to signin
```

---

## 🐛 If Still Not Working

### Check Console for Errors:

**If you see "401 Unauthorized":**
```javascript
// Check if cookie is being set
document.cookie  // Should show "resumeiq_token=..."
```

**If you see redirect loop:**
```javascript
// Check auth state
[AuthGuard] Status: unauthenticated  // ❌ Problem
[AuthGuard] Status: authenticated    // ✅ Good
```

**If you see "CORS error":**
```
Make sure you're using http://localhost:3001 (not 3000)
```

---

## 🔍 Debug Commands

### Check if user exists in database:
```bash
# If using MongoDB
mongosh
use resumeiq
db.users.find({ email: "your-email@example.com" })
```

### Check if cookie is set:
```javascript
// In browser console
document.cookie
// Should show: resumeiq_token=eyJhbGc...
```

### Check session API:
```bash
# In terminal
curl http://localhost:3001/api/auth/session -H "Cookie: resumeiq_token=YOUR_TOKEN"
```

---

## ✅ Expected Behavior

### Before Fix (❌):
1. Sign in → Success
2. Stay on /signin page
3. Redirect loop
4. Never reach dashboard

### After Fix (✅):
1. Sign in → Success
2. Full page reload
3. Dashboard opens immediately
4. No redirect loop

---

## 🎯 Key Changes Applied

1. **Sign-in form now uses `window.location.href`** instead of `router.push()`
   - This forces a full page reload
   - Fresh auth state from server
   - No race condition

2. **Improved cookie security**
   - Removed non-httpOnly cookie
   - Added CORS headers

3. **Enhanced logging**
   - Track auth flow in console
   - Easier debugging

---

## 📞 Still Having Issues?

Share these details:

1. **Console logs** (copy all logs from signin attempt)
2. **Network tab** (check /api/auth/signin response)
3. **Application tab** → Cookies (check if resumeiq_token exists)
4. **Current URL** after signin attempt

---

## 🚀 Quick Test Account

If you don't have an account, create one:

```
1. Go to: http://localhost:3001/signup
2. Fill in details
3. Click "Create account"
4. Should redirect to dashboard ✅
```

---

**Server URL**: http://localhost:3001  
**Fix Applied**: ✅ Yes  
**Status**: Ready for Testing  
