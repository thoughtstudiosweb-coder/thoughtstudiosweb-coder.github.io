# Setup Instructions

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   
   Create `.env.local` file in the root directory with:
   ```env
   ADMIN_EMAIL=admin@thoughtstudios.com
   ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=generate-a-random-32-character-string
   ```

   Or use this command to create it:
   ```bash
   cat > .env.local << 'EOF'
   ADMIN_EMAIL=admin@thoughtstudios.com
   ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=$(openssl rand -base64 32)
   EOF
   ```

   Generate JWT secret manually:
   ```bash
   openssl rand -base64 32
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Access:**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - Login with credentials from `.env.local`

## Project Structure

```
├── app/
│   ├── admin/              # Admin dashboard
│   │   ├── login/          # Login page
│   │   ├── welcome/        # Welcome editor
│   │   ├── beliefs/        # Beliefs editor
│   │   ├── explore/        # Explore editor
│   │   ├── blog/           # Blog manager
│   │   └── theme/          # Theme editor
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication
│   │   ├── content/        # Content CRUD
│   │   └── blog/           # Blog CRUD
│   ├── blog/               # Blog post pages
│   ├── components/         # React components
│   └── page.tsx           # Homepage
├── content/               # Content storage
│   ├── welcome.json
│   ├── beliefs.json
│   ├── explore.json
│   ├── theme.json
│   └── blog/              # Markdown posts
├── lib/                   # Utilities
│   ├── auth.ts            # Auth functions
│   └── content.ts         # File operations
└── public/                # Static assets
```

## Using the CMS

### Login
1. Go to `/admin`
2. Enter email and password from `.env.local`
3. You'll be redirected to the dashboard

### Edit Content

**Welcome Section:**
- Click "Welcome" in admin nav
- Edit title, subtitle, CTA text/link
- Click "Save Changes"

**Beliefs:**
- Click "Beliefs" in admin nav
- Add/remove cards with "Add Belief" button
- Edit title and description
- Save changes

**Explore:**
- Click "Explore" in admin nav
- Add/remove cards
- Edit title, description, and icon URL
- Save changes

**Blog Posts:**
- Click "Blog" in admin nav
- Click "New Post" to create
- Fill in title, date, tags, cover image URL
- Write content in Markdown
- Click "Create Post"
- Edit existing posts with "Edit" button
- Delete with "Delete" button

**Theme:**
- Click "Theme" in admin nav
- Switch between Dark/Light mode tabs
- Edit color values
- Save changes

## Content Files

All content is stored in the `/content` folder:

- `welcome.json` - Hero section content
- `beliefs.json` - Array of belief cards
- `explore.json` - Array of explore cards
- `theme.json` - Color values for both themes
- `blog/*.md` - Markdown blog posts with frontmatter

## API Endpoints

All API routes require authentication (except public GET):

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Check session
- `GET /api/content/welcome` - Get welcome content
- `PUT /api/content/welcome` - Update welcome (auth required)
- `GET /api/content/beliefs` - Get beliefs
- `PUT /api/content/beliefs` - Update beliefs (auth required)
- `GET /api/content/explore` - Get explore
- `PUT /api/content/explore` - Update explore (auth required)
- `GET /api/content/theme` - Get theme
- `PUT /api/content/theme` - Update theme (auth required)
- `GET /api/blog` - List all posts
- `GET /api/blog/[slug]` - Get single post
- `POST /api/blog/create` - Create post (auth required)
- `PUT /api/blog/update/[slug]` - Update post (auth required)
- `DELETE /api/blog/delete/[slug]` - Delete post (auth required)

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

## Troubleshooting

**Can't log in:**
- Check `.env.local` has correct ADMIN_EMAIL and ADMIN_PASSWORD
- Clear browser cookies
- Check server logs for errors

**Content not saving:**
- Ensure you're logged in
- Check file permissions on `/content` folder
- Verify JWT_SECRET is set

**Build errors:**
- Run `npm install` again
- Delete `.next` folder and rebuild
- Check Node.js version (18+ required)

