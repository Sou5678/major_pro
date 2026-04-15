# ResumeIQ - AI-Powered Resume Analysis Platform

An intelligent resume analysis platform that helps job seekers optimize their resumes using AI-powered insights, ATS compatibility checks, and actionable recommendations.

## 🚀 Features

- **AI-Powered Analysis**: Advanced resume analysis using Groq/OpenRouter AI
- **ATS Compatibility Check**: Ensure your resume passes Applicant Tracking Systems
- **Real-time Streaming**: Live analysis updates as AI processes your resume
- **Smart Suggestions**: Get actionable recommendations to improve your resume
- **Multi-format Support**: Upload PDF or DOCX files
- **Download Options**: Export analyzed resumes in PDF or Word format
- **User Dashboard**: Track all your resume analyses in one place
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB Atlas
- **File Storage**: Supabase Storage
- **AI**: Groq (primary), OpenRouter (backup)
- **Authentication**: JWT
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account
- Supabase account
- Groq API key

## 🏃 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/resumeiq.git
cd resumeiq
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
- MongoDB connection string
- Supabase URL and keys
- Groq API key
- JWT secret

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Quick Deploy (5 minutes)
See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for fastest deployment

### Full Guide
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete step-by-step instructions

### Deployment Checklist
Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) to ensure nothing is missed

### Pre-deployment Check
```bash
npm run pre-deploy
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
npm run pre-deploy   # Run pre-deployment checks
```

## 📁 Project Structure

```
resumeiq/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (marketing)/       # Landing pages
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   ├── resume/           # Resume-related components
│   ├── shared/           # Shared components
│   └── ui/               # UI components
├── lib/                   # Utility libraries
│   ├── ai/               # AI integration
│   ├── db/               # Database queries
│   └── parsers/          # File parsers
├── types/                 # TypeScript types
└── public/               # Static assets
```

## 🔐 Environment Variables

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GROQ_API_KEY` - Groq API key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

See `.env.local.example` for all variables

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build test
npm run build
```

## 📊 Performance

- **Page Load**: < 2s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+
- **Core Web Vitals**: All green

## 🔒 Security

- JWT-based authentication
- Secure file upload validation
- Rate limiting on API routes
- Environment variables for secrets
- HTTPS enforced in production

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/resumeiq/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/resumeiq/discussions)

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Resume templates
- [ ] Cover letter analysis
- [ ] LinkedIn profile optimization
- [ ] Job matching recommendations
- [ ] Interview preparation tips

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- Groq for fast AI inference
- MongoDB Atlas for database
- Supabase for file storage

---

**Made with ❤️ by [Your Name]**

ResumeIQ is a Next.js full-stack AI resume analyzer using MongoDB Atlas for storage, JWT cookie auth, streaming AI analysis, resume parsing, and in-app editing.

## Documentation

- Architecture: [ARCHITECTURE.md](c:/Users/Sourabh/major_pro/ARCHITECTURE.md)

## Setup

1. Install dependencies: `npm install`
2. Add your real secrets to `.env.local`
3. Start development: `npm run dev`
4. Build production: `npm run build`

## Runtime Stack

- Frontend: Next.js App Router, TypeScript, Tailwind, Framer Motion
- Backend: Next.js route handlers
- Database: MongoDB Atlas
- Auth: JWT cookie auth
- AI: Groq and OpenRouter
- Resume parsing: PDF and DOCX
- Resume export: PDF and DOCX

## Important Env Values

- `MONGODB_URI`
- `JWT_SECRET`
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`
- `GROQ_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`

## Core Routes

- `/`
- `/pricing`
- `/signin`
- `/signup`
- `/analyze`
- `/dashboard`
- `/resume/[id]`
- `/api/auth/signup`
- `/api/auth/signin`
- `/api/auth/signout`
- `/api/auth/session`
- `/api/resume/upload`
- `/api/resume/analyze`
- `/api/resume/[id]`
- `/api/resume/download/[id]`

## Current Notes

- MongoDB Atlas connectivity must succeed from the machine running the app
- Supabase storage falls back to a local placeholder URL when storage env values are not configured
- AI analysis falls back to mock analysis if external AI services are unavailable
