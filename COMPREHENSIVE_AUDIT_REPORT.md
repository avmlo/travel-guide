# Comprehensive Code Audit Report
**Date**: December 2024  
**Scope**: Sitemap, Google Maps API, Code Quality, Security

---

## Executive Summary

This audit reviewed the sitemap implementation, Google Maps API usage, overall code quality, and security practices. The codebase demonstrates good structure but has several security vulnerabilities and code quality issues that need immediate attention.

**Critical Issues**: 3  
**High Priority**: 5  
**Medium Priority**: 8  
**Low Priority**: 4

---

## 1. SITEMAP AUDIT

### ✅ Strengths
- Well-structured sitemap generation using Next.js MetadataRoute
- Proper URL encoding for city names
- Good priority hierarchy (main pages > cities > destinations)
- Includes static pages (privacy)

### ⚠️ Issues Found

#### 1.1 Hardcoded Fallback URL (Medium Priority)
**Location**: `app/sitemap.ts:11`
```typescript
|| 'https://theurbanmanual.com';
```
**Issue**: Hardcoded production URL could cause issues in staging/preview environments.

**Recommendation**: 
- Remove hardcoded fallback
- Use environment variable validation
- Fail gracefully with clear error message

#### 1.2 All Entries Use Same Timestamp (Low Priority)
**Location**: `app/sitemap.ts:13`
```typescript
const currentDate = new Date().toISOString();
```
**Issue**: All sitemap entries have identical `lastModified` dates, reducing SEO value.

**Recommendation**:
- Use actual last modified dates from database
- Add `updated_at` field to destinations table
- Cache sitemap with reasonable TTL

#### 1.3 Missing Error Handling (Medium Priority)
**Location**: `app/sitemap.ts:18-35`
**Issue**: Errors are logged but sitemap still generates with incomplete data.

**Recommendation**:
- Implement retry logic for Supabase queries
- Add fallback sitemap generation
- Log errors to monitoring service

#### 1.4 No Sitemap Size Limits (Low Priority)
**Issue**: Sitemap could exceed Google's 50,000 URL limit if destinations grow.

**Recommendation**:
- Implement sitemap index for multiple sitemap files
- Add pagination support
- Monitor sitemap size

#### 1.5 Robots.txt Hardcoded URL (Low Priority)
**Location**: `app/robots.ts:10`
```typescript
sitemap: 'https://theurbanmanual.com/sitemap.xml',
```
**Issue**: Should use environment variable for domain.

---

## 2. GOOGLE MAPS API AUDIT

### ⚠️ Critical Security Issues

#### 2.1 API Key Exposed in Client-Side Code (CRITICAL)
**Location**: `components/MapView.tsx:26,44`
```typescript
const getApiKey = () => process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
```

**Issue**: API keys with `NEXT_PUBLIC_` prefix are exposed in client-side JavaScript, making them publicly accessible.

**Security Impact**:
- Anyone can extract API key from browser
- Risk of API key theft and quota abuse
- Potential cost overruns

**Recommendation**:
1. **Immediate**: Add API key restrictions in Google Cloud Console:
   - HTTP referrer restrictions (production domain only)
   - IP address restrictions (if possible)
   - Disable unused APIs
2. **Best Practice**: Use server-side proxy for API calls:
   - Create `/api/google-maps-proxy` endpoint
   - Keep server-side API key secret
   - Add rate limiting and request validation

#### 2.2 Missing API Key Restrictions Validation (High Priority)
**Location**: `components/MapView.tsx:31-34`
**Issue**: Error shown to user but no monitoring/alerting.

**Recommendation**:
- Add monitoring for missing API key errors
- Implement fallback UI (Apple Maps link)
- Log to error tracking service

#### 2.3 No Rate Limiting on API Routes (High Priority)
**Location**: `app/api/distance/route.ts`, `app/api/enrich/route.ts`
**Issue**: No rate limiting on endpoints that call Google APIs.

**Security Impact**:
- Potential for API quota exhaustion
- Cost overruns
- DoS vulnerability

**Recommendation**:
- Implement rate limiting using middleware (Vercel Edge Config or Upstash)
- Add per-IP/user rate limits
- Return 429 status when limits exceeded

#### 2.4 Missing Input Validation (High Priority)
**Location**: `app/api/distance/route.ts:17-20`
```typescript
const body: DistanceRequest = await request.json();
const { origins, destinations, mode = 'walking' } = body;
```

**Issues**:
- No validation of coordinates (lat/lng ranges)
- No limit on array sizes
- No sanitization of input

**Security Impact**:
- Potential for malformed requests
- API quota abuse
- Server resource exhaustion

