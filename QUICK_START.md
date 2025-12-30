# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Create `.env.local` file in the root directory with the following content:

```bash
# Create the file
touch .env.local
```

Then add these variables to `.env.local`:
```env
ADMIN_EMAIL=admin@thoughtstudios.com
ADMIN_PASSWORD=your-password-here
JWT_SECRET=generate-with: openssl rand -base64 32
```

Or use this one-liner to create it:
```bash
cat > .env.local << 'EOF'
ADMIN_EMAIL=admin@thoughtstudios.com
ADMIN_PASSWORD=your-password-here
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access Your Site
- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Login** with your `.env.local` credentials

## 📝 First Steps

1. **Log into Admin Panel** (`/admin`)
2. **Edit Welcome Section** - Update hero title and subtitle
3. **Manage Blog Posts** - Create your first post
4. **Customize Theme** - Adjust colors for light/dark mode
5. **Save Changes** - All updates are saved to `/content` folder

## 🎯 Key Features

✅ **No Database** - Everything stored in files  
✅ **Visual Editor** - Edit content through UI  
✅ **Markdown Blog** - Write posts in Markdown  
✅ **Theme Customization** - Full control over colors  
✅ **Authentication** - Secure admin access  

## 📁 Content Structure

All editable content is in `/content`:
- `welcome.json` - Hero section
- `beliefs.json` - Belief cards
- `explore.json` - Explore cards  
- `theme.json` - Color themes
- `blog/*.md` - Blog posts

## 🔒 Security

- Change `JWT_SECRET` in production
- Use a strong admin password
- Keep `.env.local` out of version control

## 📚 Full Documentation

- `README.md` - Complete project overview
- `SETUP.md` - Detailed setup instructions
- `DEPLOYMENT.md` - Deployment guide

## 🆘 Need Help?

Check the console for errors, ensure:
- Node.js 18+ is installed
- All dependencies are installed (`npm install`)
- Environment variables are set correctly
- Port 3000 is available

