# Critical Fixes Implementation Guide

## 🔴 Priority 1: Security Fixes (Must Fix Before Production)

### Fix #1: Cookie Security Enhancement

**File**: `lib/auth.ts`

**Current Code** (Lines 82-95):
```typescript
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",  // ❌ INSECURE
    secure: process.env.NODE_ENV === "production",  // ❌ INSECURE
    path: "/",
    maxAge: SEVEN_DAYS,
  });
  
  // ❌ SECURITY RISK - Exposes auth state to client JS
  response.cookies.set(`${AUTH_COOKIE}_exists`, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
}
```

**Fixed Code**:
```typescript
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",  // ✅ Prevent CSRF attacks
    secure: true,        // ✅ Always require HTTPS
    path: "/",
    maxAge: SEVEN_DAYS,
  });
  
  // ✅ REMOVED - Don't expose auth state to client
  // Client should check via /api/auth/session instead
}
```

**Additional Changes Required**:
Update `components/shared/auth-provider.tsx` to remove dependency on client-side cookie check.

---

### Fix #2: MongoDB Connection Pool Fix

**File**: `lib/db/mongodb.ts`

**Current Code** (Lines 28-35):
```typescript
export async function getDatabase() {
  if (!globalForMongo.mongoClient) {
    const client = createClient();
    if (!client) {
      throw new Error("MONGODB_URI is not configured.");
    }
    globalForMongo.mongoClient = client;
  }

  await globalForMongo.mongoClient.connect();  // ❌ Connects every time!
  return globalForMongo.mongoClient.db(dbName);
}
```

**Fixed Code**:
```typescript
let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

export async function getDatabase() {
  if (!globalForMongo.mongoClient) {
    const client = createClient();
    if (!client) {
      throw new Error("MONGODB_URI is not configured.");
    }
    
    // ✅ Connect once during initialization
    if (!isConnecting && !connectionPromise) {
      isConnecting = true;
      connectionPromise = client.connect()
        .then(() => {
          globalForMongo.mongoClient = client;
          isConnecting = false;
        })
        .catch((error) => {
          isConnecting = false;
          connectionPromise = null;
          throw error;
        });
    }
    
    await connectionPromise;
  }

  // ✅ Return database without reconnecting
  return globalForMongo.mongoClient!.db(dbName);
}
```

---

### Fix #3: Password Reset Timing Attack Prevention

**File**: `app/api/auth/signin/route.ts`

**Current Code** (Lines 18-30):
```typescript
const user = await findRawUserByEmail(parsed.data.email);
if (!user) {
  // Constant-time response to prevent email enumeration
  await bcrypt.compare(parsed.data.password, "$2b$10$placeholder.hash.to.prevent.timing.attacks.xxxxx");
  return NextResponse.json(apiError("No account with this email. Sign up instead?", "EMAIL_NOT_FOUND"), {
    status: 404,  // ❌ Different status code reveals email existence!
  });
}

if (!user.password) {
  return NextResponse.json(apiError("Password login is not configured for this account.", "PASSWORD_DISABLED"), {
    status: 400,  // ❌ Different status code again!
  });
}
```

**Fixed Code**:
```typescript
const user = await findRawUserByEmail(parsed.data.email);

// ✅ Always run bcrypt to prevent timing attacks
const passwordToCheck = user?.password ?? "$2b$10$placeholder.hash.to.prevent.timing.attacks.xxxxx";
const matches = await bcrypt.compare(parsed.data.password, passwordToCheck);

// ✅ Use same error message and status for all failures
if (!user || !user.password || !matches) {
  return NextResponse.json(
    apiError("Invalid email or password", "INVALID_CREDENTIALS"), 
    { status: 401 }  // ✅ Always 401, never reveals which field is wrong
  );
}

const sessionUser = {
  id: user._id,
  email: user.email,
  name: user.name ?? null,
  image: user.image ?? null,
  plan: user.plan,
  analysisCount: user.analysisCount,
} as const;

const token = createAuthToken(sessionUser);
const response = NextResponse.json(apiSuccess({ user: sessionUser }));
setAuthCookie(response, token);
return response;
```

---

### Fix #4: File Upload Size Validation

**File**: `app/api/resume/upload/route.ts`

