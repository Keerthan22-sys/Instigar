# Quick Fix Guide - Vercel Deployment Issues

## Problem
- Only HTML is showing, React app not loading
- Assets (JS/CSS) not being served
- Application was working locally but broken on Vercel

## Root Cause
Vercel might not be detecting the Vite framework correctly or the build output isn't being served properly.

## Quick Fix Steps

### 1. Verify Your Project Structure
Your project uses:
- **Framework**: Vite + React
- **Root Directory**: Project root (where `package.json` is)
- **Source Directory**: `client/` (configured in `vite.config.ts`)
- **Build Output**: `dist/` (configured in `vite.config.ts`)

### 2. Check Vercel Project Settings
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Verify:
   - **Framework Preset**: Should be "Vite" or "Other"
   - **Root Directory**: Should be `.` (project root) or leave empty
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Update Vercel Configuration
The `vercel.json` file has been updated with:
- Explicit framework declaration: `"framework": "vite"`
- Correct build and output settings
- Proper rewrites for SPA routing

### 4. Rebuild and Redeploy
1. **Option A - Via Vercel Dashboard:**
   - Go to your project → **Deployments**
   - Click on the latest deployment
   - Click **Redeploy**

2. **Option B - Via Git:**
   ```bash
   git add vercel.json
   git commit -m "Fix Vercel configuration for Vite"
   git push
   ```

### 5. Verify Build Logs
After redeploying, check the build logs in Vercel:
- Should see: `vite v5.x.x building for production...`
- Should see: `✓ built in X.XXs`
- Should see output files: `dist/index.html`, `dist/assets/*.js`, `dist/assets/*.css`

### 6. Check Browser Console
After deployment, open your site and check:
- **Network tab**: Are `index-*.js` and `index-*.css` files loading? (Status 200)
- **Console**: Any 404 errors for assets?
- **Console**: Any CORS errors?

## Common Issues & Solutions

### Issue: Assets returning 404
**Solution**: 
- Verify `outputDirectory` in `vercel.json` is `dist`
- Check that build actually creates files in `dist/assets/`
- Ensure Vercel project settings match `vercel.json`

### Issue: Blank page / Only HTML
**Solution**:
- Check browser console for JavaScript errors
- Verify all assets are loading (Network tab)
- Check that `VITE_API_BASE_URL` environment variable is set in Vercel

### Issue: Build fails
**Solution**:
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`
- If local build works but Vercel fails, check Node.js version in Vercel settings

## Verify Locally
To test the build locally:
```bash
npm run build
npm run preview
```
Then visit `http://localhost:4173` (or the port shown) to see if the built version works.

## Still Not Working?
1. **Clear Vercel cache**: In Vercel dashboard → Settings → Clear Build Cache
2. **Check environment variables**: Ensure `VITE_API_BASE_URL` is set
3. **Check Vercel logs**: Look for any errors during build or runtime
4. **Compare with local build**: Run `npm run build` locally and compare `dist/` folder structure

