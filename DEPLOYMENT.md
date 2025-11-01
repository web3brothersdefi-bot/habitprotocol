# 🌐 Deployment Guide - Habit Platform

Complete guide for deploying Habit Platform to production.

## 📋 Pre-Deployment Checklist

- ✅ Smart contract deployed to Base Sepolia (or Base Mainnet)
- ✅ Supabase project created and schema applied
- ✅ All environment variables configured
- ✅ Frontend tested locally
- ✅ Backend event listener tested
- ✅ Domain name purchased (optional)

## 🎯 Deployment Architecture

```
┌─────────────────┐
│   Frontend      │  → Vercel/Netlify
│   (React)       │
└────────┬────────┘
         │
         ├──→ ┌──────────────┐
         │    │  Supabase    │  → Hosted Database + Realtime
         │    │  (PostgreSQL)│
         │    └──────────────┘
         │
         ├──→ ┌──────────────┐
         │    │ Smart        │  → Base Blockchain
         │    │ Contract     │
         │    └──────────────┘
         │
         └──→ ┌──────────────┐
              │  Backend     │  → Railway/Render (Event Listener)
              │  (Node.js)   │
              └──────────────┘
```

---

## 🚀 Part 1: Deploy Frontend (Vercel)

### Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Habit Platform"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/habit-platform.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   VITE_CONTRACT_ADDRESS=0x...
   VITE_WALLETCONNECT_PROJECT_ID=...
   VITE_PINATA_API_KEY=...
   VITE_PINATA_SECRET_KEY=...
   VITE_PINATA_JWT=...
   VITE_OPENRANK_API_KEY=...
   ```

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Your site is live! 🎉

### Step 3: Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Add your domain (e.g., `habit.app`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~10 minutes)

---

## 🔧 Part 2: Deploy Backend Event Listener (Railway)

### Option A: Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your repository
5. Choose **backend** folder as root
6. Add Environment Variables:
   ```
   CONTRACT_ADDRESS=0x...
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc... (service_role!)
   BASE_SEPOLIA_RPC=https://sepolia.base.org
   ```
7. Railway auto-detects Node.js
8. Click **"Deploy"**

### Option B: Render

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Background Worker"**
3. Connect GitHub repository
4. Configure:
   - **Name**: habit-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables (same as above)
6. Click **"Create Background Worker"**

### Option C: Self-Hosted (VPS)

```bash
# On your server (Ubuntu/Debian)
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/habit-platform.git
cd habit-platform/backend

# Install dependencies
npm install

# Create .env file
nano .env
# (paste your environment variables)

# Install PM2 for process management
sudo npm install -g pm2

# Start event listener
pm2 start eventListener.js --name habit-listener

# Make it start on boot
pm2 startup
pm2 save

# Check logs
pm2 logs habit-listener
```

---

## 🗄️ Part 3: Supabase Production Setup

### Step 1: Enable Production Mode

Supabase is already production-ready! Just ensure:

1. **RLS Policies** are properly configured (already done in schema)
2. **API Keys** are secure
3. **Database backups** are enabled (Settings → Database)

### Step 2: Enable Realtime

Already configured in `schema.sql`:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
```

### Step 3: Set Up Webhooks (Optional)

For additional notifications:

1. Go to **Database** → **Webhooks**
2. Create webhook for `matches` table
3. Point to your backend API for notifications

---

## ⛓️ Part 4: Smart Contract Deployment

### For Production (Base Mainnet)

**⚠️ WARNING: Use real funds carefully!**