**Current Code** (Lines 30-45):
```typescript
const declaredSize = body.fileSize ?? 0;

if (declaredSize > MAX_FILE_SIZE) {  // ❌ Client can lie
  return NextResponse.json(apiError("File must be under 10MB", "FILE_TOO_LARGE"), { status: 400 });
}

if (!["pdf", "docx"].includes(extension)) {  // ❌ Client can lie about type
  return NextResponse.json(apiError("Only PDF and DOCX files are supported", "INVALID_FILE_TYPE"), { status: 400 });
}

const buffer = Buffer.from(fileBase64, "base64");
if (!buffer.length) {
  return NextResponse.json(apiError("We couldn't read this file. Try a different version.", "INVALID_BASE64"), {
    status: 400,
  });
}

if (buffer.length > MAX_FILE_SIZE) {  // ✅ Real check
  return NextResponse.json(apiError("File must be under 10MB", "FILE_TOO_LARGE"), { status: 400 });
}
```

**Fixed Code**:
```typescript
// ✅ Remove client-side size check entirely
if (!fileName || !extension || !fileBase64) {
  return NextResponse.json(apiError("Please upload a file.", "FILE_REQUIRED"), { status: 400 });
}

// ✅ Decode and validate size first
const buffer = Buffer.from(fileBase64, "base64");
if (!buffer.length) {
  return NextResponse.json(
    apiError("We couldn't read this file. Try a different version.", "INVALID_BASE64"), 
    { status: 400 }
  );
}

if (buffer.length > MAX_FILE_SIZE) {
  return NextResponse.json(
    apiError("File must be under 10MB", "FILE_TOO_LARGE"), 
    { status: 413 }  // ✅ Use proper HTTP status
  );
}

// ✅ Validate file type by magic bytes, not extension
const fileType = detectFileType(buffer);
if (!["pdf", "docx"].includes(fileType)) {
  return NextResponse.json(
    apiError("Only PDF and DOCX files are supported", "INVALID_FILE_TYPE"), 
    { status: 415 }  // ✅ Unsupported Media Type
  );
}
```

**Add File Type Detection**:
```typescript
function detectFileType(buffer: Buffer): string {
  // PDF magic bytes: %PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "pdf";
  }
  
  // DOCX magic bytes: PK (ZIP format)
  // DOCX is a ZIP file containing XML
  if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
    // Check for [Content_Types].xml which is specific to DOCX
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
    if (content.includes('[Content_Types].xml') || content.includes('word/')) {
      return "docx";
    }
  }
  
  return "unknown";
}
```

---

## 🟡 Priority 2: Performance Fixes

### Fix #5: Database Query Optimization

**File**: `lib/db/queries.ts`

**Current Code** (Lines 450-470):
```typescript
export async function getUserResumeHistoryPaginated(userId: string, page: number) {
  const skip = (page - 1) * RESUMES_PER_PAGE;

  const mongoResult = await withMongo(async (db) => {
    const filter = ObjectId.isValid(userId) ? { userId: new ObjectId(userId) } : null;
    if (!filter) return null;

    // ❌ Three separate queries!
    const [resumes, total, scoredResumes] = await Promise.all([
      db.collection("resumes").find(filter).skip(skip).limit(RESUMES_PER_PAGE).toArray(),
      db.collection("resumes").countDocuments(filter),
      db.collection("resumes").aggregate([
        { $match: { ...filter, overallScore: { $ne: null } } },
        { $group: { _id: null, avgScore: { $avg: "$overallScore" } } },
      ]).toArray(),
    ]);
  });
}
```

**Fixed Code**:
```typescript
export async function getUserResumeHistoryPaginated(userId: string, page: number) {
  const skip = (page - 1) * RESUMES_PER_PAGE;

  const mongoResult = await withMongo(async (db) => {
    const filter = ObjectId.isValid(userId) ? { userId: new ObjectId(userId) } : null;
    if (!filter) return null;

    // ✅ Single aggregation query for everything
    const result = await db.collection("resumes").aggregate([
      { $match: filter },
      {
        $facet: {
          // Get paginated resumes
          resumes: [
            { $sort: { updatedAt: -1 } },
            { $skip: skip },
            { $limit: RESUMES_PER_PAGE },
            {
              $project: {
                parsedText: 0,
                fileBase64: 0,
                parsedHtml: 0,
                parsedSections: 0,
              },
            },
          ],
          // Get metadata in parallel
          metadata: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                avgScore: {
                  $avg: {
                    $cond: [
                      { $ne: ["$overallScore", null] },
                      "$overallScore",
                      null,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]).toArray();

    const data = result[0];
    const metadata = data.metadata[0] || { total: 0, avgScore: 0 };

    return {
      resumes: data.resumes.map(mapResume),
      total: metadata.total,
      totalPages: Math.ceil(metadata.total / RESUMES_PER_PAGE),
      averageScore: Math.round(metadata.avgScore || 0),
    };
  });

  if (mongoResult !== null) return mongoResult;

  // Fallback logic remains the same
  // ...
}
```