**Recommendation**:
```typescript
// Validate coordinates
if (!Array.isArray(origins) || origins.length > 25) {
  return NextResponse.json({ error: 'Invalid origins' }, { status: 400 });
}
for (const origin of origins) {
  if (typeof origin.lat !== 'number' || origin.lat < -90 || origin.lat > 90) {
    return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 });
  }
  // Similar for lng
}
```

#### 2.5 API Key Used in Multiple Places (Medium Priority)
**Issue**: API key accessed via different env var names:
- `NEXT_PUBLIC_GOOGLE_API_KEY` (client-side)
- `GOOGLE_MAPS_API_KEY` (server-side)
- `GOOGLE_PLACES_API_KEY` (scripts)

**Recommendation**:
- Standardize on environment variable names
- Document required variables in `.env.example`
- Add validation on startup

#### 2.6 Server-Side API Key Not Properly Secured (Medium Priority)
**Location**: `app/api/distance/route.ts:23`
```typescript
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
```

**Issue**: Should use `NEXT_PUBLIC_GOOGLE_API_KEY` fallback or separate server key.

**Recommendation**:
- Use separate server-side API key (without `NEXT_PUBLIC_` prefix)
- Add key rotation strategy
- Monitor API usage

---

## 3. SECURITY AUDIT

### 🔴 Critical Issues

#### 3.1 API Keys Exposed in Client-Side Code (CRITICAL)
**Details**: See Section 2.1 above.

#### 3.2 ESLint Disabled During Builds (High Priority)
**Location**: `next.config.ts:6-8`
```typescript
eslint: {
  ignoreDuringBuilds: true,
}
```

**Issue**: Security and code quality issues can slip into production.

**Recommendation**:
- Remove this setting
- Fix existing lint errors
- Add pre-commit hooks

#### 3.3 Missing Authentication on API Routes (High Priority)
**Location**: Multiple API routes
- `/api/distance`
- `/api/enrich`
- `/api/categories`
- `/api/personalized-recommendations`

**Issue**: No authentication/authorization checks.

**Security Impact**:
- Unauthorized access to API endpoints
- Potential for abuse
- Data modification without authentication

**Recommendation**:
```typescript
// Add middleware for protected routes
export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization');
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

#### 3.4 MapKit Token Endpoint Unprotected (Medium Priority)
**Location**: `app/api/mapkit-token/route.ts:4`
**Issue**: No authentication/rate limiting on token generation endpoint.

**Recommendation**:
- Add rate limiting
- Validate origin header
- Add authentication if needed

### ⚠️ High Priority Issues

#### 3.5 Missing Input Sanitization (High Priority)
**Location**: `app/api/enrich/route.ts:20`
```typescript
const { slug, name, city, category, content } = await request.json();
```

**Issue**: No validation or sanitization of user input.

**Security Impact**:
- Potential for injection attacks
- Database corruption
- XSS vulnerabilities

**Recommendation**:
```typescript
import { z } from 'zod';

const EnrichSchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  category: z.string().optional(),
  content: z.string().max(10000).optional(),
});

const validated = EnrichSchema.parse(body);
```

#### 3.6 Error Messages Expose Stack Traces (Medium Priority)
**Location**: `app/api/enrich/route.ts:68-69`
```typescript
details: error.stack?.split('\\n').slice(0, 3).join('\\n'),
```

**Issue**: Stack traces exposed in API responses.

**Recommendation**:
- Only expose stack traces in development
- Use generic error messages in production
- Log full errors server-side

#### 3.7 No CORS Configuration (Medium Priority)
**Issue**: No explicit CORS headers set.

**Recommendation**:
- Add CORS middleware
- Restrict origins in production
- Use Vercel's built-in CORS handling

#### 3.8 Health Check Exposes Environment Info (Low Priority)
**Location**: `app/api/health/route.ts`
**Issue**: Endpoint reveals which env vars are configured.

**Recommendation**:
- Remove from production
- Use authentication
- Don't expose boolean values for secrets

### 🔵 Medium Priority Issues

#### 3.9 Supabase Client Uses Placeholder Values (Low Priority)
**Location**: `lib/supabase.ts:4-5`
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
```

**Issue**: Could mask configuration errors.

**Recommendation**:
- Fail fast in production
- Validate on startup
- Don't use placeholders

#### 3.10 Missing CSRF Protection (Medium Priority)
**Issue**: No CSRF tokens on POST endpoints.

**Recommendation**:
- Add CSRF middleware for state-changing operations
- Use Next.js built-in CSRF protection

---

