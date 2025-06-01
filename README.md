# Product Catalog with Decap CMS

A modern product catalog website with admin interface powered by Decap CMS (formerly Netlify CMS).

## Features

- Clean, responsive product catalog
- Category filtering
- Admin interface for content management
- Netlify hosting with Git-based workflow

## Deployment to Netlify

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push this code to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

### Step 2: Deploy to Netlify
1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub account and select your repository
4. Configure build settings:
   - Build command: `npm install && npm run build`
   - Publish directory: `.` (root)
5. Deploy the site

### Step 3: Enable Netlify Identity
1. In your Netlify site dashboard, go to **Identity** tab
2. Click "Enable Identity"
3. Under "Registration preferences", select "Invite only" (recommended)
4. Under "Git Gateway", click "Enable Git Gateway"

### Step 4: Create Admin User
1. In Netlify Identity, click "Invite users"
2. Enter the email address of the admin user
3. The user will receive an invitation email

### Step 5: Access Admin Panel
1. Go to `https://your-site-name.netlify.app/admin/`
2. Login with the invited user account
3. Start managing your products!

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the products JSON file:
   ```bash
   npm run build
   ```

3. Start local server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:8000 in your browser

## Admin Interface

The admin interface is available at `/admin/` and allows you to:
- Add new products
- Edit existing products
- Upload and manage images
- Set product categories
- Publish/unpublish products

## File Structure

- `index.html` - Main product catalog page
- `admin/` - Decap CMS admin interface
- `_products/` - Product markdown files (managed by CMS)
- `_data/products.json` - Generated JSON file for frontend
- `public/uploads/images/` - Uploaded images
- `build.js` - Script to convert markdown to JSON
- `netlify.toml` - Netlify configuration