**Add Database Indexes**:
```typescript
export async function ensureIndexes() {
  const result = await withMongo(async (db) => {
    await Promise.all([
      // Existing indexes
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      
      // ✅ Optimized compound index for pagination query
      db.collection("resumes").createIndex(
        { userId: 1, updatedAt: -1 },
        { name: "user_updated_paginated" }
      ),
      
      // ✅ Index for status filtering
      db.collection("resumes").createIndex(
        { userId: 1, status: 1, updatedAt: -1 },
        { name: "user_status_updated" }
      ),
      
      // ✅ Index for score aggregation
      db.collection("resumes").createIndex(
        { userId: 1, overallScore: 1 },
        { name: "user_score" }
      ),
    ]);
    return true;
  });

  if (result !== null) return;
  await readFallbackData();
}
```

---

### Fix #6: AI Stream Error Handling

**File**: `app/api/resume/analyze/route.ts`

**Current Code** (Lines 120-140):
```typescript
try {
  const aiStream = await analyzeResumeStream(resume.parsedText, resume.jobTitle ?? undefined);
  const reader = aiStream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunkText = decoder.decode(value, { stream: true });
    streamedText += chunkText;
    send("token", { value: chunkText });
  }
} catch {
  send("status", { message: "Switching to fallback model..." });
  // ❌ Reader never released!
}
```

**Fixed Code**:
```typescript
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

try {
  const aiStream = await analyzeResumeStream(resume.parsedText, resume.jobTitle ?? undefined);
  reader = aiStream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      streamedText += chunkText;
      send("token", { value: chunkText });
    }
  } finally {
    // ✅ Always release the reader
    if (reader) {
      await reader.cancel().catch(() => {
        // Ignore cancel errors
      });
    }
  }
} catch (streamError) {
  send("status", { message: "Switching to fallback model..." });
  console.error("Stream error:", streamError);
}

// Continue with fallback logic...
```

---

### Fix #7: PDF Parser Memory Optimization

**File**: `lib/parsers/pdf-parser.ts`

**Current Code** (Lines 20-50):
```typescript
for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  // ❌ Processes ALL pages even if resume is 10+ pages
  const page = await pdf.getPage(pageNumber);
  // ... process page
}
```

**Fixed Code**:
```typescript
// ✅ Limit to first 5 pages (resumes are typically 1-2 pages)
const maxPages = Math.min(pdf.numPages, 5);

for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  
  // ✅ Release page resources after processing
  page.cleanup();
  
  // ... rest of processing
}

// ✅ Log if resume is too long
if (pdf.numPages > 5) {
  console.warn(`Resume has ${pdf.numPages} pages, only processing first 5`);
}
```

---

## 🟢 Priority 3: Bug Fixes

### Fix #8: Auth State Race Condition

**File**: `app/(dashboard)/analyze/page.tsx`

**Current Code** (Lines 35-40):
```typescript
useEffect(() => {
  if (resumeId && !isAnalyzing && !analysis) {
    void runAnalysis();  // ❌ Can trigger multiple times
  }
}, [resumeId]);  // ❌ Missing dependencies
```

**Fixed Code**:
```typescript
const hasAnalyzed = useRef(false);

useEffect(() => {
  // ✅ Only run once per resumeId
  if (resumeId && !isAnalyzing && !analysis && !hasAnalyzed.current) {
    hasAnalyzed.current = true;
    void runAnalysis();
  }
}, [resumeId, isAnalyzing, analysis]);  // ✅ Complete dependency array

// ✅ Reset flag when resumeId changes
useEffect(() => {
  hasAnalyzed.current = false;
}, [resumeId]);
```

---

