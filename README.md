# Thought Studios™ Website

A luxury, minimalist website with a custom CMS built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 Luxury design with rose gold accents
- 📝 Custom CMS for content management
- 📱 Fully responsive design
- 🌓 Dark/Light mode toggle
- ✨ Smooth scroll animations
- 📖 Blog/Studio Notes section
- 🔐 Secure admin authentication

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Content**: File-based JSON/Markdown
- **Authentication**: JWT with cookies

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd "Thought Studio Website P2"
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` file
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-min-32-chars
NODE_ENV=development
```

Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Run development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── admin/          # CMS admin panel
│   ├── api/            # API routes
│   ├── blog/           # Blog post pages
│   ├── components/     # React components
│   └── styles.css      # Global styles
├── content/            # Content files (JSON/MD)
│   ├── blog/           # Blog posts
│   ├── beliefs.json    # Beliefs content
│   ├── explore.json    # Explore content
│   ├── theme.json      # Theme colors
│   └── welcome.json    # Hero content
├── lib/                # Utility functions
├── public/             # Static assets
└── middleware.ts       # Auth middleware
```

## Admin CMS

Access the admin panel at `/admin/login`

- Edit welcome/hero section
- Manage beliefs and explore cards
- Create/edit/delete blog posts
- Customize theme colors
- Upload images

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed Vercel deployment instructions.

### Quick Deploy to Vercel

1. Push to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy!

**Note**: File writes (CMS edits) won't persist on Vercel. Consider using a database for production.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ADMIN_EMAIL` | Admin login email | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `JWT_SECRET` | JWT encryption secret (min 32 chars) | Yes |
| `NODE_ENV` | Environment mode | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## License

© 2025 RB & A Consulting LLC. Thought Studios™ is a brand of RB & A Consulting LLC. All rights reserved.
