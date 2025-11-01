#!/bin/bash

echo "🚀 Habit Platform - Aptos Migration Installation"
echo "=================================================="
echo ""

# Step 1: Remove old dependencies
echo "📦 Step 1/4: Removing EVM dependencies..."
npm uninstall wagmi @rainbow-me/rainbowkit viem

# Step 2: Install Aptos dependencies
echo "📦 Step 2/4: Installing Aptos dependencies..."
npm install @aptos-labs/ts-sdk@latest
npm install @aptos-labs/wallet-adapter-react@latest
npm install @aptos-labs/wallet-adapter-ant-design@latest
npm install petra-plugin-wallet-adapter@latest
npm install martian-wallet-adapter@latest
npm install pontem-wallet-adapter@latest

# Step 3: Verify installation
echo "✅ Step 3/4: Verifying installation..."
npm list @aptos-labs/ts-sdk

# Step 4: Info
echo "✅ Step 4/4: Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Install Aptos CLI: https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli"
echo "2. Install Petra Wallet: https://petra.app"
echo "3. Deploy Move contract: cd move && aptos move publish"
echo "4. Update .env with MODULE_ADDRESS"
echo "5. Run: npm run dev"
echo ""
echo "📖 See APTOS_MIGRATION_GUIDE.md for complete instructions"
echo ""