### Fix #9: MongoDB ObjectId Validation

**File**: `lib/db/queries.ts`

**Current Code** (Multiple locations):
```typescript
const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : null;
if (!filter) return null;  // ❌ Silent failure
```

**Fixed Code**:
```typescript
function validateObjectId(id: string, fieldName: string = "id"): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName}: ${id}`);
  }
  return new ObjectId(id);
}

// Usage:
export async function getResumeById(id: string, userId: string) {
  const mongoResult = await withMongo(async (db) => {
    // ✅ Throws descriptive error instead of silent failure
    const resumeId = validateObjectId(id, "resume ID");
    const userObjectId = validateObjectId(userId, "user ID");
    
    const resume = await db.collection("resumes").findOne({
      _id: resumeId,
      userId: userObjectId,
    });
    
    if (!resume) return null;
    return mapResume(/* ... */);
  });

  if (mongoResult !== null) return mongoResult;

  // Fallback logic...
}
```

---

## 🛠️ Implementation Checklist

### Phase 1: Critical Security (Day 1)
- [ ] Fix cookie security (#1)
- [ ] Fix timing attack (#3)
- [ ] Fix file validation (#4)
- [ ] Test authentication flow
- [ ] Deploy to staging

### Phase 2: Database & Performance (Day 2-3)
- [ ] Fix MongoDB connection (#2)
- [ ] Add database indexes (#5)
- [ ] Optimize pagination query (#5)
- [ ] Test under load
- [ ] Monitor connection pool

### Phase 3: Error Handling (Day 4)
- [ ] Fix stream error handling (#6)
- [ ] Fix ObjectId validation (#9)
- [ ] Add error logging (Sentry)
- [ ] Test error scenarios

### Phase 4: Memory & Performance (Day 5)
- [ ] Fix PDF parser memory (#7)
- [ ] Fix race condition (#8)
- [ ] Add performance monitoring
- [ ] Load testing

### Phase 5: Testing & Deployment (Day 6-7)
- [ ] Write unit tests for fixes
- [ ] Integration testing
- [ ] Security audit
- [ ] Deploy to production
- [ ] Monitor for 24 hours

---

## 🧪 Testing Strategy

### Security Testing
```bash
# Test cookie security
curl -v http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Verify cookies have correct flags
# Should see: HttpOnly; Secure; SameSite=Strict

# Test timing attack prevention
time curl http://localhost:3000/api/auth/signin \
  -d '{"email":"nonexistent@example.com","password":"wrong"}'
  
time curl http://localhost:3000/api/auth/signin \
  -d '{"email":"existing@example.com","password":"wrong"}'
  
# Both should take similar time (~100-200ms)
```

### Performance Testing
```bash
# Test MongoDB connection pooling
ab -n 1000 -c 50 http://localhost:3000/api/auth/session

# Monitor connections
mongosh --eval "db.serverStatus().connections"

# Should see stable connection count, not growing
```

### Load Testing
```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js

# load-test.js:
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/auth/session');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 📊 Success Metrics

### Before Fixes
- Cookie Security: ❌ Vulnerable to CSRF
- Connection Pool: ❌ Leaks connections
- Response Time: ~200-500ms
- Error Rate: ~2-5%
- Memory Usage: Growing over time

### After Fixes (Target)
- Cookie Security: ✅ Secure (strict, httpOnly, secure)
- Connection Pool: ✅ Stable (10 connections max)
- Response Time: <100ms (50% improvement)
- Error Rate: <0.5% (80% reduction)
- Memory Usage: Stable over time

---

## 🚨 Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback**:
   ```bash
   git revert HEAD
   npm run build
   npm run deploy
   ```

2. **Partial Rollback** (if only one fix is problematic):
   ```bash
   git revert <commit-hash-of-problematic-fix>
   npm run build
   npm run deploy
   ```

3. **Database Rollback** (if indexes cause issues):
   ```javascript
   // In MongoDB shell
   db.resumes.dropIndex("user_updated_paginated");
   db.resumes.dropIndex("user_status_updated");
   db.resumes.dropIndex("user_score");
   ```

4. **Monitor** for 1 hour after rollback
5. **Investigate** root cause
6. **Re-deploy** with fix

---

*Implementation guide created by Kiro AI Assistant*  
*Last updated: April 16, 2026*