## 4. CODE QUALITY AUDIT

### ✅ Strengths
- Good TypeScript usage
- Proper component structure
- Clear separation of concerns
- Good error handling in some areas

### ⚠️ Issues Found

#### 4.1 ESLint Disabled During Builds (High Priority)
**Location**: `next.config.ts:6-8`
**Issue**: See Section 3.2 above.

#### 4.2 Inconsistent Error Handling (Medium Priority)
**Issue**: Some functions use try/catch, others don't.

**Recommendation**:
- Standardize error handling pattern
- Use error boundaries for React components
- Implement centralized error logging

#### 4.3 Missing Type Safety (Medium Priority)
**Location**: `app/api/distance/route.ts:53-54`
```typescript
data.rows.forEach((row: any, i: number) => {
  row.elements.forEach((element: any, j: number) => {
```

**Issue**: Using `any` type reduces type safety.

**Recommendation**:
- Define proper types for API responses
- Use TypeScript strict mode
- Add type guards

#### 4.4 No Validation Library (Medium Priority)
**Issue**: Manual validation instead of using Zod or Yup.

**Recommendation**:
- Add Zod for runtime validation
- Share types between client and server
- Validate API request/response schemas

#### 4.5 Console.log in Production Code (Low Priority)
**Location**: Multiple files
**Issue**: Debug logs left in production code.

**Recommendation**:
- Use proper logging library (Pino, Winston)
- Remove console.log statements
- Add log levels

#### 4.6 Missing Unit Tests (Medium Priority)
**Issue**: No test files found.

**Recommendation**:
- Add Jest/Vitest tests
- Test API routes
- Test utility functions
- Add E2E tests for critical flows

#### 4.7 Inconsistent Naming Conventions (Low Priority)
**Issue**: Mix of camelCase and snake_case in some places.

**Recommendation**:
- Standardize on camelCase for JavaScript/TypeScript
- Use snake_case only for database fields
- Add ESLint rules

#### 4.8 Missing Documentation (Low Priority)
**Issue**: Some complex functions lack JSDoc comments.

**Recommendation**:
- Add JSDoc comments for public APIs
- Document complex algorithms
- Add README for API routes

---

## 5. RECOMMENDATIONS SUMMARY

### Immediate Actions (This Week)
1. ✅ **CRITICAL**: Add API key restrictions in Google Cloud Console
2. ✅ **CRITICAL**: Implement server-side proxy for Google Maps API calls
3. ✅ **HIGH**: Add input validation to all API routes
4. ✅ **HIGH**: Enable ESLint during builds
5. ✅ **HIGH**: Add authentication to API routes

### Short-Term (This Month)
1. Add rate limiting to API routes
2. Implement proper error handling
3. Add input sanitization
4. Remove console.log statements
5. Add TypeScript strict mode
6. Add validation library (Zod)

### Long-Term (Next Quarter)
1. Add comprehensive test suite
2. Implement monitoring/alerting
3. Add API documentation
4. Implement sitemap caching
5. Add CSRF protection
6. Set up CI/CD with security checks

---

## 6. SECURITY CHECKLIST

- [ ] API keys restricted in Google Cloud Console
- [ ] Server-side proxy for Google Maps API
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication on protected routes
- [ ] Error messages sanitized
- [ ] CORS configured
- [ ] CSRF protection added
- [ ] ESLint enabled
- [ ] Secrets not in client-side code
- [ ] Monitoring/alerting set up
- [ ] Security headers configured

---

## 7. PRIORITY MATRIX

| Priority | Issue | Impact | Effort | Status |
|----------|-------|--------|--------|--------|
| Critical | API key exposed client-side | High | Medium | ⚠️ Needs Fix |
| Critical | No API key restrictions | High | Low | ⚠️ Needs Fix |
| High | No rate limiting | Medium | Medium | ⚠️ Needs Fix |
| High | No input validation | High | Low | ⚠️ Needs Fix |
| High | ESLint disabled | Medium | Low | ⚠️ Needs Fix |
| High | No authentication | Medium | Medium | ⚠️ Needs Fix |
| Medium | Error handling inconsistent | Low | Medium | 📋 Planned |
| Medium | Missing type safety | Low | Medium | 📋 Planned |
| Low | Console.log in production | Low | Low | 📋 Planned |

---

## Conclusion

The codebase has a solid foundation but requires immediate attention to security vulnerabilities, particularly around API key management and input validation. Implementing the recommended fixes will significantly improve security posture and code quality.

**Estimated Effort**: 2-3 weeks for critical fixes, 1-2 months for full implementation.

---

*Report generated: December 2024*
