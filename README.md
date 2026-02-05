# LaptopFixDB

A searchable database of laptop repair solutions powered by AI, featuring 1,500+ repair videos from Electronics Repair School.

## Overview

LaptopFixDB is a Next.js web application that helps technicians and DIY enthusiasts find laptop repair solutions quickly. It uses AI-powered extraction to analyze repair videos and create a structured, searchable database of troubleshooting steps and solutions.

## Features

### 🔍 Smart Search
- Search by laptop brand (Dell, HP, Lenovo, MSI, Asus, Apple, etc.)
- Filter by specific model
- Browse by problem type (No Power, Not Charging, No Display, Liquid Damage, etc.)

### 🎥 Video Integration
- Direct YouTube video embedding
- Automatic video synchronization from Electronics Repair School channel
- Transcript extraction for detailed analysis

### 🤖 AI-Powered Extraction
- Automatic extraction of repair data using Google Gemini AI
- Analyzes video transcripts (up to 15,000 characters)
- Extracts:
  - Laptop brand and model
  - Problem type classification
  - Detailed troubleshooting steps with technical measurements
  - Comprehensive solutions with specific component details
  - Confidence scoring for data quality

### 👤 User Authentication
- Secure authentication with NextAuth.js
- Role-based access control (Admin/User)
- Admin panel for managing repairs and extractions

### 📊 Admin Dashboard
- Video management and synchronization
- Manual and batch AI extraction
- Statistics and analytics
- Repair approval workflow

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5 with Prisma Adapter
- **AI:** Google Gemini 2.5 Flash
- **Styling:** Tailwind CSS v4
- **APIs:** YouTube Data API v3, YouTube Transcript API
- **TypeScript:** Full type safety

## Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- Google API credentials (for YouTube Data API)
- Google Gemini API key

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/laptopfixdb"

# NextAuth
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google APIs
GOOGLE_API_KEY="your-google-api-key"
GEMINI_API_KEY="your-gemini-api-key"

# YouTube Channel
YOUTUBE_CHANNEL_ID="UCR_AT7RN13WXLVKPUXWzzbw"  # Electronics Repair School
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd labtop-fix-db
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Sync videos from YouTube** (Optional)
   - Navigate to `/api/videos/sync` (requires Admin access)
   - Or run the cron job at `/api/cron/sync-videos`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   - Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. Create an admin account through the register page
2. Manually set your user role to `ADMIN` in the database
3. Use the admin panel to sync videos and extract repair data

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── extract/          # AI extraction endpoints
│   │   ├── videos/           # Video management
│   │   └── cron/             # Scheduled jobs
│   ├── admin/                # Admin dashboard
│   ├── repairs/              # Repair browsing pages
│   └── page.tsx              # Home page
├── components/               # React components
├── lib/                      # Utility libraries
│   ├── ai-extractor.ts       # AI extraction logic
│   ├── youtube.ts            # YouTube API integration
│   ├── auth.ts               # Authentication config
│   └── prisma.ts             # Prisma client
├── prisma/                   # Database schema and migrations
└── generated/                # Prisma client generation
```

## Usage

### For Users
1. Visit the home page
2. Search for repairs by brand, model, or problem type
3. View detailed repair information with embedded videos
4. Watch troubleshooting steps and solutions

### For Admins
1. Log in with admin credentials
2. Navigate to `/admin`
3. Sync new videos from YouTube
4. Extract repair data using AI (single or batch)
5. Review and approve extracted data

## AI Extraction Quality

The AI extraction system uses advanced prompting to extract high-quality repair data:

- **Transcript Analysis:** Uses up to 15,000 characters of video transcript
- **Technical Details:** Extracts voltages, component names, part numbers
- **Step-by-Step Format:** Organizes troubleshooting into clear steps
- **Confidence Scoring:** Rates extraction quality as high/medium/low
- **Smart Categorization:** Standardizes problem types across videos

## Database Schema

Key models:
- **Video:** YouTube video metadata and transcripts
- **Repair:** Extracted repair information
- **Brand:** Laptop manufacturers
- **Model:** Specific laptop models
- **ProblemType:** Categorized repair issues
- **User:** Authentication and authorization

## API Routes

- `GET /api/videos` - List videos
- `POST /api/videos/sync` - Sync from YouTube
- `POST /api/extract/[videoId]` - Extract single video
- `POST /api/extract/batch` - Batch extraction
- `GET /api/repairs` - Search repairs
- `GET /api/admin/stats` - Admin statistics

## Credits

Video content by [Electronics Repair School](https://www.youtube.com/@electronicsrepairschool) (Sorin)

## License

This project is for educational purposes. All video content belongs to their respective owners.
