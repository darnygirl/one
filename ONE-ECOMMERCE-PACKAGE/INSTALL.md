# 📦 Installation Guide

**Complete step-by-step installation for ONE E-Commerce Package**

---

## Prerequisites

- Astro project (4.x or 5.x)
- React configured in Astro
- Tailwind CSS installed
- Bun or npm package manager

---

## Installation Steps

### Step 1: Copy Package Files

From the root of your Astro project:

```bash
# Copy all source files
cp -r ONE-ECOMMERCE-PACKAGE/src/components src/
cp -r ONE-ECOMMERCE-PACKAGE/src/pages src/
cp -r ONE-ECOMMERCE-PACKAGE/src/hooks src/
cp -r ONE-ECOMMERCE-PACKAGE/src/lib src/
cp -r ONE-ECOMMERCE-PACKAGE/src/layouts src/
```

Your project structure will now look like:

```
your-astro-project/
├── src/
│   ├── components/
│   │   ├── shop/          ← New
│   │   └── web3/          ← New
│   ├── pages/
│   │   └── shop/          ← New
│   ├── hooks/             ← New
│   ├── lib/
│   │   └── web3/          ← New
│   └── layouts/
│       └── ShopLayout.astro ← New
```

---

### Step 2: Install Dependencies

#### Core Dependencies (Required)

```bash
bun add stripe
```

#### X402 Dependencies (Optional - for crypto payments)

```bash
bun add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

#### Verify Installation

```bash
bun run build
```

If build succeeds, dependencies are correctly installed.

---

### Step 3: Environment Configuration

#### Create `.env` file

```bash
cp ONE-ECOMMERCE-PACKAGE/.env.example .env
```

#### Add Your Credentials

Edit `.env`:

```bash
# Stripe (Required for card payments)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# X402 (Optional for crypto payments)
PUBLIC_X402_ENABLED=true
PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
PUBLIC_X402_RECIPIENT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

**Where to get credentials:**

1. **Stripe Keys**: https://dashboard.stripe.com/apikeys
2. **WalletConnect ID**: https://cloud.walletconnect.com/
3. **Recipient Address**: Your Ethereum/Base wallet address

---

### Step 4: Configure Astro

#### Update `astro.config.mjs`

Ensure React is configured:

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind(),
  ],
  output: 'server', // or 'hybrid' if you need SSR
});
```

#### Update `tsconfig.json`

Add path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Step 5: Verify Installation

#### Start Development Server

```bash
bun run dev
```

#### Test Pages

Visit these URLs:

- http://localhost:4321/shop/marketplace - Product listing
- http://localhost:4321/shop/checkout - Checkout page
- http://localhost:4321/shop/product-landing - Product template

#### Expected Behavior

- **Without Stripe keys**: "No Payment Methods Configured" message
- **With Stripe keys**: Stripe payment option appears
- **With X402 enabled**: Crypto payment option appears

---

## 🎯 Installation Variations

### Stripe Only (No Crypto)

```bash
# Step 1: Copy files (skip web3)
cp -r ONE-ECOMMERCE-PACKAGE/src/components/shop src/components/
cp -r ONE-ECOMMERCE-PACKAGE/src/pages src/
cp -r ONE-ECOMMERCE-PACKAGE/src/layouts src/

# Step 2: Install dependencies
bun add stripe

# Step 3: Configure .env
STRIPE_SECRET_KEY=sk_test_xxxxx
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
# Don't set PUBLIC_X402_ENABLED
```

### X402 Only (No Stripe)

```bash
# Step 1: Copy files
cp -r ONE-ECOMMERCE-PACKAGE/src/components/web3 src/components/
cp -r ONE-ECOMMERCE-PACKAGE/src/hooks src/
cp -r ONE-ECOMMERCE-PACKAGE/src/lib src/

# Step 2: Install dependencies
bun add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit

# Step 3: Configure .env
PUBLIC_X402_ENABLED=true
PUBLIC_WALLETCONNECT_PROJECT_ID=xxxxx
PUBLIC_X402_RECIPIENT_ADDRESS=0xYourAddress
# Don't set STRIPE keys
```

### Components Only

For custom integrations:

```bash
# Copy only what you need
cp ONE-ECOMMERCE-PACKAGE/src/components/web3/ImprovedX402PaymentButton.tsx src/components/
cp ONE-ECOMMERCE-PACKAGE/src/hooks/useX402Payment.ts src/hooks/
cp ONE-ECOMMERCE-PACKAGE/src/lib/web3/config.ts src/lib/web3/
```

---

## 🔧 Configuration Options

### Customizing Payment Recipient

Change where payments go:

```bash
# .env
PUBLIC_X402_RECIPIENT_ADDRESS=0xYOUR_TREASURY_WALLET
```

### Customizing Networks

Edit `src/lib/web3/config.ts`:

```typescript
export const config = createConfig({
  chains: [base, baseSepolia], // Add more chains here
  // ...
});
```

### Customizing Styling

All components accept `className`:

```tsx
<ImprovedX402PaymentButton
  className="your-custom-class"
/>
```

Or edit the components directly - they're yours now!

---

## 🐛 Troubleshooting

### Issue: "Module not found: @/components/..."

**Solution**: Check `tsconfig.json` has path aliases:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

### Issue: "stripe is not defined"

**Solution**: Install Stripe:

```bash
bun add stripe
```

### Issue: "wagmi hooks can only be used inside WagmiProvider"

**Solution**: Wrap your app with `Web3Provider`:

```tsx
import { Web3Provider } from '@/components/web3/Web3Provider';

<Web3Provider>
  <YourApp />
</Web3Provider>
```

### Issue: Build fails with React errors

**Solution**: Ensure React integration in `astro.config.mjs`:

```javascript
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
});
```

### Issue: Styles not applying

**Solution**: Ensure Tailwind is configured and components have `client:load`:

```astro
<YourComponent client:load />
```

---

## 🚀 Next Steps

1. **Test** with Stripe test cards (see `docs/STRIPE-SETUP.md`)
2. **Customize** components for your brand
3. **Read** `docs/EXAMPLES.md` for usage patterns
4. **Deploy** to production (see `docs/DEPLOYMENT.md`)

---

## 📚 Additional Resources

- **QUICK-START.md** - Get started in 5 minutes
- **docs/STRIPE-SETUP.md** - Detailed Stripe guide
- **docs/X402-SETUP.md** - Crypto payment setup
- **docs/EXAMPLES.md** - Code examples

---

## ✅ Installation Checklist

- [ ] Files copied to `src/`
- [ ] Dependencies installed
- [ ] `.env` configured with keys
- [ ] `astro.config.mjs` has React integration
- [ ] `tsconfig.json` has path aliases
- [ ] Dev server starts without errors
- [ ] Shop pages load correctly
- [ ] Payment methods appear in checkout
- [ ] Test transaction completed successfully

---

**Need help?** Check the `docs/` folder or refer to the troubleshooting section above.

**Ready to customize?** All components are in `src/components/` - edit freely!
