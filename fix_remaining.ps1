$files = @(
    "src\pages\Dashboard.jsx",
    "src\pages\Profile.jsx",
    "src\pages\Settings.jsx",
    "src\pages\Chats.jsx",
    "src\pages\Leaderboard.jsx",
    "src\pages\ManageStakes.jsx",
    "src\pages\onboarding\RoleSelection.jsx",
    "src\pages\onboarding\ProfileSetup.jsx",
    "src\pages\onboarding\RoleDetails.jsx",
    "src\pages\onboarding\Socials.jsx",
    "src\pages\onboarding\HabitsGoals.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "import { useWallet } from '@aptos-labs/wallet-adapter-react';", "import { useAccount } from 'wagmi';"
        $content = $content -replace "const \{ connected, account \} = useWallet\(\);[\s\n\r\t]*const address = account\?\.address;", "const { address, isConnected } = useAccount();"
        $content = $content -replace '\bconnected\b', 'isConnected'
        Set-Content $file $content -NoNewline
        Write-Host "✅ Fixed: $file"
    }
}
Write-Host "`n🎉 All files fixed!"