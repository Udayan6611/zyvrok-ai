# Zyvrok — Content Repurposing Studio (React + Vengeance UI)

A high-density content repurposing studio engineered for founders, creators, and technical writers. Converts YouTube video transcripts and long-form articles into platform-native distribution bundles: LinkedIn posts, X threads, and executive newsletter briefs.

## Architecture (Path B: Modern React + Vengeance UI)
Built with **React 18**, **Vite**, **Tailwind CSS**, and **Framer Motion**:
- **Design Aesthetic**: Dark obsidian `#09090b` background, `#111116` surface cards, subtle white borders (`rgba(255, 255, 255, 0.08)`), emerald accents, and an ambient top lighting beam.
- **Vengeance UI Primitives**:
  - `SpotlightCard`: Mouse-tracking radial gradient spotlight borders & surfaces.
  - `MagneticButton`: Smooth spring physics cursor proximity displacement powered by Framer Motion.
  - `ShimmerBadge`: Animated status pill badge with pulsing radar beacon.
- **Copy & Formatting**:
  - Zero tacky emojis (clean SVG icons instead).
  - High-density copy focused on signal extraction, arguments, and multi-channel publishing.
- **Client-Side Routing**:
  - Full React Router (`react-router-dom`) with client-side transitions.
  - Working **Legal & Compliance** route (`/legal`) with merchant details, Terms of Service, and Refund Policy with no reloads.

---

## 1. Local Setup & Run Commands

### Prerequisites
- Node.js (v18 or v20+)
- npm

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Ensure your `.env` file in the root directory contains your credentials:
```env
VITE_SUPABASE_URL=https://xfezjftwdaykfznrawdu.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Step 4: Build for Production
```bash
npm run build
npm run preview
```

---

## 2. Routes & Navigation

- `/`: Main Landing Page with interactive preview, bento grid, and pricing.
- `/legal`: Dedicated Legal, Terms of Service & Refund Policy page.
- `/studio`: Repurposing Studio workspace with source selector and draft refinement.
- `/pricing`: Credit Packages & Razorpay checkout (₹199 Starter Pack & ₹499 Creator Pro).
- `/history`: Cloud generation history.
- `/login`: Authentication page.

---

## 3. Git Commands (Pushing to GitHub)

Run these commands in your project root:

```bash
# 1. Initialize git repository
git init

# 2. Stage all files
git add .

# 3. Commit
git commit -m "feat: Zyvrok content studio in React with Vengeance UI obsidian design system"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub remote repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to GitHub
git push -u origin main
```

---

## 4. Deploying to Vercel

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
