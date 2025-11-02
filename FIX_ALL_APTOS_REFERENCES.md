# 🔧 FIX ALL REMAINING APTOS REFERENCES

## ✅ FILES ALREADY FIXED
- ✅ App.jsx
- ✅ WalletProvider.tsx
- ✅ WalletSelector.jsx
- ✅ Layout.jsx
- ✅ DebugInfo.jsx

## ⚠️ FILES THAT NEED SIMPLE FIND & REPLACE

All these files just need these 3 replacements:

### **FIND:**
```javascript
import { useWallet } from '@aptos-labs/wallet-adapter-react';
```

### **REPLACE WITH:**
```javascript
import { useAccount } from 'wagmi';
```

---

### **FIND:**
```javascript
const { connected, account } = useWallet();
const address = account?.address;
```

### **REPLACE WITH:**
```javascript
const { address, isConnected } = useAccount();
```

---

### **FIND:**
```javascript
connected
```

### **REPLACE WITH:**
```javascript
isConnected
```

---

## 📁 FILES TO FIX (11 files)

### **Pages:**
1. `src/pages/Landing.jsx`
2. `src/pages/Dashboard.jsx`
3. `src/pages/Profile.jsx`
4. `src/pages/Settings.jsx`
5. `src/pages/Chats.jsx`
6. `src/pages/Leaderboard.jsx`
7. `src/pages/ManageStakes.jsx`

### **Onboarding:**
8. `src/pages/onboarding/RoleSelection.jsx`
9. `src/pages/onboarding/ProfileSetup.jsx`
10. `src/pages/onboarding/RoleDetails.jsx`
11. `src/pages/onboarding/Socials.jsx`
12. `src/pages/onboarding/HabitsGoals.jsx`

---

## 🚀 AUTO-FIX COMMAND (PowerShell)

Run this command in your project root:

```powershell
# Fix all files automatically
$files = @(
    "src/pages/Landing.jsx",
    "src/pages/Dashboard.jsx",
    "src/pages/Profile.jsx",
    "src/pages/Settings.jsx",
    "src/pages/Chats.jsx",
    "src/pages/Leaderboard.jsx",
    "src/pages/ManageStakes.jsx",
    "src/pages/onboarding/RoleSelection.jsx",
    "src/pages/onboarding/ProfileSetup.jsx",
    "src/pages/onboarding/RoleDetails.jsx",
    "src/pages/onboarding/Socials.jsx",
    "src/pages/onboarding/HabitsGoals.jsx"
)

foreach ($file in $files) {
    $fullPath = "c:\Users\Acer\OneDrive\ドキュメント\hackathon project\$file"
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Replace import
        $content = $content -replace "import { useWallet } from '@aptos-labs/wallet-adapter-react';", "import { useAccount } from 'wagmi';"
        
        # Replace usage
        $content = $content -replace "const \{ connected, account \} = useWallet\(\);[\s\S]*?const address = account\?\.address;", "const { address, isConnected } = useAccount();"
        
        # Replace connected variable
        $content = $content -replace "\bconnected\b", "isConnected"
        
        # Save
        $content | Set-Content $fullPath -NoNewline
        Write-Host "✅ Fixed: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 All files fixed!" -ForegroundColor Cyan
```

---

## 🎯 AFTER RUNNING THE FIX

1. Restart dev server
2. Check for any remaining errors
3. Test wallet connection

**Your dApp will be fully on Base!** 🚀
