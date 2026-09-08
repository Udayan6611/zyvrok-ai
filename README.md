# Zyvrok — Content Repurposing Studio

Transform long-form articles, YouTube videos, and text notes into high-converting LinkedIn posts, Twitter threads, and newsletter blurbs.

## Features
- **Multi-Channel Repurposing**: Convert input into LinkedIn posts, Twitter/X threads, and Newsletter summaries.
- **Tone Customization**: Support for Thought Leader, Contrarian, Technical, Casual, and Storytelling voices.
- **Supabase Authentication**: User sign up, sign in, and persistent credit tracking.
- **Razorpay Payments**: Integrated ₹199 for 50 credits (Starter Pack) and ₹499 for 150 credits (Creator Pro) with serverless order creation.
- **Vercel Serverless Ready**: Production-ready configuration with API routes and multi-page routing.

## Tech Stack
- **Frontend**: Vite, Tailwind CSS, Vanilla JavaScript (ES Modules)
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI Processing**: Groq API / Google Generative AI
- **Payments**: Razorpay Standard Checkout (with Vercel Serverless Orders API)
- **Hosting**: Vercel

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or edit your `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://xfezjftwdaykfznrawdu.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Deployment on Vercel
1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Set your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GROQ_API_KEY`, `VITE_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
4. Deploy!

## Legal & Compliance
Terms of Service, Privacy Policy, and Refund Policy are accessible at `/legal.html`.
