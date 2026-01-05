# Deployment Guide for Vercel + Railway

This guide explains how to deploy the frontend application to Vercel and connect it to your Railway backend.

## Issues Fixed

1. **Environment Variable Prefix**: Changed from `REACT_APP_*` to `VITE_*` (Vite uses `VITE_` prefix)
2. **Vercel Configuration**: Updated `vercel.json` to work with Vite builds
3. **API Base URL**: Fixed environment variable handling in `queryClient.ts` and `use-auth.tsx`
4. **TypeScript Support**: Added proper type definitions for Vite environment variables

## Prerequisites

- Railway backend deployed and accessible
- Vercel account
- GitHub repository connected to Vercel

## Step 1: Get Your Railway Backend URL

1. Go to your Railway project dashboard
2. Find your backend service
3. Copy the public URL (e.g., `https://your-app-backend-production.up.railway.app`)
4. Make sure your backend has CORS configured to allow requests from your Vercel domain

## Step 2: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variable:

   **Name:** `VITE_API_BASE_URL`  
   **Value:** `https://your-app-backend-production.up.railway.app`  
   **Environment:** Production, Preview, Development (select all)

   ⚠️ **Important**: Replace `https://your-app-backend-production.up.railway.app` with your actual Railway backend URL

4. Click **Save**

## Step 3: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)
- Push your changes to GitHub
- Vercel will automatically detect and deploy

### Option B: Manual Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`

## Step 4: Verify Deployment

1. After deployment, check the build logs in Vercel
2. Visit your deployed site
3. Open browser DevTools → Console
4. You should see logs showing:
   - `🔧 Environment: production`
   - `🔧 API Base URL: https://your-railway-url.up.railway.app`

## Troubleshooting

### Browser Extension Errors (Can be Ignored)

**Problem**: You see errors like:
- "Host is not supported" / "Host is not valid or supported"
- "Host is not in insights whitelist"
- "A listener indicated an asynchronous response by returning true, but the message channel closed"

**Solution**: These are **browser extension errors** (like Chrome extensions) and are **not related to your application**. They are automatically suppressed by the global error handlers. You can safely ignore them. If they're annoying, you can:
1. Disable browser extensions temporarily
2. Use an incognito/private window
3. The application will continue to work normally despite these errors

### 404 Error on `/api/auth/login`

**Problem**: The app is trying to fetch from a wrong URL or the environment variable isn't set.

**Solution**:
1. Verify `VITE_API_BASE_URL` is set in Vercel environment variables
2. Make sure the value doesn't have a trailing slash
3. Rebuild the application after setting the environment variable
4. Check browser console for the actual API URL being used

### CORS Errors

**Problem**: Backend is blocking requests from frontend domain.

**Solution**: Configure CORS on your Railway backend to allow your Vercel domain:
```java
// Example Spring Boot CORS configuration
@CrossOrigin(origins = {"https://your-vercel-app.vercel.app", "https://your-custom-domain.com"})
```

### Environment Variable Not Working

**Problem**: `VITE_API_BASE_URL` is not being picked up.

**Solution**:
1. Ensure the variable name starts with `VITE_`
2. Rebuild the application (environment variables are injected at build time)
3. Check that the variable is set for the correct environment (Production/Preview/Development)

## Local Development

For local development, create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

**Note**: `.env` files are gitignored, so create `.env.local` if you want to commit a template.

## Build Configuration

The application is configured to:
- Build output directory: `dist/`
- Root directory: `client/`
- Framework: Vite + React

Vercel will automatically detect these settings from `vercel.json` and `package.json`.

## Additional Notes

- Environment variables prefixed with `VITE_` are exposed to the client-side code
- Never put sensitive data (API keys, secrets) in `VITE_*` variables
- The backend URL is public and will be visible in the built JavaScript bundle
- Console logs are included for debugging but can be removed in production if needed

