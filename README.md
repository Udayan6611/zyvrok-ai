# Zyvrok — Full React + Vengeance UI Content Studio

Transform long-form articles, YouTube videos, and text notes into high-converting LinkedIn posts, Twitter threads, and newsletter summaries with animated Vengeance UI motion primitives.

## Architecture
- **Framework**: React 18 + Vite (ES Modules)
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **Motion & Interactions**: Framer Motion + Vengeance UI components (Spotlight Cards, Magnetic Buttons, Shimmer Badges)
- **Component CLI**: Configured for `npx shadcn@latest add @vengeanceui/[component]`
- **AI Engine**: Groq API (Llama 3.3 70B Versatile)
- **Backend & Auth**: Supabase (PostgreSQL + RLS + Persistent Credits)
- **Payments**: Razorpay Standard Checkout + Vercel Serverless Orders & Webhook API
- **Deployment**: Vercel Ready (`vercel.json` SPA rewrites & serverless functions)

---

## 1. Local Installation & Run Commands

### Prerequisites
- Node.js (v18 or v20+)
- npm

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
Create or verify `.env` in the root directory:
```env
VITE_SUPABASE_URL=https://xfezjftwdaykfznrawdu.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Step 3: Run Local Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Step 4: Build for Production
```bash
npm run build
```

---

## 2. Adding Vengeance UI Components via CLI

With `components.json` pre-configured, install additional Vengeance UI primitives using:
```bash
npx shadcn@latest add @vengeanceui/[component-name]
```
Examples:
- `npx shadcn@latest add @vengeanceui/magnetic-button`
- `npx shadcn@latest add @vengeanceui/spotlight-card`
- `npx shadcn@latest add @vengeanceui/staggered-grid`

---

## 3. Git Commands (Pushing to GitHub)

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "feat: complete React migration with Vengeance UI and Razorpay integration"

# 4. Set main branch
git branch -M main

# 5. Link to your remote GitHub repo
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push
git push -u origin main
```

---

## 4. Deploying to Vercel

### Option A: Via GitHub (Recommended)
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Select your repository. Framework preset will automatically detect **Vite**.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY`
   - `VITE_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
vercel --prod
```