1. **Get Base ETH**:
   - Bridge ETH to Base via [bridge.base.org](https://bridge.base.org)

2. **Deploy Contract**:
   ```solidity
   // Update USDC address for Base Mainnet
   IERC20 public constant USDC = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);
   // Base Mainnet USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   ```

3. **Deploy via Remix**:
   - Switch MetaMask to Base Mainnet
   - Deploy StakeMatch.sol
   - Verify contract on BaseScan

4. **Verify Contract**:
   - Go to [basescan.org](https://basescan.org)
   - Find your contract
   - Click "Verify & Publish"
   - Upload source code

5. **Update Environment Variables**:
   - Update `VITE_CONTRACT_ADDRESS` everywhere
   - Redeploy frontend and backend

---

## 🔒 Security Best Practices

### Environment Variables

- ✅ Never commit `.env` files to git
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate keys periodically
- ✅ Use service role key ONLY in backend
- ✅ Keep contract private keys secure

### Supabase

- ✅ Enable RLS on all tables
- ✅ Use service_role key only server-side
- ✅ Enable 2FA on Supabase account
- ✅ Regular database backups
- ✅ Monitor API usage

### Smart Contract

- ✅ Audit contract before mainnet
- ✅ Test thoroughly on testnet
- ✅ Consider multi-sig wallet for fee wallet
- ✅ Monitor contract for unusual activity
- ✅ Have emergency pause mechanism (if needed)

---

## 📊 Monitoring & Analytics

### Frontend Monitoring

**Vercel Analytics** (built-in):
- Automatically tracks page views
- Core Web Vitals
- Performance metrics

**Add Plausible/Google Analytics**:
```html
<!-- In index.html -->
<script defer data-domain="yoursite.com" src="https://plausible.io/js/script.js"></script>
```

### Backend Monitoring

**Railway/Render** (built-in):
- CPU/Memory usage
- Logs
- Uptime monitoring

**Add error tracking** (Sentry):
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### Database Monitoring

**Supabase Dashboard**:
- Query performance
- Table sizes
- Active connections
- API usage

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - # Deploy to Railway/Render
```

---

## 🧪 Testing in Production

### Smoke Tests

1. **Wallet Connection**: Can users connect?
2. **Onboarding**: Complete flow works?
3. **Staking**: Transactions go through?
4. **Matching**: Events sync correctly?
5. **Chat**: Real-time messaging works?
6. **Leaderboard**: Data displays correctly?

### Load Testing

Use [k6](https://k6.io/) or similar:

```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('https://your-site.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 📱 Mobile App (Future)

### React Native Version

Convert to React Native:
```bash
npx create-expo-app habit-mobile
# Reuse components and logic
# Use WalletConnect Mobile SDK
```

### Progressive Web App (PWA)

Add to `vite.config.js`:
```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Habit Platform',
        short_name: 'Habit',
        theme_color: '#4F46E5',
        icons: [/* ... */]
      }
    })
  ]
});
```

---

## 🎉 Post-Deployment

### Launch Checklist

- ✅ All services running
- ✅ Domain configured
- ✅ SSL certificate active
- ✅ Analytics tracking
- ✅ Error monitoring
- ✅ Database backed up
- ✅ Documentation updated
- ✅ Team notified

### Marketing

1. **Twitter announcement**
2. **Product Hunt launch**
3. **Discord/Telegram community**
4. **Medium article**
5. **Demo video**

### Support

Set up:
- Support email
- Discord server
- GitHub issues
- Documentation site

---

## 🆘 Rollback Plan

If something goes wrong:

```bash
# Vercel - Rollback to previous deployment
vercel rollback

# Railway - Redeploy previous commit
# (Use Railway dashboard)

# Database - Restore backup
# (Use Supabase dashboard → Backups)
```

---

## 📈 Scaling Considerations

### When to Scale

- \> 10,000 users
- \> 100 requests/second
- Database queries slow
- Event listener lagging

### Scaling Options

1. **Frontend**: Vercel auto-scales
2. **Backend**: Add more Railway instances
3. **Database**: Upgrade Supabase plan
4. **Contract**: Already scales on blockchain

---

## ✅ Production Checklist

- [ ] Smart contract deployed and verified
- [ ] Supabase database set up with schema
- [ ] Environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics integrated
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Documentation complete
- [ ] Team trained
- [ ] Support channels ready
- [ ] Marketing materials prepared
- [ ] Launch announcement scheduled

---

## 🎊 You're Live!

Congratulations! Your Habit Platform is now live in production! 🚀

**Next Steps:**
1. Monitor the first few users
2. Collect feedback
3. Iterate and improve
4. Scale as needed

**Remember:**
- Keep environment variables secure
- Monitor errors and performance
- Back up your database regularly
- Update dependencies periodically
- Engage with your community

---

**Turn Habits Into Hustle!** 💪
