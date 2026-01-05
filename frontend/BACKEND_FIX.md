# Backend 403 Error Fix Guide

## Problem Identified

The frontend is receiving **403 Forbidden** errors when trying to access `/api/leads/filter` and other endpoints, even though:
- ✅ Token is valid and stored correctly
- ✅ Token is being sent in Authorization header
- ✅ CORS is configured correctly
- ✅ User logged in successfully

## Root Cause

The backend endpoint requires roles via `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")`, but the **JWT token likely doesn't contain roles/authorities**, or the user doesn't have the required roles assigned.

## Backend Fixes Required

### 1. Check JWT Token Generation

Your JWT token must include roles/authorities. Check your JWT token generation code (likely in a service that creates tokens after login).

**Example of what the token should contain:**
```java
// In your JWT token generation (likely in AuthService or JwtService)
Claims claims = Jwts.claims().setSubject(user.getUsername());
claims.put("roles", user.getAuthorities().stream()
    .map(GrantedAuthority::getAuthority)
    .collect(Collectors.toList()));
// Or
claims.put("authorities", user.getAuthorities());
```

### 2. Check JWT Authentication Filter

Your `JwtAuthenticationFilter` must extract roles from the token and set them in the SecurityContext.

**Example:**
```java
// In JwtAuthenticationFilter
String username = extractUsername(token);
List<GrantedAuthority> authorities = extractAuthorities(token); // Extract from token claims
Authentication authentication = new UsernamePasswordAuthenticationToken(
    username, null, authorities);
SecurityContextHolder.getContext().setAuthentication(authentication);
```

### 3. Verify User Has Roles

Ensure the user in your database has at least one of these roles:
- `ROLE_ADMIN`
- `ROLE_MANAGER` 
- `ROLE_USER`

**Note:** Spring Security expects roles to be prefixed with `ROLE_` when using `hasAnyRole()`, but the `@PreAuthorize` annotation strips the prefix, so you can use either:
- `hasAnyRole('ADMIN', 'MANAGER', 'USER')` - expects `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_USER`
- `hasAuthority('ROLE_ADMIN')` - expects exact match

### 4. Test with Debug Endpoint

The frontend will now call `/api/leads/debug-auth` to check what the backend sees. This endpoint should return:
```json
{
  "username": "root",
  "authorities": ["ROLE_ADMIN", "ROLE_USER"]
}
```

If `authorities` is empty or missing, that's the problem.

## Quick Debug Steps

1. **Check what's in the JWT token:**
   - The frontend now decodes and logs the token payload
   - Check browser console for: `Token Payload`, `Token Roles/Authorities`
   - If roles are missing, fix JWT token generation

2. **Check backend logs:**
   - Look for authentication errors
   - Check if JWT filter is extracting roles correctly

3. **Test the debug endpoint:**
   - Call `GET /api/leads/debug-auth` with your token
   - Check what roles/authorities are returned

4. **Verify user roles in database:**
   - Ensure user has `ROLE_ADMIN`, `ROLE_MANAGER`, or `ROLE_USER`

## Expected Token Structure

Your JWT token payload should look like:
```json
{
  "sub": "root",
  "iat": 1767651178,
  "exp": 1767737578,
  "roles": ["ROLE_ADMIN", "ROLE_USER"]  // ← This is required!
}
```

Or:
```json
{
  "sub": "root",
  "iat": 1767651178,
  "exp": 1767737578,
  "authorities": ["ROLE_ADMIN", "ROLE_USER"]  // ← Or this
}
```

## CORS Configuration (Already Correct)

Your CORS config looks good:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:3001",
    "https://instigar.vercel.app",
    "https://*.vercel.app"
));
```

This should work. The issue is **not CORS** - it's **missing roles in the JWT token**.

## Next Steps

1. **Check your JWT token generation code** - ensure it includes roles
2. **Check your JwtAuthenticationFilter** - ensure it extracts roles from token
3. **Verify user has roles** in database
4. **Test with debug endpoint** - `/api/leads/debug-auth`
5. **Check browser console** - frontend now logs token payload and roles

The frontend will now show you exactly what's in the token, which will help identify the issue.

